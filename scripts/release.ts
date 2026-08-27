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

async function getPublishedVersions(pkgName: string): Promise<string[]> {
  try {
    const proc = Bun.spawn(["npm", "view", pkgName, "versions", "--json"], {
      stdout: "pipe", stderr: "pipe",
    });
    const output = await new Response(proc.stdout).text();
    const code = await proc.exited;
    if (code !== 0) return [];
    return JSON.parse(output.trim());
  } catch {
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const skipCheck = args.includes("--skip-check");
  const bumpType = args.find((a) => BUMP_TYPES.includes(a as BumpType)) as BumpType | undefined;
  const preidArg = args.find((a) => a.startsWith("--preid="));
  const preid = preidArg ? preidArg.split("=")[1] : "beta";

  if (!bumpType) {
    console.error(`Usage: bun scripts/release.ts <patch|minor|major|prerelease> [--preid=beta] [--dry-run] [--skip-check]`);
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
  if (skipCheck) {
    console.log("  (skipped via --skip-check)");
  } else {
    await run(["bun", "scripts/check.ts"], { dry: dryRun });
  }

  // 3. Bump version（从 npm registry 拿最新版本，避免与已发布版本冲突）
  const pkgPath = new URL("../package.json", import.meta.url).pathname;
  const pkg = await Bun.file(pkgPath).json();
  const localVersion = pkg.version;

  let baseVersion = localVersion;
  if (!dryRun) {
    const published = await getPublishedVersions(pkg.name);
    if (published.length > 0) {
      const latestPublished = published[published.length - 1];
      // 取本地和 npm 上更高的那个作为基准
      if (latestPublished.localeCompare(baseVersion, undefined, { numeric: true }) > 0) {
        baseVersion = latestPublished;
      }
    }
  }

  const newVersion = bumpVersion(baseVersion, bumpType, preid);
  console.log(`\nBump ${localVersion} → ${newVersion}${baseVersion !== localVersion ? ` (npm has ${baseVersion})` : ""}`);

  // 检查目标版本是否已发布
  if (!dryRun) {
    const published = await getPublishedVersions(pkg.name);
    if (published.includes(newVersion)) {
      console.error(`Version ${newVersion} already exists on npm. Aborting.`);
      process.exit(1);
    }
  }

  if (!dryRun) {
    pkg.version = newVersion;
    await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // 4. Build
  console.log("\nBuild...");
  await run(["bun", "run", "build"], { dry: dryRun });

  // 5. Git commit + tag
  console.log("\nGit commit...");
  await run(["git", "add", "package.json"], { dry: dryRun });
  await run(["git", "commit", "-m", `release: v${newVersion}`], { dry: dryRun });

  console.log("\nGit tag...");
  await run(["git", "tag", `v${newVersion}`], { dry: dryRun });

  // 6. Publish（--ignore-scripts 防止 lifecycle hook 重复触发 publish）
  console.log("\nPublish...");
  const publishCmd = newVersion.includes("-")
    ? ["npm", "publish", "--ignore-scripts", "--tag", preid]
    : ["npm", "publish", "--ignore-scripts"];
  try {
    await run(publishCmd, { dry: dryRun, interactive: true });
  } catch (err) {
    // 发布失败：回滚 commit 和 tag
    console.error("\nPublish failed, rolling back...");
    await run(["git", "tag", "-d", `v${newVersion}`]).catch(() => {});
    await run(["git", "reset", "--soft", "HEAD~1"]).catch(() => {});
    await run(["git", "checkout", "--", "package.json"]).catch(() => {});
    throw err;
  }

  // 7. Push
  console.log("\nGit push...");
  await run(["git", "push", "--tags"], { dry: dryRun });

  // 8. GitHub Release
  console.log("\nGitHub Release...");
  await run(["gh", "release", "create", `v${newVersion}`, "--generate-notes"], { dry: dryRun });

  // 9. Update release notes with highlights via claude
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
