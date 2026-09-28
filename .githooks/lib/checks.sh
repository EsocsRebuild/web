# shellcheck shell=sh
#
# Individual checks used by the hooks. Each returns non-zero with a message
# on stderr when it fails, so it can be wrapped in run_step.

# ---------------------------------------------------------------------------
# Branches
# ---------------------------------------------------------------------------

# in_list <word> <space-separated list>
in_list() {
  for _item in $2; do
    [ "$_item" = "$1" ] && return 0
  done
  return 1
}

# valid_branch_name <name>
valid_branch_name() {
  in_list "$1" "$LONG_LIVED_BRANCHES" && return 0
  _types=$(printf '%s' "$BRANCH_TYPES" | tr ' ' '|')
  printf '%s\n' "$1" | grep -Eq "^($_types)/$BRANCH_DESCRIPTION_REGEX\$"
}

branch_naming_help() {
  echo "Name work branches <type>/<description>, e.g. feat/sermon-archive or fix/header-contrast."
  echo "Types: $BRANCH_TYPES"
}

# Refuse commits made directly on a protected branch.
check_not_on_protected_branch() {
  _branch=$(current_branch)
  [ -n "$_branch" ] || return 0
  if in_list "$_branch" "$PROTECTED_BRANCHES"; then
    echo "Commits on '$_branch' are not allowed; it only changes through pull requests."
    echo "Move your staged work to a new branch and commit there:"
    echo "  git switch -c feat/<description>"
    return 1
  fi
}

# ---------------------------------------------------------------------------
# Staged content
# ---------------------------------------------------------------------------

check_forbidden_paths() {
  _found=''
  _files=$(staged_files)
  _old_ifs=$IFS
  IFS='
'
  set -f # Patterns must not glob-expand against the working tree.
  for _file in $_files; do
    _allowed=0
    for _pattern in $(printf '%s' "$ALLOWED_PATHS" | tr ' ' '\n'); do
      # shellcheck disable=SC2254  # Pattern matching is intended.
      case $_file in $_pattern) _allowed=1 ;; esac
    done
    [ "$_allowed" -eq 1 ] && continue
    for _pattern in $(printf '%s' "$FORBIDDEN_PATHS" | tr ' ' '\n'); do
      # shellcheck disable=SC2254
      case $_file in $_pattern) _found="$_found  $_file
" ;;
      esac
    done
  done
  set +f
  IFS=$_old_ifs

  if [ -n "$_found" ]; then
    echo "These files may contain credentials and must not be committed:"
    printf '%s' "$_found"
    echo "Unstage them with: git restore --staged <file>"
    return 1
  fi
}

# Lines added by the staged changes, prefixed with "path:".
added_lines() {
  git -c core.quotePath=false diff --cached --no-color --no-ext-diff -U0 --diff-filter=ACMR |
    awk '
      /^\+\+\+ b\// { file = substr($0, 7); next }
      /^\+\+\+ /    { file = ""; next }
      /^\+/ && file != "" { print file ":" substr($0, 2) }
    '
}

check_conflict_markers() {
  _hits=$(added_lines | grep -E '^[^:]+:(<<<<<<<|>>>>>>>)( |$)' || true)
  if [ -n "$_hits" ]; then
    echo "Unresolved merge conflict markers:"
    printf '%s\n' "$_hits" | cut -c1-160 | sed 's/^/  /'
    return 1
  fi
}

check_secrets() {
  _hits=$(added_lines |
    awk -v list="$SECRET_SCAN_EXCLUDE" '
      BEGIN { n = split(list, skip, " ") }
      {
        path = substr($0, 1, index($0, ":") - 1)
        for (i = 1; i <= n; i++) if (path == skip[i]) next
        print
      }
    ' |
    grep -E -f "$LIB_DIR/secret-patterns.txt" || true)

  if [ -n "$_hits" ]; then
    echo "Possible secrets in staged changes:"
    # Show where, but mask the value itself.
    printf '%s\n' "$_hits" | cut -d: -f1 | sort -u | sed 's/^/  /'
    echo "Move credentials to .env.local (ignored by Git) and rotate any key that was exposed."
    return 1
  fi
}

check_file_sizes() {
  _limit=$((MAX_FILE_SIZE_KB * 1024))
  _found=''
  _files=$(git -c core.quotePath=false diff --cached --name-only --diff-filter=AM)
  _old_ifs=$IFS
  IFS='
'
  for _file in $_files; do
    _size=$(git cat-file -s ":$_file" 2>/dev/null || echo 0)
    if [ "$_size" -gt "$_limit" ]; then
      _found="$_found  $_file ($((_size / 1024)) KB)
"
    fi
  done
  IFS=$_old_ifs

  if [ -n "$_found" ]; then
    echo "Files larger than ${MAX_FILE_SIZE_KB} KB:"
    printf '%s' "$_found"
    echo "Optimise the asset, or host it on a CDN or with Git LFS."
    return 1
  fi
}

check_lockfile() {
  staged_files | grep -qx 'package.json' || return 0
  node "$LIB_DIR/check-lockfile.mjs"
}
