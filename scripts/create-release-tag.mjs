#!/usr/bin/env node
/**
 * Create the next sequential v0.N annotated tag on a commit.
 * Tag message: commit subject + newly completed predeployPHYSIS checkboxes since prior tag.
 *
 * Usage:
 *   node scripts/create-release-tag.mjs [--commit HEAD] [--version v0.23] [--dry-run]
 */

import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PREDEPLOY_PATHS = ["predeployPHYSIS.md", "predeployPHYSIS.txt"];

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function parseArgs(argv) {
  const options = {
    commit: "HEAD",
    version: null,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--commit") {
      options.commit = argv[++i] ?? "HEAD";
    } else if (arg === "--version") {
      options.version = argv[++i] ?? null;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: node scripts/create-release-tag.mjs [--commit REF] [--version v0.N] [--dry-run]`);
      process.exit(0);
    }
  }

  return options;
}

function parseTagNumber(tag) {
  const match = /^v0\.(\d+)$/.exec(tag);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function listVersionTags() {
  const output = runGit(["tag", "-l", "v0.*"]);
  if (!output) return [];
  return output.split("\n").filter(Boolean);
}

function getLatestVersionTag() {
  const tags = listVersionTags();
  if (tags.length === 0) return null;
  return tags.reduce((latest, tag) =>
    parseTagNumber(tag) > parseTagNumber(latest) ? tag : latest,
  );
}

function getNextVersionTag() {
  const latest = getLatestVersionTag();
  const nextNumber = latest ? parseTagNumber(latest) + 1 : 1;
  return `v0.${nextNumber}`;
}

function readPredeployAtRef(ref) {
  for (const path of PREDEPLOY_PATHS) {
    try {
      return runGit(["show", `${ref}:${path}`]);
    } catch {
      // try next path
    }
  }
  return "";
}

function parseCompletedItems(content) {
  const items = [];
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*- \[x\]\s*(.+)$/i);
    if (match) items.push(match[1].trim());
  }
  return items;
}

function getNewlyCompletedPredeployItems(fromRef, toRef) {
  const previous = new Set(parseCompletedItems(readPredeployAtRef(fromRef)));
  const current = parseCompletedItems(readPredeployAtRef(toRef));
  return current.filter((item) => !previous.has(item));
}

function getCommitSubject(commit) {
  return runGit(["log", "-1", "--format=%s", commit]);
}

function tagExists(tag) {
  try {
    execFileSync("git", ["rev-parse", `refs/tags/${tag}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function createAnnotatedTag(tag, commit, message, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] Would create tag ${tag} on ${commit}`);
    console.log(message);
    return;
  }

  const messageFile = join(tmpdir(), `physis-tag-${Date.now()}.txt`);
  try {
    writeFileSync(messageFile, message, "utf8");
    runGit(["tag", "-a", tag, "-F", messageFile, commit]);
  } finally {
    try {
      unlinkSync(messageFile);
    } catch {
      // ignore cleanup errors
    }
  }
}

function buildTagMessage(versionLabel, commitSubject, completedItems) {
  const lines = [`${versionLabel}: ${commitSubject}`];

  if (completedItems.length > 0) {
    lines.push("", "Predeploy completed since previous tag:");
    for (const item of completedItems) {
      lines.push(`- [x] ${item}`);
    }
  }

  return lines.join("\n");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const commit = runGit(["rev-parse", options.commit]);
  const commitShort = commit.slice(0, 7);
  const subject = getCommitSubject(commit);

  const tag = options.version ?? getNextVersionTag();
  if (!/^v0\.\d+$/.test(tag)) {
    console.error(`Invalid version tag "${tag}". Expected format v0.N`);
    process.exit(1);
  }

  if (tagExists(tag)) {
    console.error(`Tag ${tag} already exists. Pass --version to override explicitly.`);
    process.exit(1);
  }

  const previousTag = getLatestVersionTag();
  const baselineRef = previousTag ?? `${commit}^`;
  let completedItems = [];

  try {
    completedItems = getNewlyCompletedPredeployItems(baselineRef, commit);
  } catch (error) {
    console.warn(`Warning: could not diff predeploy checkboxes from ${baselineRef}: ${error.message}`);
  }

  const versionLabel = `Version ${tag.replace(/^v0\./, "0.")}`;
  const message = buildTagMessage(versionLabel, subject, completedItems);

  createAnnotatedTag(tag, commit, message, options.dryRun);

  if (!options.dryRun) {
    console.log(`Created tag ${tag} on ${commitShort}`);
    console.log(message);
  }
}

main();
