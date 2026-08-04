#!/usr/bin/env node
/**
 * Create the next annotated release tag using vMAJOR.MINOR.PATCH (e.g. v0.7.1).
 * Tag message: commit subject + newly completed predeployPHYSIS checkboxes since prior tag.
 *
 * Usage:
 *   node scripts/create-release-tag.mjs [--commit HEAD] [--bump patch|minor|major] [--version v0.8.0] [--dry-run]
 */

import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PREDEPLOY_PATHS = ["predeployPHYSIS.md", "predeployPHYSIS.txt"];
const TAG_PATTERN = /^v(\d+)\.(\d+)\.(\d+)$/;

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function parseArgs(argv) {
  const options = {
    commit: "HEAD",
    version: null,
    bump: "patch",
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--commit") {
      options.commit = argv[++i] ?? "HEAD";
    } else if (arg === "--version") {
      options.version = argv[++i] ?? null;
    } else if (arg === "--bump") {
      options.bump = argv[++i] ?? "patch";
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        `Usage: node scripts/create-release-tag.mjs [--commit REF] [--bump patch|minor|major] [--version vMAJOR.MINOR.PATCH] [--dry-run]`,
      );
      process.exit(0);
    }
  }

  return options;
}

function parseSemverTag(tag) {
  const match = TAG_PATTERN.exec(tag);
  if (!match) return null;
  return {
    tag,
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
  };
}

function compareSemver(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

function formatSemverTag(major, minor, patch) {
  return `v${major}.${minor}.${patch}`;
}

function listVersionTags() {
  const output = runGit(["tag", "-l", "v*.*.*"]);
  if (!output) return [];
  return output
    .split("\n")
    .filter(Boolean)
    .map(parseSemverTag)
    .filter(Boolean)
    .sort(compareSemver);
}

function getLatestVersionTag() {
  const tags = listVersionTags();
  if (tags.length === 0) return null;
  return tags[tags.length - 1];
}

function getNextVersionTag(bump) {
  const latest = getLatestVersionTag();
  if (!latest) {
    return formatSemverTag(0, 1, 0);
  }

  if (bump === "major") {
    return formatSemverTag(latest.major + 1, 0, 0);
  }
  if (bump === "minor") {
    return formatSemverTag(latest.major, latest.minor + 1, 0);
  }
  if (bump === "patch") {
    return formatSemverTag(latest.major, latest.minor, latest.patch + 1);
  }

  console.error(`Invalid --bump "${bump}". Expected patch, minor, or major.`);
  process.exit(1);
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

  const tag = options.version ?? getNextVersionTag(options.bump);
  if (!TAG_PATTERN.test(tag)) {
    console.error(`Invalid version tag "${tag}". Expected format vMAJOR.MINOR.PATCH (e.g. v0.7.1)`);
    process.exit(1);
  }

  if (tagExists(tag)) {
    console.error(`Tag ${tag} already exists. Pass --version to override explicitly.`);
    process.exit(1);
  }

  const previous = getLatestVersionTag();
  const baselineRef = previous?.tag ?? `${commit}^`;
  let completedItems = [];

  try {
    completedItems = getNewlyCompletedPredeployItems(baselineRef, commit);
  } catch (error) {
    console.warn(`Warning: could not diff predeploy checkboxes from ${baselineRef}: ${error.message}`);
  }

  const versionLabel = `Version ${tag.replace(/^v/, "")}`;
  const message = buildTagMessage(versionLabel, subject, completedItems);

  createAnnotatedTag(tag, commit, message, options.dryRun);

  if (!options.dryRun) {
    console.log(`Created tag ${tag} on ${commitShort}`);
    console.log(message);
  }
}

main();
