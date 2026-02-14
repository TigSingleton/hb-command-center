#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const distDir = resolve('dist');
const assetsDir = join(distDir, 'assets');
const outputPath = process.argv[2] || 'cea-dashboard.html';

// Read CSS + JS
const cssFiles = readdirSync(assetsDir).filter(f => f.endsWith('.css'));
const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js'));
const css = cssFiles.map(f => readFileSync(join(assetsDir, f), 'utf-8')).join('\n');
const js = jsFiles.map(f => readFileSync(join(assetsDir, f), 'utf-8')).join('\n');

// Build standalone HTML — script AFTER #root so DOM is ready
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CEA Dashboard — HeartBased.io</title>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>`;

writeFileSync(outputPath, html, 'utf-8');
console.log(`✓ ${outputPath} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
