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

| Hook         | Runs                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| `pre-commit` | ESLint and Prettier on staged files; unit tests related to staged source files          |
| `commit-msg` | commitlint                                                                              |
| `pre-push`   | Branch-name check, blocks direct pushes to `main`, then type-check, lint and unit tests |

Hooks are installed by `npm install` (the `prepare` script). Do not bypass them with `--no-verify`; CI runs
the same checks.

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
