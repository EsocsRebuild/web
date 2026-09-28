# shellcheck shell=sh
# shellcheck disable=SC2034  # Variables are read by the hooks that source this file.
#
# Repository policy enforced by the Git hooks. Keep in step with
# CONTRIBUTING.md and the branch protection rules on GitHub.

# Branches that only change through pull requests: no direct pushes.
PROTECTED_BRANCHES="main"

# Long-lived branches: no local commits on protected ones, and never
# force-pushed or deleted from the remote.
LONG_LIVED_BRANCHES="main develop"

# Work branches are named <type>/<description>, e.g. feat/sermon-archive.
BRANCH_TYPES="feat fix chore docs refactor perf test build ci style revert release hotfix"
BRANCH_DESCRIPTION_REGEX='[a-z0-9][a-z0-9._-]*'

# Largest file that may be committed. Put photos and video in a CDN or Git LFS.
MAX_FILE_SIZE_KB=1024

# Paths that must never be committed (shell patterns; * also matches /).
FORBIDDEN_PATHS='.env .env.* */.env */.env.* *.pem *.key *.p12 *.pfx *id_rsa* *id_ed25519* *.keystore'

# Exceptions to FORBIDDEN_PATHS.
ALLOWED_PATHS='.env.example */.env.example'

# Files excluded from the secret scan (generated or known-safe).
SECRET_SCAN_EXCLUDE='package-lock.json .githooks/lib/secret-patterns.txt'
