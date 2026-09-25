#!/usr/bin/env node
/**
 * One-time setup for Docker Compose: creates the shared Server Functions
 * encryption key if it does not exist yet. Safe to run repeatedly.
 */
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const file = path.resolve(import.meta.dirname, "../deploy/secrets/server_actions_key");

if (existsSync(file)) {
  console.log(`Kept existing key: ${path.relative(process.cwd(), file)}`);
} else {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, randomBytes(32).toString("base64"), { mode: 0o600 });
  console.log(`Created key: ${path.relative(process.cwd(), file)}`);
}
