// Fails when dependency fields in the staged package.json differ from HEAD
// but package-lock.json is not staged, which would leave CI's `npm ci` broken.
import { execFileSync } from "node:child_process";

const FIELDS = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies", "overrides"];

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

function readJson(spec) {
  try {
    return JSON.parse(git("show", spec));
  } catch {
    return null;
  }
}

const staged = readJson(":package.json");
const head = readJson("HEAD:package.json");
if (!staged) process.exit(0);

const changed = FIELDS.filter(
  (field) => JSON.stringify(staged[field] ?? null) !== JSON.stringify(head?.[field] ?? null),
);
if (changed.length === 0) process.exit(0);

const stagedFiles = git("diff", "--cached", "--name-only").split("\n");
if (stagedFiles.includes("package-lock.json")) process.exit(0);

console.error(`package.json changed (${changed.join(", ")}) but package-lock.json is not staged.`);
console.error("Run `npm install`, then stage package-lock.json.");
process.exit(1);
