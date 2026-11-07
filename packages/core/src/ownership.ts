export interface UIFRootLease {
  assert(): void;
  destroy(): void;
}

type Root = Document | HTMLElement;
type Mode = 'strict' | 'compatibility';
interface RootRecord {
  mode: Mode;
  token: symbol;
}
interface RootStore {
  instance: symbol;
  roots: Map<Root, RootRecord>;
}
const key = Symbol.for('batoi.uif.root-ownership.v4');
const instance = Symbol('uif-runtime-instance');

/** Logical UI ownership, not authorization. Use one UIF module graph/document. */
export function claimApplicationRoot(root: Root, mode: Mode = 'strict'): UIFRootLease {
  const ownerDocument = root.nodeType === 9 ? (root as Document) : root.ownerDocument;
  if (!ownerDocument || ownerDocument !== globalThis.document)
    throw new Error('Initialize UIF in the application root’s own document');
  let store = Reflect.get(ownerDocument, key) as RootStore | undefined;
  if (store && store.instance !== instance)
    throw new Error(
      'Another UIF runtime instance already owns this document; use one bundle/module graph',
    );
  if (!store) {
    store = { instance, roots: new Map() };
    Object.defineProperty(ownerDocument, key, { value: store, configurable: true });
  }
  const ownedStore = store;
  const token = Symbol('uif-root');
  let active = true;
  const assert = () => {
    if (!active || Reflect.get(ownerDocument, key) !== ownedStore)
      throw new Error('UIF application root lease has been released');
    const currentDocument = root.nodeType === 9 ? root : root.ownerDocument;
    if (currentDocument !== ownerDocument)
      throw new Error('UIF root moved to another document; destroy and remount it');
    for (const [other, record] of ownedStore.roots) {
      if (record.token === token) continue;
      if (
        (other === root || other.contains(root) || root.contains(other)) &&
        (other === root || mode === 'strict' || record.mode === 'strict')
      )
        throw new Error('UIF application roots must not overlap');
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
    },
  };
}
