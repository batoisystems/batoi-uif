import {
  iconSets
} from "./chunk-5LY33RJY.js";
import {
  deviceIcons
} from "./chunk-5HU5KHID.js";
import {
  domainIcons
} from "./chunk-YD3ZWAX6.js";
import {
  workflowIcons
} from "./chunk-BVMXH3PQ.js";
import {
  adminSecurityIcons
} from "./chunk-5GJBKAVV.js";
import {
  brandIcons
} from "./chunk-44AFBWBG.js";
import {
  chartIcons
} from "./chunk-HAXDAJZR.js";
import {
  commerceIcons
} from "./chunk-JHI3QEZH.js";
import {
  communicationIcons
} from "./chunk-YZLEH7SJ.js";
import {
  contentIcons
} from "./chunk-6NIHK33E.js";
import {
  coreUiIcons
} from "./chunk-Y7W2JUIA.js";

// src/icons.ts
var icons = {
  ...brandIcons,
  ...coreUiIcons,
  ...chartIcons,
  ...commerceIcons,
  ...communicationIcons,
  ...contentIcons,
  ...deviceIcons,
  ...adminSecurityIcons,
  ...workflowIcons,
  ...domainIcons
};

// src/metadata.ts
var categoryTags = {
  "admin-security": ["admin", "security", "access", "identity", "compliance"],
  brand: ["brand", "logo"],
  charts: ["analytics", "data", "dashboard", "metrics", "visualization"],
  commerce: ["commerce", "billing", "payment", "retail"],
  communication: ["communication", "collaboration", "notification"],
  content: ["content", "document", "editor", "media"],
  "core-ui": ["ui", "control", "navigation"],
  devices: ["device", "hardware", "network"],
  domain: ["domain", "industry"],
  workflow: ["workflow", "operation", "automation", "task"]
};
var curatedAliases = {
  alert: ["danger", "risk"],
  approval: ["approve", "verified"],
  archive: ["box"],
  "area-chart": ["area graph"],
  "bar-chart": ["bar graph"],
  batoi: ["batoi logo"],
  cart: ["shopping cart"],
  cash: ["money"],
  chart: ["trend", "analytics"],
  check: ["done", "confirm"],
  close: ["x", "dismiss"],
  dashboard: ["gauge", "overview"],
  document: ["page"],
  download: ["export"],
  edit: ["pencil"],
  error: ["failure", "invalid"],
  "external-link": ["open"],
  file: ["document"],
  filter: ["funnel"],
  help: ["question"],
  home: ["house"],
  info: ["information"],
  list: ["bullets"],
  location: ["pin", "marker"],
  mail: ["email"],
  menu: ["hamburger"],
  package: ["box", "parcel"],
  refresh: ["reload"],
  search: ["find"],
  settings: ["cog", "gear"],
  success: ["valid", "complete"],
  sync: ["refresh"],
  trash: ["delete", "remove"],
  uif: ["batoi uif logo"],
  user: ["person", "account"],
  users: ["team", "people"],
  warning: ["alert"]
};
function categoryFor(name) {
  for (const [category, registry] of Object.entries(iconSets)) {
    if (name in registry) return category;
  }
  return "core-ui";
}
function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim().toLowerCase()))];
}
function generatedTags(name, category) {
  return unique([...name.split("-"), category, ...categoryTags[category]]);
}
var iconMetadata = Object.keys(icons).reduce(
  (metadata, name) => {
    const iconName = name;
    const category = categoryFor(iconName);
    metadata[iconName] = {
      aliases: unique(curatedAliases[iconName] ?? []),
      category,
      name: iconName,
      status: "stable",
      tags: generatedTags(iconName, category)
    };
    return metadata;
  },
  {}
);
function getIconMetadata(name) {
  return iconMetadata[name];
}
function iconsByCategory(category) {
  const registry = iconSets[category];
  return registry ? Object.keys(registry) : [];
}
function searchIcons(query = "", options = {}) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return Object.keys(iconMetadata).filter((name) => {
    const metadata = iconMetadata[name];
    if (!options.includeDeprecated && metadata.status === "deprecated") return false;
    if (options.category && metadata.category !== options.category) return false;
    if (!terms.length) return true;
    const haystack = unique([metadata.name, metadata.category, ...metadata.aliases, ...metadata.tags]).join(" ");
    return terms.every((term) => haystack.includes(term));
  }).sort((a, b) => a.localeCompare(b));
}

