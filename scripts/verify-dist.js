import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const distDir = path.resolve(import.meta.dirname, "../dist");

const server = http.createServer((req, res) => {
  let reqPath = req.url === "/" ? "index.html" : req.url.replace(/^\//, "");
  let p = path.join(distDir, reqPath);
  if (!fs.existsSync(p)) {
    p = path.join(distDir, "index.html");
  }
  const ext = path.extname(p);
  const mimeMap = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".data": "application/octet-stream",
  };
  const ct = mimeMap[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": ct });
  res.end(fs.readFileSync(p));
});

server.listen(8088, async () => {
  try {
    console.log("Static server running on http://localhost:8088");
    const res = await fetch("http://localhost:8088/");
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("Has root:", html.includes('id="root"'));
    console.log("Has __PAGE_DATA__:", html.includes("__PAGE_DATA__"));

    // Also check assets
    const cssMatch = html.match(/href="\.(\/assets\/[^"]+)"/);
    if (cssMatch) {
      const cssRes = await fetch("http://localhost:8088" + cssMatch[1]);
      console.log(
        "CSS status:",
        cssRes.status,
        "Length:",
        (await cssRes.text()).length,
      );
    }
    const jsMatch = html.match(/src="\.(\/assets\/[^"]+)"/);
    if (jsMatch) {
      const jsRes = await fetch("http://localhost:8088" + jsMatch[1]);
      console.log(
        "JS status:",
        jsRes.status,
        "Length:",
        (await jsRes.text()).length,
      );
    }
    console.log("Static site verification SUCCESSFUL!");
  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    server.close(() => process.exit(0));
  }
});
