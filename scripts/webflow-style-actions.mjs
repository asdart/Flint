#!/usr/bin/env node
// Prints Webflow MCP `data_style_tool` update_style actions (JSON) for every class rule in the given
// CSS files: one action per selector × breakpoint × state. Shorthands are expanded to the longhands
// Webflow stores, and `var(--token)` values are linked by id from docs/webflow/webflow-ids.json.
// Use it to sync changes to classes that already exist (the WHTML builder only creates new ones).
// Usage: node scripts/webflow-style-actions.mjs src/styles/layout.css [--only fk-panel,fk-section]
// --tags: also emit the tag styles of src/styles/base.css (`:where(.fk-page)` → body, `:where(.fk-page)
// :where(h1, h2)` → h1 and h2 …). They're plain `update_style` actions with the tag as `style_name`; the
// tag style must already exist (seeded in the Designer, classes.md → Tag styles), so `--create` never
// creates them. Without --tags, `:where()` rules are skipped as before.
import { readFileSync } from "node:fs";

// --vars-only: emit only properties that reference a variable (re-linking raw var() values).
// --create: the classes don't exist yet. Each class chain starts with a create_style action (holding
// its desktop values); the other breakpoints and states follow as update_style actions. Rules on
// Webflow's own states (`w--current`, `w--open`) are skipped: they can't be created through the API.
const varsOnly = process.argv.includes("--vars-only");
const create = process.argv.includes("--create");
const tags = process.argv.includes("--tags");
const args = process.argv.slice(2).filter((arg) => arg !== "--vars-only" && arg !== "--create" && arg !== "--tags");
const onlyIndex = args.indexOf("--only");
const only = onlyIndex >= 0 ? new Set(args[onlyIndex + 1].split(",")) : null;
const files = onlyIndex >= 0 ? args.filter((_, i) => i !== onlyIndex && i !== onlyIndex + 1) : args;

const ids = JSON.parse(readFileSync(new URL("../docs/webflow/webflow-ids.json", import.meta.url), "utf8"));
const tokens = Object.fromEntries(
  [...readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8").matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map(
    ([, name, value]) => [name, value.trim()],
  ),
);
const BREAKPOINTS = { "991px": "medium", "767px": "small", "479px": "tiny" };
const PSEUDOS = ["hover", "active", "focus-visible", "focus-within", "focus", "placeholder", "before", "after"];

function sides(value) {
  const parts = value.trim().split(/\s+(?![^(]*\))/);
  const [t, r = t, b = t, l = r] = parts;
  return [t, r, b, l];
}

function expand(name, value) {
  const four = (prefix, suffix = "") =>
    sides(value).map((v, i) => [`${prefix}-${["top", "right", "bottom", "left"][i]}${suffix}`, v]);
  switch (name) {
    case "padding":
    case "margin":
      return four(name);
    case "inset":
      return sides(value).map((v, i) => [["top", "right", "bottom", "left"][i], v]);
    case "margin-inline":
      return [["margin-inline-start", value], ["margin-inline-end", value]];
    case "padding-inline": {
      const [start, end = start] = value.trim().split(/\s+(?![^(]*\))/);
      return [["padding-left", start], ["padding-right", end]];
    }
    case "padding-block": {
      const [start, end = start] = value.trim().split(/\s+(?![^(]*\))/);
      return [["padding-top", start], ["padding-bottom", end]];
    }
    case "gap": {
      const [row, column = row] = value.trim().split(/\s+(?![^(]*\))/);
      return [["grid-row-gap", row], ["grid-column-gap", column]];
    }
    case "border-radius": {
      const [tl, tr, br, bl] = sides(value);
      return [
        ["border-top-left-radius", tl],
        ["border-top-right-radius", tr],
        ["border-bottom-right-radius", br],
        ["border-bottom-left-radius", bl],
      ];
    }
    case "border-color":
    case "border-width":
    case "border-style":
      return four("border", name.slice("border".length));
    case "overflow":
      return [["overflow-x", value], ["overflow-y", value]];
    case "grid-area": {
      const [rs, cs, re, ce] = value.split("/").map((v) => v.trim());
      // `grid-area: 1 / 1` has no end lines (auto): send only the starts rather than `undefined` ends.
      return [["grid-row-start", rs], ["grid-column-start", cs], ["grid-row-end", re], ["grid-column-end", ce]].filter(([, v]) => v !== undefined);
    }
    case "flex":
      if (value === "none") return [["flex-grow", "0"], ["flex-shrink", "0"], ["flex-basis", "auto"]];
      if (/^\d+$/.test(value)) return [["flex-grow", value], ["flex-shrink", "1"], ["flex-basis", "0%"]];
      {
        const [grow, shrink, basis] = value.trim().split(/\s+/);
        if (basis !== undefined) return [["flex-grow", grow], ["flex-shrink", shrink], ["flex-basis", basis === "0" ? "0%" : basis]];
      }
      return [[name, value]];
    case "border":
    case "border-top":
    case "border-right":
    case "border-bottom":
    case "border-left": {
      const edges = name === "border" ? ["top", "right", "bottom", "left"] : [name.slice("border-".length)];
      const [width, style = width === "0" ? "none" : "solid", color] = value.split(/\s+(?![^(]*\))/);
      return edges.flatMap((edge) => [
        [`border-${edge}-width`, width === "0" ? "0px" : width],
        [`border-${edge}-style`, style],
        ...(color ? [[`border-${edge}-color`, color]] : []),
      ]);
    }
    default:
      return [[name, value]];
  }
}