// src/render.ts
import { setTrustedHTML } from "@batoi/uif-dom";
var customIcons = {};
function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function iconBody(definition) {
  return Array.isArray(definition.body) ? definition.body.join("") : definition.body;
}
function definitionFor(name) {
  return customIcons[name] ?? icons[name];
}
function normalizeSize(size) {
  if (size === void 0) return void 0;
  return typeof size === "number" ? `${size}px` : size;
}
function hasIcon(name) {
  return Boolean(definitionFor(name));
}
function registerIcon(name, body, viewBox = "0 0 24 24") {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid icon name: ${name}`);
  customIcons[name] = { body, viewBox };
}
function icon(name, options = {}) {
  const definition = definitionFor(name);
  if (!definition) return "";
  const className = ["uif-icon", options.className].filter(Boolean).join(" ");
  const size = normalizeSize(options.size);
  const hidden = options.title ? false : options.hidden !== false;
  const attrs = [
    `class="${escapeAttribute(className)}"`,
    `viewBox="${escapeAttribute(definition.viewBox ?? "0 0 24 24")}"`,
    size ? `width="${escapeAttribute(size)}"` : "",
    size ? `height="${escapeAttribute(size)}"` : "",
    options.title ? 'role="img"' : "",
    hidden ? 'aria-hidden="true"' : "",
    'fill="none"',
    'xmlns="http://www.w3.org/2000/svg"'
  ].filter(Boolean);
  const title = options.title ? `<title>${escapeAttribute(options.title)}</title>` : "";
  return `<svg ${attrs.join(" ")}>${title}${iconBody(definition)}</svg>`;
}
function iconElement(name, options = {}) {
  const markup = icon(name, options);
  if (!markup) throw new Error(`Unknown icon: ${name}`);
  const template = document.createElement("template");
  setTrustedHTML(template, markup, { trusted: true, context: "icon element" });
  return template.content.firstElementChild;
}

// src/mount.ts
function parseSize(value) {
  if (!value) return void 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) && value.trim() !== "" ? numeric : value;
}
function isIconHost(root, selector) {
  return "matches" in root && typeof root.matches === "function" && root.matches(selector);
}
function mountIcons(root = document, options = {}) {
  const selector = options.selector ?? "[data-uif-icon]";
  const targets = [
    ...isIconHost(root, selector) ? [root] : [],
    ...root.querySelectorAll(selector)
  ];
  targets.forEach((target) => {
    if (target.dataset.uifIconMounted === "true") return;
    const name = target.dataset.uifIcon;
    if (!name) return;
    const iconOptions = {
      className: target.dataset.uifIconClass,
      hidden: target.dataset.uifIconHidden === "false" ? false : void 0,
      size: parseSize(target.dataset.uifIconSize ?? null),
      title: target.dataset.uifIconTitle
    };
    try {
      const svg = iconElement(name, iconOptions);
      target.replaceChildren(svg);
      target.dataset.uifIconMounted = "true";
    } catch {
      target.dataset.uifIconMissing = name;
    }
  });
}
export {
  adminSecurityIcons,
  brandIcons,
  chartIcons,
  commerceIcons,
  communicationIcons,
  contentIcons,
  coreUiIcons,
  deviceIcons,
  domainIcons,
  getIconMetadata,
  hasIcon,
  icon,
  iconElement,
  iconMetadata,
  iconSets,
  icons,
  iconsByCategory,
  mountIcons,
  registerIcon,
  searchIcons,
  workflowIcons
};
