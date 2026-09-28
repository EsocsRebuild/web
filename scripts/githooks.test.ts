/**
 * Runs the real hooks in .githooks against throwaway repositories with a
 * local bare remote. Tool-heavy steps (lint-staged, type-check, tests) are
 * skipped via GITHOOKS_SKIP; they are covered by their own tools.
 *
 * A template repository is built once, then copied for each test so the
 * tests are isolated and can run concurrently.
 */
import { spawn } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_TOOLS = "lint-staged,format,lint,typecheck,tests";

// Git exports GIT_DIR, GIT_INDEX_FILE, etc. to hooks. If these tests run inside
// a hook (pre-push runs `npm test`), they would leak into the child `git`
// processes and act on the real repository.
const baseEnv: NodeJS.ProcessEnv = { ...process.env };
for (const key of Object.keys(baseEnv)) {
  if (key.startsWith("GIT_")) delete baseEnv[key];
}

interface Result {
  status: number;
  output: string;
}

let workspace: string;
let template: string;

function exec(
  cwd: string,
  command: string,
  args: string[],
  env: Record<string, string> = {},
): Promise<Result> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...baseEnv, NO_COLOR: "1", GITHOOKS_SKIP: SKIP_TOOLS, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => (output += chunk));
    child.stderr.on("data", (chunk: Buffer) => (output += chunk));
    child.on("error", reject);
    child.on("close", (code) => resolve({ status: code ?? 1, output }));
  });
}

/** A disposable clone of the template repository with helpers bound to it. */
function createRepo() {
  const root = mkdtempSync(path.join(workspace, "case-"));
  cpSync(template, root, { recursive: true, verbatimSymlinks: true });
  const dir = path.join(root, "repo");

  const git = (args: string[], env?: Record<string, string>) => exec(dir, "git", args, env);

  const gitOk = async (args: string[], env?: Record<string, string>) => {
    const result = await git(args, env);
    if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed:\n${result.output}`);
    return result.output.trim();
  };

  const write = (file: string, content: string | Buffer) => {
    const target = path.join(dir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  };

  const commit = async (file: string, content: string | Buffer, message = "feat: add change") => {
    write(file, content);
    await gitOk(["add", file]);
    return git(["commit", "-m", message]);
  };

  return { git, gitOk, write, commit };
}

beforeAll(async () => {
  workspace = mkdtempSync(path.join(tmpdir(), "githooks-test-"));
  template = path.join(workspace, "template");
  const repo = path.join(template, "repo");
  mkdirSync(repo, { recursive: true });

  const setup = async (cwd: string, ...args: string[]) => {
    const result = await exec(cwd, "git", args, { GITHOOKS_SKIP: "all" });
    if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed:\n${result.output}`);
  };

  await setup(template, "init", "--bare", "-q", "-b", "develop", "remote.git");

  cpSync(path.join(projectRoot, ".githooks"), path.join(repo, ".githooks"), { recursive: true });
  for (const file of [".nvmrc", "commitlint.config.mjs"]) {
    cpSync(path.join(projectRoot, file), path.join(repo, file));
  }
  symlinkSync(path.join(projectRoot, "node_modules"), path.join(repo, "node_modules"), "dir");
  writeFileSync(path.join(repo, ".gitignore"), "node_modules\n");
  writeFileSync(
    path.join(repo, "package.json"),
    JSON.stringify({ name: "fixture", dependencies: { a: "1.0.0" } }, null, 2),
  );
  writeFileSync(path.join(repo, "package-lock.json"), "{}\n");

  await setup(repo, "init", "-q", "-b", "develop");
  await setup(repo, "config", "user.name", "Test");
  await setup(repo, "config", "user.email", "test@example.com");
  await setup(repo, "config", "core.hooksPath", ".githooks");
  // Relative so the template stays valid after being copied.
  await setup(repo, "remote", "add", "origin", "../remote.git");
  await setup(repo, "add", ".");
  await setup(repo, "commit", "-q", "-m", "chore: initial commit");
  await setup(repo, "push", "-q", "origin", "develop");
});

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true });
});

