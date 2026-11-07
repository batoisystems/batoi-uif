// src/ownership.ts
var key = /* @__PURE__ */ Symbol.for("batoi.uif.root-ownership.v4");
var instance = /* @__PURE__ */ Symbol("uif-runtime-instance");
function claimApplicationRoot(root, mode = "strict") {
  const ownerDocument = root.nodeType === 9 ? root : root.ownerDocument;
  if (!ownerDocument || ownerDocument !== globalThis.document)
    throw new Error("Initialize UIF in the application root\u2019s own document");
  let store = Reflect.get(ownerDocument, key);
  if (store && store.instance !== instance)
    throw new Error(
      "Another UIF runtime instance already owns this document; use one bundle/module graph"
    );
  if (!store) {
    store = { instance, roots: /* @__PURE__ */ new Map() };
    Object.defineProperty(ownerDocument, key, { value: store, configurable: true });
  }
  const ownedStore = store;
  const token = /* @__PURE__ */ Symbol("uif-root");
  let active = true;
  const assert = () => {
    if (!active || Reflect.get(ownerDocument, key) !== ownedStore)
      throw new Error("UIF application root lease has been released");
    const currentDocument = root.nodeType === 9 ? root : root.ownerDocument;
    if (currentDocument !== ownerDocument)
      throw new Error("UIF root moved to another document; destroy and remount it");
    for (const [other, record] of ownedStore.roots) {
      if (record.token === token) continue;
      if ((other === root || other.contains(root) || root.contains(other)) && (other === root || mode === "strict" || record.mode === "strict"))
        throw new Error("UIF application roots must not overlap");
    }
  };
  assert();
  ownedStore.roots.set(root, { mode, token });
  return {
    assert,
    destroy() {
      if (!active) return;
      active = false;
      if (ownedStore.roots.get(root)?.token === token) ownedStore.roots.delete(root);
      if (!ownedStore.roots.size && Reflect.get(ownerDocument, key) === ownedStore)
        Reflect.deleteProperty(ownerDocument, key);
    }
  };
}
export {
  claimApplicationRoot
};