function toProperty([name, value]) {
  const whole = value.match(/^var\(--([a-z0-9-]+)\)$/);
  if (whole) {
    const id = ids.variables[whole[1]];
    if (!id) throw new Error(`Unknown token "${whole[1]}" (add it to webflow-ids.json)`);
    return { property_name: name, variable_as_value: id };
  }
  // The API can't keep a variable inside a compound value (shadows, gradients): it would replace the
  // whole value with the variable. Resolve the token to its literal value, as Webflow does for gradients.
  return {
    property_name: name,
    property_value: value
      .replace(/var\(--([a-z0-9-]+)\)/g, (_, token) => {
        if (!tokens[token]) throw new Error(`Unknown token "${token}" in src/styles/tokens.css`);
        return tokens[token];
      })
      .replace(/url\("(\/assets\/[^"]+)"\)/g, (_, path) => {
        if (!ids.assets[path]) throw new Error(`Asset ${path} is not uploaded (add it to webflow-ids.json)`);
        return `url("${ids.assets[path].url}")`;
      }),
  };
}

// Tag styles Webflow has no seeded style for: skipped until someone seeds them in the Designer.
const UNSEEDED_TAGS = new Set(["figure"]);
const tagActions = new WeakSet();

function parseTagSelector(selector) {
  const match = selector.match(/^:where\(\.fk-page\)(?:\s+:where\(([^)]*)\))?$/);
  if (!match) throw new Error(`Unsupported tag selector "${selector}"`);
  return match[1] ? match[1].split(",").map((t) => t.trim()) : ["body"];
}

function parseSelector(selector) {
  const pseudo = PSEUDOS.find((p) => selector.endsWith(`:${p}`) || selector.endsWith(`::${p}`));
  const bare = pseudo ? selector.replace(new RegExp(`::?${pseudo}$`), "") : selector;
  if (!/^(\.[a-z0-9-]+)+$/.test(bare)) throw new Error(`Unsupported selector "${selector}"`);
  const classes = bare.slice(1).split(".");
  return { classes, pseudo };
}

const actions = [];
for (const file of files) {
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks = [];
  let rest = css;
  const mediaRe = /@media screen and \(max-width: (\d+px)\)\s*\{((?:[^{}]*\{[^}]*\})*)\s*\}/g;
  rest = rest.replace(mediaRe, (_, width, body) => {
    blocks.push({ breakpoint: BREAKPOINTS[width], body });
    return "";
  });
  blocks.unshift({ breakpoint: "main", body: rest });

  for (const { breakpoint, body } of blocks) {
    for (const [, selector, declarations] of body.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const trimmed = selector.trim();
      const isTag = trimmed.includes(":where(");
      if (isTag && !tags) continue;
      const { classes, pseudo } = isTag ? { classes: parseTagSelector(trimmed), pseudo: undefined } : parseSelector(trimmed);
      if (only && !only.has(classes[0])) continue;
      const properties = declarations
        .split(";")
        .map((d) => d.trim())
        .filter(Boolean)
        .map((d) => [
          d.slice(0, d.indexOf(":")).trim(),
          d.slice(d.indexOf(":") + 1).trim().replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")"),
        ])
        .flatMap(([name, value]) => expand(name, value))
        .map(toProperty)
        .filter((property, index, all) => all.findLastIndex((p) => p.property_name === property.property_name) === index)
        .filter((property) => !varsOnly || property.variable_as_value);
      if (properties.length === 0) continue;
      if (isTag) {
        for (const tag of classes.filter((t) => !UNSEEDED_TAGS.has(t))) {
          const action = { label: `${tag} @${breakpoint}`, update_style: { style_name: tag, breakpoint_id: breakpoint, properties } };
          tagActions.add(action);
          actions.push(action);
        }
        continue;
      }
      const action = {
        label: `${trimmed} @${breakpoint}`,
        update_style: {
          style_name: classes[classes.length - 1],
          ...(classes.length > 1 ? { parent_style_names: classes.slice(0, -1) } : {}),
          breakpoint_id: breakpoint,
          ...(pseudo ? { pseudo } : {}),
          properties,
        },
      };
      actions.push(action);
    }
  }
}

if (create) {
  // Webflow's own states can't be created through the API: `create_style` with the name `w--current`
  // makes an ordinary combo class named that (selector `.a._w--current`), not the state. Skip them;
  // they're styled in the Designer (classes.md).
  const isState = (action) => [action.update_style.style_name, ...(action.update_style.parent_style_names ?? [])].some((n) => /^w--/.test(n));
  const skipped = actions.filter(isState).map((a) => a.label);
  if (skipped.length) console.error(`Skipped (Designer-only Webflow states): ${skipped.join(", ")}`);
  actions.splice(0, actions.length, ...actions.filter((a) => !isState(a)));
  const chain = (action) => [...(action.update_style.parent_style_names ?? []), action.update_style.style_name].join(".");
  const created = new Set();
  const createActions = [];
  for (const action of actions) {
    if (tagActions.has(action)) continue;
    const key = chain(action);
    if (created.has(key)) continue;
    created.add(key);
    const { style_name, parent_style_names } = action.update_style;
    const desktop = actions.find((a) => chain(a) === key && a.update_style.breakpoint_id === "main" && !a.update_style.pseudo);
    createActions.push({
      label: `create .${key}`,
      create_style: {
        name: style_name,
        ...(parent_style_names ? { parent_style_names } : {}),
        properties: desktop ? desktop.update_style.properties : [],
      },
    });
  }
  const rest = actions.filter((a) => tagActions.has(a) || a.update_style.breakpoint_id !== "main" || a.update_style.pseudo);
  process.stdout.write(JSON.stringify([...createActions, ...rest]));
} else {
  process.stdout.write(JSON.stringify(actions));
}