describe.concurrent("pre-commit", () => {
  it("accepts a clean commit", async () => {
    const repo = createRepo();
    const result = await repo.commit("src/page.ts", "export const title = 'Home';\n");
    expect(result.status, result.output).toBe(0);
  });

  it("rejects commits on a protected branch", async () => {
    const repo = createRepo();
    await repo.gitOk(["switch", "-q", "-c", "main"]);
    const result = await repo.commit("src/page.ts", "export {};\n");
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/Commits on 'main' are not allowed/);
  });

  it("rejects environment files", async () => {
    const repo = createRepo();
    const result = await repo.commit(".env.local", "API_KEY=value\n");
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/\.env\.local/);
  });

  it("allows .env.example", async () => {
    const repo = createRepo();
    const result = await repo.commit(".env.example", "API_KEY=\n");
    expect(result.status, result.output).toBe(0);
  });

  it("rejects private key files in subdirectories", async () => {
    const repo = createRepo();
    const result = await repo.commit("certs/server.pem", "not really a key\n");
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/certs\/server\.pem/);
  });

  it("rejects added lines that look like credentials, without printing them", async () => {
    const repo = createRepo();
    const token = "AKIA" + "IOSFODNN7EXAMPLE";
    const result = await repo.commit("src/config.ts", `export const key = "${token}";\n`);
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/Possible secrets/);
    expect(result.output).toMatch(/src\/config\.ts/);
    expect(result.output).not.toContain(token);
  });

  it("rejects unresolved conflict markers", async () => {
    const repo = createRepo();
    const content = ["<".repeat(7) + " HEAD", "a", "=".repeat(7), "b", ">".repeat(7) + " branch", ""].join(
      "\n",
    );
    const result = await repo.commit("src/merge.ts", content);
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/conflict markers/);
  });

  it("rejects files over the size limit", async () => {
    const repo = createRepo();
    const result = await repo.commit("public/video.bin", Buffer.alloc(1100 * 1024, 1));
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/public\/video\.bin \(1100 KB\)/);
  });

  it("rejects dependency changes without the lockfile, and accepts them with it", async () => {
    const repo = createRepo();
    repo.write("package.json", JSON.stringify({ name: "fixture", dependencies: { a: "2.0.0" } }, null, 2));
    await repo.gitOk(["add", "package.json"]);
    const blocked = await repo.git(["commit", "-m", "chore(deps): bump a"]);
    expect(blocked.status).not.toBe(0);
    expect(blocked.output).toMatch(/package-lock\.json is not staged/);

    repo.write("package-lock.json", '{ "updated": true }\n');
    await repo.gitOk(["add", "package-lock.json"]);
    const allowed = await repo.git(["commit", "-m", "chore(deps): bump a"]);
    expect(allowed.status, allowed.output).toBe(0);
  });

  it("can bypass a single step explicitly", async () => {
    const repo = createRepo();
    repo.write(".env", "SECRET=1\n");
    await repo.gitOk(["add", ".env"]);
    const result = await repo.git(["commit", "-m", "chore: add env"], {
      GITHOOKS_SKIP: `${SKIP_TOOLS},forbidden-files`,
    });
    expect(result.status, result.output).toBe(0);
    expect(result.output).toMatch(/skipped \(GITHOOKS_SKIP=forbidden-files\)/);
  });
});

describe.concurrent("commit-msg", () => {
  it("rejects messages that are not Conventional Commits", async () => {
    const repo = createRepo();
    const result = await repo.commit("src/a.ts", "export {};\n", "fix");
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/Conventional Commits/);
  });

  it("accepts Conventional Commits with a scope", async () => {
    const repo = createRepo();
    const result = await repo.commit("src/a.ts", "export {};\n", "feat(blocks): add sermon series header");
    expect(result.status, result.output).toBe(0);
  });
});

describe.concurrent("pre-push", () => {
  it("pushes a correctly named work branch", async () => {
    const repo = createRepo();
    await repo.gitOk(["switch", "-q", "-c", "feat/sermon-archive"]);
    await repo.commit("src/a.ts", "export {};\n");
    const result = await repo.git(["push", "origin", "feat/sermon-archive"]);
    expect(result.status, result.output).toBe(0);
    expect(result.output).toMatch(/Push policy/);
  });

  it("rejects direct pushes to a protected branch", async () => {
    const repo = createRepo();
    const result = await repo.git(["push", "origin", "develop:main"]);
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/'main' only changes through pull requests/);
  });

  it("rejects branch names that break the convention", async () => {
    const repo = createRepo();
    await repo.gitOk(["switch", "-q", "-c", "MyBranch"]);
    const result = await repo.git(["push", "origin", "MyBranch"]);
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/does not follow the naming convention/);
  });

  it("rejects force-pushing a long-lived branch", async () => {
    const repo = createRepo();
    await repo.commit("src/a.ts", "export {};\n");
    await repo.gitOk(["push", "-q", "origin", "develop"], { GITHOOKS_SKIP: "all" });
    await repo.gitOk(["reset", "-q", "--hard", "HEAD~1"]);
    await repo.commit("src/b.ts", "export {};\n");
    const result = await repo.git(["push", "--force", "origin", "develop"]);
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/Force-pushing 'develop' is not allowed/);
  });

  it("rejects deleting a long-lived branch", async () => {
    const repo = createRepo();
    const result = await repo.git(["push", "origin", "--delete", "develop"]);
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/Deleting 'develop'/);
  });

  it("allows deleting a work branch without running the quality checks", async () => {
    const repo = createRepo();
    await repo.gitOk(["push", "-q", "origin", "develop:feat/old"], { GITHOOKS_SKIP: "all" });
    const result = await repo.git(["push", "origin", "--delete", "feat/old"], { GITHOOKS_SKIP: "" });
    expect(result.status, result.output).toBe(0);
    expect(result.output).not.toMatch(/Unit tests/);
  });

  it("lets administrators override the push policy explicitly", async () => {
    const repo = createRepo();
    const result = await repo.git(["push", "origin", "develop:main"], {
      GITHOOKS_SKIP: `${SKIP_TOOLS},push-policy`,
    });
    expect(result.status, result.output).toBe(0);
    expect(result.output).toMatch(/Push policy skipped/);
  });
});
