#!/usr/bin/env node
// Renders repo sections or components to static HTML for data_whtml_builder, so markup is never
// scraped from the preview (no runtime state, no data-cursor-ref). Asset paths are swapped for the
// hosted URLs in docs/webflow/webflow-ids.json → assets; a missing asset is an error.
// Usage: node scripts/webflow-markup.mjs <src path…>   e.g. src/sections/Hero.tsx
// Prints JSON { "<path>": "<html>" }. Component instances (Button…) still render: empty their
// slots before inserting, as in recipes.md → Build a page from the repo markup.
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/webflow-markup.mjs <src path…>");
  process.exit(1);
}

const root = new URL("..", import.meta.url).pathname;
const ids = JSON.parse(readFileSync(new URL("../docs/webflow/webflow-ids.json", import.meta.url), "utf8"));
const server = await createServer({
  root,
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error",
  // Never inline imported SVG icons as data: URIs, so they render as /src/assets/icons/x.svg paths
  // and can be swapped for their hosted assets below.
  build: { assetsInlineLimit: 0 },
});

try {
  const out = {};
  for (const file of files) {
    const { default: Component } = await server.ssrLoadModule(`/${file}`);
    const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Component)));
    // React 19 hoists <link rel="preload"> tags for images; they aren't page elements.
    // Imported icons (src/assets/icons/*.svg) are keyed without the leading slash, like their repo path.
    out[file] = html.replace(/<link rel="preload"[^>]*\/>/g, "").replace(/src="(\/(?:src\/)?assets\/[^"]+)"/g, (_, path) => {
      const asset = ids.assets[path.startsWith("/src/") ? path.slice(1) : path];
      if (!asset) throw new Error(`No hosted asset for ${path} in webflow-ids.json`);
      return `src="${asset.url}"`;
    });
  }
  console.log(JSON.stringify(out, null, 1));
} finally {
  await server.close();
}
