import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const publicDir = resolve(rootDir, "root/public");
const assetsDir = resolve(publicDir, "assets");
const manifestPath = resolve(assetsDir, "manifest.json");
const distDir = resolve(rootDir, "dist");

if (!existsSync(manifestPath)) {
  console.error("manifest.json not found! Run npm run build first.");
  process.exit(1);
}

console.log("Reading manifest.json...");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
const browserAssets = manifest.entrypoints?.browser?.assets;

if (!browserAssets) {
  console.error("Browser entrypoint not found in manifest!");
  process.exit(1);
}

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

console.log("Copying assets to dist/assets...");
cpSync(assetsDir, resolve(distDir, "assets"), { recursive: true });

// Copy public root files if they exist
for (const file of ["favicon.ico", "cover.png", "robots.txt"]) {
  const src = resolve(publicDir, file);
  if (existsSync(src)) {
    cpSync(src, resolve(distDir, file));
  }
}

// Generate CSS link tags
const cssLinks = (browserAssets.css || [])
  .map((href: string) => `    <link rel="stylesheet" href=".${href}">`)
  .join("\n");

// Generate JS script tags
const jsScripts = (browserAssets.js || [])
  .map((src: string) => `    <script defer src=".${src}"></script>`)
  .join("\n");

const pageData = {
  base: "/",
  locale: "ja",
  user: null,
  publicUser: {
    id: null,
    name: "Guest",
    premium: false,
  },
  settings: null,
};

const html = `<!DOCTYPE html>
<html lang="ja" dir="ltr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Keybr - 日本語タイピング練習 (Kana &amp; Chouonpu)</title>
    <link rel="icon" href="./favicon.ico">
${cssLinks}
    <script id="page-data">
      var __PAGE_DATA__ = ${JSON.stringify(pageData)};
    </script>
${jsScripts}
  </head>
  <body>
    <div id="root">
      <div style="display:flex;height:100vh;align-items:center;justify-content:center;font-family:sans-serif;color:#888;">
        Loading Japanese Typing Tutor...
      </div>
    </div>
  </body>
</html>
`;

writeFileSync(resolve(distDir, "index.html"), html, "utf-8");
writeFileSync(resolve(distDir, "404.html"), html, "utf-8"); // SPA routing for GitHub Pages

console.log("Successfully built static site in dist/!");
console.log("Files in dist/: index.html, 404.html, assets/...");
