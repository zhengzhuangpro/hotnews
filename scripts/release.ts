#!/usr/bin/env bun

const BUMP_TYPES = ["patch", "minor", "major", "prerelease"] as const;
type BumpType = (typeof BUMP_TYPES)[number];

export function bumpVersion(current: string, type: BumpType, preid = "beta"): string {
  const match = current.match(/^(\d+)\.(\d+)\.(\d+)(?:-([\w.]+))?$/);
  if (!match) throw new Error(`Invalid version: "${current}"`);
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  const prerelease = match[4];

  if (type === "prerelease") {
    // 无 prerelease：patch +1 后挂 preid.0；有 prerelease：同 preid 递增，换 preid 重置
    if (prerelease === undefined) {
      return `${major}.${minor}.${patch + 1}-${preid}.0`;
    }
    const [id, ...rest] = prerelease.split(".");
    if (id === preid) {
      const num = rest.length ? Number(rest[rest.length - 1]) + 1 : 1;
      return `${major}.${minor}.${patch}-${preid}.${num}`;
    }
    return `${major}.${minor}.${patch}-${preid}.0`;
  }

  // 带 prerelease 时按 node-semver 语义：patch 直接转正，minor/major 跳过
  if (prerelease !== undefined && type === "patch") {
    return `${major}.${minor}.${patch}`;
  }
  switch (type) {
    case "major": return `${major + 1}.0.0`;
    case "minor": return `${major}.${minor + 1}.0`;
    case "patch": return `${major}.${minor}.${patch + 1}`;
  }
}

async function run(cmd: string[], { dry = false, interactive = false } = {}): Promise<string> {
  console.log(`  $ ${cmd.join(" ")}`);
  if (dry) return "";
  const proc = Bun.spawn(cmd, {
    stdin: interactive ? "inherit" : "pipe",
    stdout: interactive ? "inherit" : "pipe",
    stderr: "inherit",
  });
  const output = interactive ? "" : await new Response(proc.stdout).text();
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`Command failed with exit code ${code}: ${cmd.join(" ")}`);
  }
  return output.trim();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const bumpType = args.find((a) => BUMP_TYPES.includes(a as BumpType)) as BumpType | undefined;
  const preidArg = args.find((a) => a.startsWith("--preid="));
  const preid = preidArg ? preidArg.split("=")[1] : "beta";

  if (!bumpType) {
    console.error(`Usage: bun scripts/release.ts <patch|minor|major|prerelease> [--preid=beta] [--dry-run]`);
    process.exit(1);
  }

  if (dryRun) console.log("[dry-run mode]\n");

  // 1. Preflight
  console.log("Preflight checks...");
  if (!dryRun) {
    const status = await run(["git", "status", "--porcelain"]);
    if (status) {
      console.error("Working tree is not clean. Commit or stash changes first.");
      process.exit(1);
    }
    const branch = await run(["git", "rev-parse", "--abbrev-ref", "HEAD"]);
    if (branch !== "master") {
      console.error(`Must be on master branch (currently on ${branch}).`);
      process.exit(1);
    }
  } else {
    console.log("  (skipped in dry-run)");
  }

  // 2. Check sources
  console.log("\nCheck sources...");
  await run(["bun", "scripts/check.ts"], { dry: dryRun });

  // 3. Bump version
  const pkgPath = new URL("../package.json", import.meta.url).pathname;
  const pkg = await Bun.file(pkgPath).json();
  const oldVersion = pkg.version;
  const newVersion = bumpVersion(oldVersion, bumpType, preid);
  console.log(`\nBump ${oldVersion} → ${newVersion}`);

  if (!dryRun) {
    pkg.version = newVersion;
    await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // 3. Build
  console.log("\nBuild...");
  await run(["bun", "run", "build"], { dry: dryRun });

  // 4. Git commit
  console.log("\nGit commit...");
  await run(["git", "add", "package.json"], { dry: dryRun });
  await run(["git", "commit", "-m", `release: v${newVersion}`], { dry: dryRun });

  // 6. Git tag
  console.log("\nGit tag...");
  await run(["git", "tag", `v${newVersion}`], { dry: dryRun });

  // 7. Publish（预发布版本发到同名 dist-tag，避免污染 latest）
  console.log("\nPublish...");
  const publishCmd = newVersion.includes("-")
    ? ["npm", "publish", "--tag", preid]
    : ["npm", "publish"];
  await run(publishCmd, { dry: dryRun, interactive: true });

  // 8. Push
  console.log("\nGit push...");
  await run(["git", "push", "--tags"], { dry: dryRun });

  // 9. GitHub Release
  console.log("\nGitHub Release...");
  await run(["gh", "release", "create", `v${newVersion}`, "--generate-notes"], { dry: dryRun });

  // 10. Update release notes with highlights via claude
  console.log("\nUpdate release notes with highlights...");
  await run([
    "claude",
    "--allowedTools", "Bash",
    "-p",
    `Look at the git log between the previous tag and v${newVersion}. Generate categorized release highlights (Bug Fixes, Improvements, etc.) and update the GitHub release v${newVersion} using "gh release edit". Keep the Full Changelog link at the bottom.`,
  ], { dry: dryRun });

  console.log(`\nDone! Released v${newVersion}`);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
