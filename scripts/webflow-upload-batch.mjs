#!/usr/bin/env node
// Uploads several files after one batched data_assets_tool → create_asset call. Instead of piping
// each full result (as webflow-upload.mjs does), pass the few fields that differ per asset; the
// signed S3 policy is rebuilt from them. Needs network access to *.s3.amazonaws.com.
// Usage: node scripts/webflow-upload-batch.mjs <credential> < uploads.json
//   <credential> = uploadDetails.xAmzCredential (the same for every asset of one call)
//   uploads.json = [{ "file": "public/assets/x.png", "key": "<uploadDetails.key>",
//                     "date": "<uploadDetails.xAmzDate>", "signature": "<uploadDetails.xAmzSignature>" }]
// --check <expected-policy>: only compare the first rebuilt policy with a verbatim one, then exit.
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";

const [credential, flag, expected] = process.argv.slice(2);
if (!credential) {
  console.error("Usage: node scripts/webflow-upload-batch.mjs <credential> [--check <policy>] < uploads.json");
  process.exit(1);
}
const uploads = JSON.parse(readFileSync(0, "utf8"));
const TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".json": "application/json" };

function policy({ key, date }, type) {
  const iso = date.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, "$1-$2-$3T$4:$5:$6Z");
  const expiration = new Date(Date.parse(iso) + 3600_000).toISOString().replace(".000", "");
  const doc = {
    expiration,
    conditions: [
      ["starts-with", "$key", `${key.split("/")[0]}/`],
      { "cache-control": "max-age=31536000" },
      { "Content-Type": type },
      { success_action_status: "201" },
      ["starts-with", "$Content-Type", type],
      ["content-length-range", 0, 31457280],
      { acl: "public-read" },
      { bucket: "webflow-prod-assets" },
      { "X-Amz-Algorithm": "AWS4-HMAC-SHA256" },
      { "X-Amz-Credential": credential },
      { "X-Amz-Date": date },
      { key },
    ],
  };
  return Buffer.from(JSON.stringify(doc)).toString("base64");
}

if (flag === "--check") {
  const first = uploads[0];
  const ok = policy(first, TYPES[extname(first.file)]) === expected;
  console.log(ok ? "policy rebuild matches" : "policy rebuild DIFFERS");
  process.exit(ok ? 0 : 1);
}

for (const upload of uploads) {
  const type = TYPES[extname(upload.file)];
  const form = new FormData();
  const fields = {
    acl: "public-read",
    bucket: "webflow-prod-assets",
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": upload.date,
    key: upload.key,
    Policy: policy(upload, type),
    "X-Amz-Signature": upload.signature,
    success_action_status: "201",
    "Content-Type": type,
    "Cache-Control": "max-age=31536000",
  };
  for (const [name, value] of Object.entries(fields)) form.append(name, value);
  form.append("file", new Blob([readFileSync(upload.file)], { type }), basename(upload.file));
  const response = await fetch("https://webflow-prod-assets.s3.amazonaws.com/", { method: "POST", body: form });
  console.log(`${response.status} ${upload.file}${response.ok ? "" : `\n${await response.text()}`}`);
}
