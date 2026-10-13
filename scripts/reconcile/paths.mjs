import path from "node:path";

// The repo the tools read. FLINT_ROOT points them at another checkout (the reconcile tests use a scratch
// worktree); the default is the repo this file lives in.
export const ROOT = process.env.FLINT_ROOT ? `${path.resolve(process.env.FLINT_ROOT)}/` : new URL("../../", import.meta.url).pathname;
