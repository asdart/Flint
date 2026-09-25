#!/usr/bin/env node
// Prints repo CSS ready for the Webflow MCP data_whtml_builder `css` param (creates new classes).
// The builder links `var(--token)` to the Webflow variable named `token`, so variable names stay as
// they are. Comments and the transitional :where(.fk-page) tag rules are removed (the builder
// accepts class selectors only), and url("/assets/…") becomes the hosted asset URL from
// docs/webflow/webflow-ids.json.
// Usage: node scripts/webflow-css.mjs src/styles/layout.css [more files…]
import { readFileSync } from "node:fs";

const { assets } = JSON.parse(readFileSync(new URL("../docs/webflow/webflow-ids.json", import.meta.url), "utf8"));

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/webflow-css.mjs <file.css> [...]");
  process.exit(1);
}

const css = files
  .map((file) => readFileSync(file, "utf8"))
  .join("\n")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/[^{}]*:where\(\.fk-page\)[^{]*\{[^}]*\}/g, "")
  // The builder only accepts :hover, :focus and :active. Push other states with
  // webflow-style-actions.mjs after the classes exist.
  .replace(/[^{}]*:(?:focus-visible|focus-within|placeholder|before|after)[^{]*\{[^}]*\}/g, "")
  .replace(/@media[^{]*\{\s*\}/g, "")
  .replace(/url\("(\/assets\/[^"]+)"\)/g, (match, path) => {
    if (!assets[path]) throw new Error(`Asset ${path} is not uploaded (add it to webflow-ids.json)`);
    return `url("${assets[path].url}")`;
  })
  .replace(/\s+/g, " ")
  .trim();

process.stdout.write(`${css}\n`);
