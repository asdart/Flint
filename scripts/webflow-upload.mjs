#!/usr/bin/env node
// Uploads a file to Webflow's S3 bucket after data_assets_tool → create_asset (or
// data_fonts_tool → create_font). Pipe that action's `result` JSON in on stdin; the script turns
// `uploadDetails` into the multipart form S3 expects and appends the file last. Prints the HTTP
// status (201 = uploaded). Needs network access to *.s3.amazonaws.com.
// Usage: node scripts/webflow-upload.mjs src/assets/icons/menu.svg < result.json
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const [file] = process.argv.slice(2);
if (!file) {
  console.error("Usage: node scripts/webflow-upload.mjs <file> < create_asset-result.json");
  process.exit(1);
}

const result = JSON.parse(readFileSync(0, "utf8"));
// create_asset returns { uploadUrl, uploadDetails } (camelCase keys); create_font returns
// { upload: { url, fields } } with the S3 form field names already exact (checked 2026-09-29).
const uploadUrl = result.uploadUrl ?? result.upload?.url;
const uploadDetails = result.uploadDetails ?? result.upload?.fields;
if (!uploadUrl || !uploadDetails) throw new Error("stdin must be the create_asset/create_font result");

const FIELD_NAMES = {
  policy: "Policy",
  contentType: "Content-Type",
  cacheControl: "Cache-Control",
  contentMd5: "Content-MD5",
  successActionStatus: "success_action_status",
};
const fieldName = (key) =>
  FIELD_NAMES[key] ?? (key.startsWith("xAmz") ? `X-Amz-${key.slice(4)}` : key);

const form = new FormData();
for (const [key, value] of Object.entries(uploadDetails)) form.append(fieldName(key), value);
const type = uploadDetails.contentType ?? uploadDetails["Content-Type"] ?? result.contentType ?? "application/octet-stream";
form.append("file", new Blob([readFileSync(file)], { type }), basename(file));

const response = await fetch(uploadUrl, { method: "POST", body: form });
console.log(`${response.status} ${file}${response.ok ? "" : `\n${await response.text()}`}`);
if (!response.ok) process.exit(1);
