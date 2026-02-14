const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

// Read the JS bundle
const assetsDir = path.join(distDir, 'assets');
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'));

let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CEA Dashboard — HeartBased.io</title>`;

// Inline CSS if any
for (const cssFile of cssFiles) {
  const css = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
  html += `\n  <style>${css}</style>`;
}

html += `
</head>
<body>
  <div id="root"></div>`;

// Inline JS
for (const jsFile of jsFiles) {
  const js = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
  html += `\n  <script>${js}</script>`;
}

html += `
</body>
</html>`;

const outPath = path.join(__dirname, 'cea-dashboard.html');
fs.writeFileSync(outPath, html, 'utf-8');
console.log(`Bundled to ${outPath} (${(html.length / 1024).toFixed(1)} KB)`);
