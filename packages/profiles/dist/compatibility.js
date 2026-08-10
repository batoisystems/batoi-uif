import {
  actions,
  ai,
  charts,
  components,
  core,
  dashboard,
  desktop,
  dom,
  editor,
  effects,
  extensionKit,
  forms,
  icons,
  mcp,
  mobile,
  net,
  overlays,
  push,
  pwa,
  query,
  radAdapter,
  realtime,
  router,
  state,
  table
} from "./chunk-XVX4V2JJ.js";
import {
  uifProfiles
} from "./chunk-ZX3IMQUW.js";

// src/compatibility.ts
import { configureCompatibility } from "@batoi/uif-core";
configureCompatibility({ mode: "diagnostic" });
var compatibilityBuild = Object.freeze({
  version: 3,
  mode: "diagnostic",
  behavior: "v2-compatible",
  purpose: "Run existing v2 behavior while emitting migration diagnostics before strict v3 adoption."
});
export {
  actions,
  ai,
  charts,
  compatibilityBuild,
  components,
  core,
  dashboard,
  desktop,
  dom,
  editor,
  effects,
  extensionKit,
  forms,
  icons,
  mcp,
  mobile,
  net,
  overlays,
  uifProfiles as profiles,
  push,
  pwa,
  query,
  radAdapter,
  realtime,
  router,
  state,
  table
};
