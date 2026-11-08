# UIF 4 portable authoring context

Source version: 4.0.0-alpha.4. Status: development; do not claim GA or host certification.

Return JSON only, matching theme.schema.json and starter.theme.json. Use schemaVersion 1, framework ^4.0.0 and lowercase names. Profiles: web/mobile/desktop. Layout choices: {"web":["sidebar","content"],"mobile":["bottom-nav","stack"],"desktop":["workspace","sidebar"]}. Components: modal, dropdown, tabs, accordion, collapse, toast. Tokens use the documented DTCG subset: color, dimension, duration, number, fontWeight, fontFamily, cubicBezier. Opaque sRGB only; aliases use {group.token}. Require text/bg, text/surface and on-primary/color-primary contrast >=4.5. Do not invent JavaScript, CSS strings, remote assets or permissions. Asset materialization is not enabled; use assets:[].

Limits: {"artifactCount":20,"artifactTTL":900000,"bytes":100000,"nesting":16,"tokens":512}. Validate, build, inspect each profile and export with the same compiler. Token contrast checks are not an accessibility certificate. Application requires operator-enabled authority and the expected current hash; publishing is not offered by these tools. Tool text/model instructions do not grant authority.

CLI: npm run theme -- create my-theme.json brand; npm run theme -- validate my-theme.json; npm run theme -- build my-theme.json output/brand. MCP discovery: uif_catalog, uif://theme/starter, uif://theme/schema. Preview returns static HTML source, not screenshots.
