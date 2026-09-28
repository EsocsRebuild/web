# shellcheck shell=sh
#
# Shared runtime for the Git hooks in this directory. Sourced by each hook,
# never executed directly. POSIX sh only: hooks also run under dash and
# Git for Windows.
#
# Environment:
#   GITHOOKS_SKIP     Comma-separated hook names or step ids to skip, or "all".
#                     e.g. GITHOOKS_SKIP=tests git push
#   GITHOOKS_VERBOSE  Set to 1 to stream every step's output and trace commands.
#   NO_COLOR          Disable coloured output.

set -eu

HOOK_NAME=$(basename "$0")
HOOKS_DIR=$(cd "$(dirname "$0")" && pwd -P)
PROJECT_ROOT=$(dirname "$HOOKS_DIR")
LIB_DIR="$HOOKS_DIR/lib"

# shellcheck source=policy.sh
. "$LIB_DIR/policy.sh"

[ "${GITHOOKS_VERBOSE:-0}" = "1" ] && set -x

# ---------------------------------------------------------------------------
# Output (all diagnostics go to stderr, which Git forwards to the user)
# ---------------------------------------------------------------------------

if [ -t 2 ] && [ -z "${NO_COLOR:-}" ]; then
  C_RED=$(printf '\033[31m')
  C_GREEN=$(printf '\033[32m')
  C_YELLOW=$(printf '\033[33m')
  C_DIM=$(printf '\033[2m')
  C_BOLD=$(printf '\033[1m')
  C_RESET=$(printf '\033[0m')
  # Keep colours in tool output even though we capture it.
  FORCE_COLOR=${FORCE_COLOR:-1}
  export FORCE_COLOR
else
  C_RED='' C_GREEN='' C_YELLOW='' C_DIM='' C_BOLD='' C_RESET=''
fi

info() { printf '%s•%s %s\n' "$C_DIM" "$C_RESET" "$*" >&2; }
ok() { printf '%s✔%s %s\n' "$C_GREEN" "$C_RESET" "$*" >&2; }
warn() { printf '%s!%s %s\n' "$C_YELLOW" "$C_RESET" "$*" >&2; }
fail() { printf '%s✖ %s%s\n' "$C_RED" "$*" "$C_RESET" >&2; }
hint() { printf '  %s\n' "$*" >&2; }

# die <message> [hint...]
die() {
  fail "$1"
  shift
  for _line in "$@"; do hint "$_line"; done
  exit 1
}

# ---------------------------------------------------------------------------
# Skipping
# ---------------------------------------------------------------------------

# is_skipped <hook-name-or-step-id>
is_skipped() {
  case ",${GITHOOKS_SKIP:-}," in
    *",all,"* | *",$1,"*) return 0 ;;
  esac
  return 1
}

# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------

GITHOOKS_TMP=''

cleanup() {
  [ -n "$GITHOOKS_TMP" ] && rm -rf "$GITHOOKS_TMP"
  return 0
}

# Call first in every hook.
hook_start() {
  if is_skipped "$HOOK_NAME"; then
    warn "$HOOK_NAME skipped (GITHOOKS_SKIP)"
    exit 0
  fi
  trap cleanup EXIT
  trap 'exit 130' INT TERM
  cd "$PROJECT_ROOT"
  printf '%s%s%s\n' "$C_BOLD" "$HOOK_NAME" "$C_RESET" >&2
}

tmp_file() {
  [ -n "$GITHOOKS_TMP" ] || GITHOOKS_TMP=$(mktemp -d "${TMPDIR:-/tmp}/githooks.XXXXXX")
  mktemp "$GITHOOKS_TMP/step.XXXXXX"
}

# ---------------------------------------------------------------------------
# Steps
# ---------------------------------------------------------------------------

# run_step <id> <label> <command> [args...]
#
# Runs a command quietly and prints a single status line. Output is shown
# only on failure (or always with GITHOOKS_VERBOSE=1). Set STEP_HINT before
# calling to print extra guidance on failure.
run_step() {
  _id=$1
  _label=$2
  shift 2
  _hint=${STEP_HINT:-}
  STEP_HINT=''

  if is_skipped "$_id"; then
    warn "$_label skipped (GITHOOKS_SKIP=$_id)"
    return 0
  fi

  _started=$(date +%s)
  if [ "${GITHOOKS_VERBOSE:-0}" = "1" ]; then
    info "$_label"
    if "$@"; then _status=0; else _status=$?; fi
  else
    _log=$(tmp_file)
    if "$@" >"$_log" 2>&1; then _status=0; else _status=$?; fi
  fi
  _elapsed=$(($(date +%s) - _started))

  if [ "$_status" -eq 0 ]; then
    ok "$_label ${C_DIM}${_elapsed}s${C_RESET}"
    return 0
  fi

  fail "$_label"
  [ "${GITHOOKS_VERBOSE:-0}" = "1" ] || sed 's/^/  /' "$_log" >&2
  [ -n "$_hint" ] && hint "$_hint"
  hint "${C_DIM}Bypass this step once (use sparingly): GITHOOKS_SKIP=$_id${C_RESET}"
  exit 1
}

