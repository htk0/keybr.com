import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const indexHtml = readFileSync(join(rootDir, "dist/index.html"), "utf8");
console.log("index.html size:", indexHtml.length);
if (!indexHtml.includes('id="root"')) {
  throw new Error("Missing #root in index.html");
}
if (!indexHtml.includes("__PAGE_DATA__")) {
  throw new Error("Missing __PAGE_DATA__ in index.html");
}

const manifest = JSON.parse(
  readFileSync(join(rootDir, "root/public/assets/manifest.json"), "utf8"),
);
const browserJs = manifest.entrypoints.browser.assets.js;
console.log("Browser JS bundles:", browserJs);
for (const js of browserJs) {
  const p = join(rootDir, "dist", js);
  if (!existsSync(p)) {
    throw new Error(`Missing bundle: ${p}`);
  }
}
console.log("All dist assets exist and are valid!");
