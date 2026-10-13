// Renders repo pages to traced markup (see jsx-trace/) and parses them to a repo tree.
// Used by scripts/webflow-map.mjs. Needs Vite (a dev dependency already).
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { repoTree } from "./html.mjs";

import { ROOT } from "./paths.mjs";

export { ROOT };

export async function startRenderer() {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    // The trace runtime replaces react/jsx-dev-runtime for this server only; the project build is untouched.
    plugins: [react({ jsxImportSource: "/scripts/reconcile/jsx-trace" })],
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
    build: { assetsInlineLimit: 0 },
  });
  // The traced runtime logs React key warnings for wrapper nodes; they are not about the repo.
  const origError = console.error;
  console.error = (...a) => {
    if (typeof a[0] === "string" && /unique "key"|validateDOMNesting|Each child in a list/.test(a[0])) return;
    origError(...a);
  };
  return {
    server,
    /** Renders `file`'s default export at `url` (route `pattern`) and returns the repo tree. */
    async renderPage(file, { url = "/", pattern = "*" } = {}) {
      const { default: Page } = await server.ssrLoadModule(`/${file}`);
      const el = React.createElement(
        MemoryRouter,
        { initialEntries: [url] },
        React.createElement(Routes, null, React.createElement(Route, { path: pattern, element: React.createElement(Page) })),
      );
      const html = renderToStaticMarkup(el).replace(/<link rel="preload"[^>]*\/>/g, "");
      return repoTree(html);
    },
    async load(file) {
      return server.ssrLoadModule(`/${file}`);
    },
    async close() {
      console.error = origError;
      await server.close();
    },
  };
}