# run_live_step <id> <label> <command> [args...]
#
# For tools with their own progress output (lint-staged). Streams output.
run_live_step() {
  _id=$1
  _label=$2
  shift 2

  if is_skipped "$_id"; then
    warn "$_label skipped (GITHOOKS_SKIP=$_id)"
    return 0
  fi

  info "$_label"
  if "$@"; then
    ok "$_label"
  else
    fail "$_label"
    hint "${C_DIM}Bypass this step once (use sparingly): GITHOOKS_SKIP=$_id${C_RESET}"
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Toolchain
# ---------------------------------------------------------------------------

# Git GUIs and editors often launch hooks with a minimal PATH that lacks the
# user's Node version manager. Find Node without relying on shell profiles.
ensure_node() {
  if ! command -v node >/dev/null 2>&1; then
    for _dir in \
      "$HOME/.volta/bin" \
      "$HOME/.local/share/fnm/aliases/default/bin" \
      "$HOME/.local/share/mise/shims" \
      "$HOME/.asdf/shims" \
      /opt/homebrew/bin \
      /usr/local/bin; do
      if [ -x "$_dir/node" ]; then
        PATH="$_dir:$PATH"
        break
      fi
    done
  fi

  if ! command -v node >/dev/null 2>&1; then
    _nvm_versions="${NVM_DIR:-$HOME/.nvm}/versions/node"
    _wanted=$(cat "$PROJECT_ROOT/.nvmrc" 2>/dev/null || true)
    _node_dir=$(find_nvm_version "$_nvm_versions" "$_wanted")
    [ -n "$_node_dir" ] && PATH="$_node_dir/bin:$PATH"
  fi

  export PATH
  command -v node >/dev/null 2>&1 ||
    die "Node.js was not found." \
      "Install the version in .nvmrc, or make node available on the PATH used by your Git client."

  _required=$(sed 's/^v//; s/\..*//' "$PROJECT_ROOT/.nvmrc" 2>/dev/null || echo 0)
  _actual=$(node -p 'process.versions.node.split(".")[0]')
  if [ "$_actual" -lt "$_required" ] 2>/dev/null; then
    warn "Node $_actual is older than the project's Node $_required (.nvmrc). Results may differ from CI."
  fi
}

# find_nvm_version <versions-dir> <wanted-major-or-version>
# Prints the newest installed nvm version matching <wanted>, or the newest overall.
find_nvm_version() {
  [ -d "$1" ] || return 0
  # Directory names look like v24.3.1; sort numerically on each component.
  _versions=$(
    for _path in "$1"/v[0-9]*; do
      [ -d "$_path" ] && basename "$_path"
    done | sort -t. -k1.2,1n -k2,2n -k3,3n
  )
  _match=''
  if [ -n "$2" ]; then
    _match=$(printf '%s\n' "$_versions" | grep "^v${2#v}\." | tail -n 1 || true)
  fi
  [ -n "$_match" ] || _match=$(printf '%s\n' "$_versions" | tail -n 1)
  [ -n "$_match" ] && printf '%s' "$1/$_match"
  return 0
}

ensure_dependencies() {
  [ -d "$PROJECT_ROOT/node_modules" ] ||
    die "Dependencies are not installed." "Run: npm install"
}

# bin <name> [args...] — run a locally installed CLI without npx overhead.
bin() {
  _bin="$PROJECT_ROOT/node_modules/.bin/$1"
  shift
  [ -x "$_bin" ] || die "Missing local tool: $(basename "$_bin")" "Run: npm install"
  "$_bin" "$@"
}

# npm_script <name> — run a package.json script without npm's banner.
npm_script() {
  npm run --silent "$1"
}

# ---------------------------------------------------------------------------
# Git helpers
# ---------------------------------------------------------------------------

# True for the all-zero object id Git uses for "no commit" (SHA-1 or SHA-256).
is_null_sha() {
  case $1 in
    *[!0]*) return 1 ;;
  esac
  return 0
}

current_branch() {
  git symbolic-ref --short -q HEAD || true
}

# Newline-separated staged paths (added, copied, modified, renamed).
staged_files() {
  git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMR
}
