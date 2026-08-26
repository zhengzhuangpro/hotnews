#!/usr/bin/env bun
// 构建脚本：清理 → CLI 打包(+shebang) → 库 ESM/CJS → 类型声明 → 冒烟检查

async function run(cmd: string[]): Promise<void> {
  console.log(`  $ ${cmd.join(" ")}`);
  const proc = Bun.spawn(cmd, { stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`Command failed with exit code ${code}: ${cmd.join(" ")}`);
  }
}

async function addShebang(file: string): Promise<void> {
  const SHEBANG = "#!/usr/bin/env node\n";
  const content = await Bun.file(file).text();
  if (!content.startsWith("#!")) {
    await Bun.write(file, SHEBANG + content);
  }
}

async function main(): Promise<void> {
  console.log("Clean dist...");
  await run(["rm", "-rf", "dist"]);

  console.log("\nBuild CLI...");
  await run(["bun", "build", "src/cli.tsx", "--outdir", "dist/src", "--target", "node"]);
  await addShebang("dist/src/cli.js");

  console.log("\nBuild library (ESM)...");
  await run(["bun", "build", "src/index.ts", "--outdir", "dist/lib", "--target", "node", "--format", "esm"]);

  console.log("\nBuild library (CJS)...");
  await run(["bun", "build", "src/index.ts", "--outfile", "dist/lib/index.cjs", "--target", "node", "--format", "cjs"]);

  console.log("\nEmit type declarations...");
  await run(["bunx", "tsc", "-p", "tsconfig.build.json"]);

  console.log("\nSmoke check...");
  await run(["node", "scripts/smoke.cjs"]);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
