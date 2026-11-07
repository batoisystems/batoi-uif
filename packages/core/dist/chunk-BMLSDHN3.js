// src/compatibility.ts
var compatibilityMode = "v2";
function configureCompatibility(options) {
  compatibilityMode = options?.mode ?? "v2";
}
function getCompatibilityMode() {
  return compatibilityMode;
}

export {
  configureCompatibility,
  getCompatibilityMode
};
