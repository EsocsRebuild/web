#!/usr/bin/env node
/**
 * Manages the versioned Git hooks in .githooks by pointing Git's
 * core.hooksPath at them. No third-party hook framework is involved.
 *
 *   node scripts/githooks.mjs install     Run automatically by `npm install` (prepare)
 *   node scripts/githooks.mjs uninstall   Restore Git's default hooks directory
 *   node scripts/githooks.mjs status      Report the current setup; exits 1 if not installed
 *
 * `install` is a no-op in CI, outside a Git work tree, or with GITHOOKS_DISABLE=1,
 * so `npm ci` in Docker images and pipelines never fails because of it.
 */
import { execFileSync } from "node:child_process";
import { accessSync, chmodSync, constants, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hooksDir = path.join(projectRoot, ".githooks");
const LEGACY_HOOK_PATHS = [".husky", ".husky/_"];

function git(...args) {
  return execFileSync("git", args, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function tryGit(...args) {
  try {
    return git(...args);
  } catch {
    return null;
  }
}

function log(message) {
  console.log(`githooks: ${message}`);
}

/** Hook entry points: executable files at the top level of .githooks. */
function hookFiles() {
  return readdirSync(hooksDir).filter((name) => {
    const file = path.join(hooksDir, name);
    return !name.startsWith(".") && statSync(file).isFile();
  });
}

function isExecutable(file) {
  try {
    accessSync(file, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/** core.hooksPath value, relative to the repository root as Git expects. */
function expectedHooksPath(repoRoot) {
  return path.relative(repoRoot, hooksDir).split(path.sep).join("/");
}

function install() {
  if (process.env.CI || process.env.GITHOOKS_DISABLE === "1") {
    log("skipped (CI or GITHOOKS_DISABLE=1)");
    return;
  }

  const repoRoot = tryGit("rev-parse", "--show-toplevel");
  if (!repoRoot) {
    log("skipped (not a Git work tree)");
    return;
  }

  if (!existsSync(hooksDir)) {
    throw new Error(`hooks directory not found: ${hooksDir}`);
  }

  // Git ignores hooks without the executable bit (e.g. after a zip download).
  if (process.platform !== "win32") {
    for (const name of hookFiles()) chmodSync(path.join(hooksDir, name), 0o755);
  }

  const wanted = expectedHooksPath(repoRoot);
  const previous = tryGit("config", "--local", "--get", "core.hooksPath");
  if (previous === wanted) {
    log(`up to date (core.hooksPath=${wanted})`);
    return;
  }

  git("config", "--local", "core.hooksPath", wanted);
  if (previous && LEGACY_HOOK_PATHS.includes(previous)) {
    log(`migrated from ${previous} to ${wanted}`);
  } else if (previous) {
    log(`replaced core.hooksPath=${previous} with ${wanted}`);
  } else {
    log(`installed (core.hooksPath=${wanted})`);
  }
}

function uninstall() {
  const current = tryGit("config", "--local", "--get", "core.hooksPath");
  if (!current) {
    log("not installed");
    return;
  }
  git("config", "--local", "--unset", "core.hooksPath");
  log(`removed core.hooksPath=${current}`);
}

function status() {
  const repoRoot = tryGit("rev-parse", "--show-toplevel");
  if (!repoRoot) {
    log("not a Git work tree");
    return 1;
  }

  const wanted = expectedHooksPath(repoRoot);
  const current = tryGit("config", "--local", "--get", "core.hooksPath");
  const installed = current === wanted;

  console.log(`core.hooksPath  ${current ?? "(unset)"}${installed ? "" : `  (expected ${wanted})`}`);
  for (const name of hookFiles()) {
    const executable = isExecutable(path.join(hooksDir, name));
    console.log(`${name.padEnd(15)} ${executable ? "executable" : "NOT executable"}`);
  }

  if (!installed) {
    console.log("\nRun: npm run hooks:install");
    return 1;
  }
  return 0;
}

const command = process.argv[2] ?? "install";
const commands = { install, uninstall, status };

if (!(command in commands)) {
  console.error(`Unknown command "${command}". Use: install | uninstall | status`);
  process.exit(2);
}

try {
  const code = commands[command]();
  process.exit(typeof code === "number" ? code : 0);
} catch (error) {
  // Never break `npm install` because of hook setup; report and continue.
  console.error(`githooks: ${command} failed: ${error instanceof Error ? error.message : error}`);
  process.exit(command === "install" ? 0 : 1);
}
