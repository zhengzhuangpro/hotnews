import { describe, expect, test } from "bun:test";
import { bumpVersion } from "../scripts/release.js";

describe("bumpVersion", () => {
  test("patch/minor/major on plain version", () => {
    expect(bumpVersion("0.1.6", "patch")).toBe("0.1.7");
    expect(bumpVersion("0.1.6", "minor")).toBe("0.2.0");
    expect(bumpVersion("0.1.6", "major")).toBe("1.0.0");
  });

  test("prerelease from plain version starts at .0 on next patch", () => {
    expect(bumpVersion("0.1.6", "prerelease", "beta")).toBe("0.1.7-beta.0");
  });

  test("prerelease on same preid increments", () => {
    expect(bumpVersion("0.1.7-beta.0", "prerelease", "beta")).toBe("0.1.7-beta.1");
    expect(bumpVersion("0.1.7-beta.9", "prerelease", "beta")).toBe("0.1.7-beta.10");
  });

  test("prerelease on different preid keeps base and restarts at .0", () => {
    expect(bumpVersion("0.1.7-beta.2", "prerelease", "rc")).toBe("0.1.7-rc.0");
  });

  test("patch on prerelease strips suffix (releasing the beta)", () => {
    expect(bumpVersion("0.1.7-beta.1", "patch")).toBe("0.1.7");
  });

  test("minor/major on prerelease bump past it", () => {
    expect(bumpVersion("0.1.7-beta.1", "minor")).toBe("0.2.0");
    expect(bumpVersion("0.1.7-beta.1", "major")).toBe("1.0.0");
  });

  test("invalid version throws", () => {
    expect(() => bumpVersion("not-a-version", "patch")).toThrow(/Invalid version/);
    expect(() => bumpVersion("0.1.7-beta.0", "patch")).not.toThrow();
  });
});
