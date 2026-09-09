import { createRequire } from "node:module";
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const req = createRequire(import.meta.url);

function resolvePlatformParts() {
  const { platform, arch } = process;
  if (platform === "linux") {
    let family = "gnu";
    try {
      const { familySync, MUSL } = req("detect-libc");
      family = familySync() === MUSL ? "musl" : "gnu";
    } catch {
      // fallback to gnu
    }
    const variant = arch === "arm" ? "gnueabihf" : family;
    return `${platform}-${arch}-${variant}`;
  }
  if (platform === "win32") {
    return `${platform}-${arch}-msvc`;
  }
  return `${platform}-${arch}`;
}

const suffix = resolvePlatformParts();
const pkgName = `lightningcss-${suffix}`;

const lightningcssRoot = path.dirname(req.resolve("lightningcss"));
const pkgJsonPath = req.resolve(`${pkgName}/package.json`);
const pkgDir = path.dirname(pkgJsonPath);
const nodeFile = readdirSync(pkgDir).find((f) => f.endsWith(".node"));

if (!nodeFile) {
  console.error(`[fix-lightningcss] No .node binary found in ${pkgName}`);
  process.exit(1);
}

const source = path.join(pkgDir, nodeFile);
const dest = path.join(lightningcssRoot, `lightningcss.${suffix}.node`);

mkdirSync(path.dirname(dest), { recursive: true });
copyFileSync(source, dest);
console.log(`[fix-lightningcss] Copied ${nodeFile} -> lightningcss.${suffix}.node`);