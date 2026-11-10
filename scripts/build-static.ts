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

const normalizeAssetPath = (path: string) => {
  const clean = path
    .replace(/^(?:\/|auto\/|\.\/)/, "")
    .replace(/^assets\//, "");
  return `./assets/${clean}`;
};

// Generate CSS link tags
const cssLinks = (browserAssets.css || [])
  .map(
    (href: string) =>
      `    <link rel="stylesheet" href="${normalizeAssetPath(href)}">`,
  )
  .join("\n");

// Generate JS script tags
const jsScripts = (browserAssets.js || [])
  .map(
    (src: string) =>
      `    <script defer src="${normalizeAssetPath(src)}"></script>`,
  )
  .join("\n");

const pageData = {
  base: "/",
  locale: "ja",
  user: null,
  publicUser: {
    id: null,
    name: "ゲスト",
    premium: true,
  },
  settings: null,
};

const html = `<!DOCTYPE html>
<html lang="ja" dir="ltr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Keybr 日本語版 - US/JIS配列対応 ローマ字タイピング練習</title>
    <meta name="description" content="Keybr.comのオープンソースフォーク版。Keybrの洗練されたUIのまま日本語入力に対応。US配列・JIS配列両対応、訓令式・ヘボン式シームレス判定、伸ばし棒「ー」の集中特訓ができる完全無料タイピング練習ツール。">
    <link rel="icon" href="./favicon.ico">
    <script>
      (function() {
        try {
          var raw = localStorage.getItem("prefs") || (document.cookie.match(/(?:^|; )prefs=([^;]*)/) || [])[1];
          if (raw) {
            var prefs = JSON.parse(decodeURIComponent(raw));
            if (prefs && prefs.color) document.documentElement.setAttribute("data-color", prefs.color);
            if (prefs && prefs.font) document.documentElement.setAttribute("data-font", prefs.font);
          }
        } catch (e) {}
      })();
    </script>
${cssLinks}
    <script id="page-data">
      var __PAGE_DATA__ = ${JSON.stringify(pageData)};
    </script>
${jsScripts}
  </head>
  <body>
    <div id="root">
      <div style="display:flex;height:100vh;align-items:center;justify-content:center;font-family:sans-serif;color:#888;">
        日本語タイピング練習を読み込み中...
      </div>
    </div>
  </body>
</html>
`;

writeFileSync(resolve(distDir, "index.html"), html, "utf-8");
writeFileSync(resolve(distDir, "404.html"), html, "utf-8"); // SPA routing for GitHub Pages

console.log("Successfully built static site in dist/!");
console.log("Files in dist/: index.html, 404.html, assets/...");
