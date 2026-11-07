interface UIFRootLease {
    assert(): void;
    destroy(): void;
}
type Root = Document | HTMLElement;
type Mode = 'strict' | 'compatibility';
/** Logical UI ownership, not authorization. Use one UIF module graph/document. */
declare function claimApplicationRoot(root: Root, mode?: Mode): UIFRootLease;

export { type UIFRootLease, claimApplicationRoot };
