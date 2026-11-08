# UIF 4 selected component contracts

Generated from tools/theme/catalog.mjs; framework source 4.0.0-alpha.5. These six controls are the initial v4 canonical set, not a claim that every v3 component meets the v4 gate. JSON options are empty/strict; use the listed attributes.

## modal

Import: `@batoi/uif-components/modal` / `initModal`. Styles: essential. Actions: open, close, toggle.

Tab wraps in the top dialog; Escape dismisses only the top dismissible overlay.

Fallback: Dialog content requires an ordinary page/link alternative when initially hidden.

Attributes: `{"data-uif-mode":["dismissible","locked"],"data-uif-backdrop":["true","static"],"data-uif-keyboard":["true","false"]}`

Events: uif:open, uif:close, uif:overlay-open, uif:overlay-close.

```html
<button type="button" data-uif-action="open" data-uif-target="#sample-modal">Open dialog</button><div id="sample-modal" class="uif-modal" data-uif="modal" aria-labelledby="sample-modal-title" hidden><div data-uif-role="dialog" aria-labelledby="sample-modal-title"><h3 id="sample-modal-title">Review changes</h3><button type="button" data-uif-action="close">Close dialog</button></div></div>
```

## dropdown

Import: `@batoi/uif-components/dropdown` / `initDropdown`. Styles: essential. Actions: open, close, toggle.

Arrow keys, Home, End, typeahead; Escape returns focus; Tab closes without trapping.

Fallback: Keep important navigation as visible native links without JavaScript.

Attributes: `{}`

Events: no component-specific event contract yet.

```html
<div class="uif-dropdown" data-uif="dropdown"><button type="button" data-uif-role="trigger">Actions</button><div data-uif-role="panel"><button type="button" data-uif-role="item">Edit record</button><button type="button" data-uif-role="item" disabled>Delete unavailable</button></div></div>
```

## tabs

Import: `@batoi/uif-components/tabs` / `initTabs`. Styles: essential. Actions: none.

Arrow keys respect orientation and RTL; Home/End; manual Enter/Space. Disabled tabs are skipped.

Fallback: Sequential content sections remain visible before enhancement.

Attributes: `{"data-uif-activation":["automatic","manual"],"data-uif-orientation":["horizontal","vertical"]}`

Events: no component-specific event contract yet.

```html
<div data-uif="tabs"><div data-uif-role="tablist" aria-label="Record details"><button type="button" data-uif-role="tab">Overview</button><button type="button" data-uif-role="tab">History</button></div><section data-uif-role="tabpanel">Overview content</section><section data-uif-role="tabpanel">History content</section></div>
```

## accordion

Import: `@batoi/uif-components/accordion` / `initAccordion`. Styles: essential. Actions: toggle.

Native button click, Enter, Space.

Fallback: Section content is visible before enhancement.

Attributes: `{"data-uif-state":["expanded","collapsed"]}`

Events: no component-specific event contract yet.

```html
<section data-uif="accordion"><h3><button type="button" data-uif-role="trigger">More details</button></h3><div data-uif-role="panel">Disclosure content</div></section>
```

## collapse

Import: `@batoi/uif-components/collapse` / `initCollapse`. Styles: essential. Actions: toggle.

Use a native button trigger. Applications own trigger labels and expanded state.

Fallback: Content remains visible before enhancement.

Attributes: `{"data-uif-state":["expanded","collapsed"]}`

Events: no component-specific event contract yet.

```html
<button type="button" data-uif-action="toggle" data-uif-target="#sample-collapse">Toggle details</button><section id="sample-collapse" data-uif="collapse">Collapsible details</section>
```

## toast

Import: `@batoi/uif-components/toast` / `initToast`. Styles: essential. Actions: close.

Native dismiss button. Duration pauses while focused or hovered.

Fallback: Inline status text.

Attributes: `{"data-uif-type":["info","success","warning","danger"],"data-uif-duration":"milliseconds; 0 uses the default duration","data-uif-dismissible":["true","false"]}`

Events: no component-specific event contract yet.

```html
<div data-uif="toast" class="uif-toast" data-uif-duration="600000">Saved successfully<button type="button" data-uif-action="close" aria-label="Dismiss notification">Close</button></div>
```
