# Contributing

## Setup

```bash
nvm use            # Node version from .nvmrc
npm install        # also installs the Git hooks
cp .env.example .env.local
npm run dev
```

## Branches

| Branch                 | Purpose                                                                          |
| ---------------------- | -------------------------------------------------------------------------------- |
| `main`                 | Production. Changes only via pull request from `develop` or a `hotfix/*` branch. |
| `develop`              | Integration branch. Feature branches merge here.                                 |
| `<type>/<description>` | Short-lived work branches, e.g. `feat/sermon-archive`, `fix/header-contrast`.    |

Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `ci`, `build`, `release`, `hotfix`.

Typical flow:

```bash
git switch develop && git pull
git switch -c feat/sermon-archive
# ...work, commit...
git push -u origin feat/sermon-archive
# open a pull request into develop
```

To release, open a pull request from `develop` into `main`. After it merges, the Release workflow opens a
release pull request that bumps the version and updates `CHANGELOG.md`. Merging that pull request tags the
release.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org) and are checked by the
`commit-msg` hook:

```
<type>(<scope>): <summary>

feat(blocks): add sermon series header
fix(layout): stop footer links wrapping at 360px
chore(deps): update radix packages
```

Scopes are optional and kebab-case. Common scopes: `ui`, `layout`, `blocks`, `theme`, `pages`, `config`,
`deps`, `ci`, `hooks`, `tests`, `docs`.

## Git hooks

The hooks are plain shell scripts versioned in [`.githooks/`](.githooks). No hook framework is used:
`npm install` runs `scripts/githooks.mjs`, which sets `git config core.hooksPath .githooks`. It does
nothing in CI or outside a Git checkout.

```
.githooks/
  pre-commit            Policy checks on staged changes, then lint-staged
  commit-msg            Conventional Commits (commitlint)
  pre-push              Push policy per branch, then the checks CI runs
  lib/policy.sh         All rules: protected branches, branch types, size limit, forbidden paths
  lib/checks.sh         The checks as shell functions
  lib/common.sh         Runtime: Node discovery, step runner, output, skipping
  lib/secret-patterns.txt
  lib/check-lockfile.mjs
```

To change a rule, edit `lib/policy.sh`. Every check is covered by `scripts/githooks.test.ts`, which runs
the real hooks against temporary repositories.

### What runs

| Hook         | Step id            | Check                                                                            |
| ------------ | ------------------ | -------------------------------------------------------------------------------- |
| `pre-commit` | `protected-branch` | No commits directly on `main`                                                    |
|              | `forbidden-files`  | No `.env*` (except `.env.example`), `*.pem`, `*.key` or other credential files   |
|              | `conflict-markers` | No unresolved `<<<<<<<` / `>>>>>>>` markers                                      |
|              | `secrets`          | No API keys or tokens (AWS, GitHub, Stripe, Paystack, Flutterwave, Google, etc.) |
|              | `file-size`        | No file over 1 MB; use a CDN or Git LFS for media                                |
|              | `lockfile`         | Dependency changes in `package.json` include `package-lock.json`                 |
|              | `lint-staged`      | ESLint and Prettier on staged files, and unit tests related to them              |
| `commit-msg` | `commitlint`       | Conventional Commits format                                                      |
| `pre-push`   | `push-policy`      | No pushes to `main`; no force-push or delete of `main`/`develop`; branch naming  |
|              | `format`           | `npm run format:check`                                                           |
|              | `lint`             | `npm run lint`                                                                   |
|              | `typecheck`        | `npm run typecheck`                                                              |
|              | `tests`            | `npm test`                                                                       |

Checks run quietly and print one line each. Output is shown only when a check fails.

### Skipping a step

When a step genuinely does not apply, skip that step by id rather than disabling all hooks:

```bash
GITHOOKS_SKIP=tests git push                # one step
GITHOOKS_SKIP=lint-staged,secrets git commit ...
GITHOOKS_SKIP=pre-push git push             # a whole hook
```

Administrators can push to `main` in an emergency with `GITHOOKS_SKIP=push-policy`. CI and branch
protection still apply, so skipping locally never skips review.

### Commands and troubleshooting

```bash
npm run hooks:status      # show whether hooks are installed and executable
npm run hooks:install     # (re)install
npm run hooks:uninstall   # restore Git's default hooks directory
GITHOOKS_VERBOSE=1 git commit ...   # stream all output and trace the hook
```

- **"Node.js was not found"** from a Git GUI or editor: the hooks look for Node in nvm, Volta, fnm, asdf,
  mise and Homebrew. If yours is elsewhere, make it available on the PATH your Git client uses.
- **Hooks not running:** run `npm run hooks:status`. Another tool may have changed `core.hooksPath`.
- **Set `GITHOOKS_DISABLE=1`** before `npm install` to skip hook installation, e.g. on a build server
  that is not detected as CI.

## Checks

```bash
npm run validate     # lint, format check, type-check, unit tests
npm run test:e2e     # production build + Playwright (phone, tablet, desktop, accessibility)
```

CI runs all of the above on every pull request, along with CodeQL, dependency review and a PR title check.

## Recommended GitHub settings

For `main` and `develop`, enable branch protection with:

- Require a pull request with at least one approval and review from code owners
- Require status checks: `Lint, types and unit tests`, `Build and end-to-end tests`, `Conventional Commit title`
- Require branches to be up to date before merging
- Require linear history (squash merge)
- Do not allow bypassing the above settings
