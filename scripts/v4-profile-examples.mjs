// Trusted, generated integration fixtures. JSON responses are static, not a backend.
export const profileExamples = {
  web: {
    start: 'startWeb', title: 'Selected web controls',
    markup: `<div data-uif="shell" class="uif-stack">
      <header class="uif-page-head"><h1>Selected web controls</h1><button class="uif-btn" data-uif-action="open" data-uif-target="#details">Open details</button></header>
      <nav data-uif-role="nav" aria-label="Primary"><a href="#content">Content</a></nav>
      <main id="content" data-uif-role="main"><p>Server-rendered content stays readable before enhancement.</p>
        <div data-uif="combobox" class="uif-field"><label for="owner">Owner</label><input id="owner" class="uif-input" autocomplete="off"><div data-uif-role="listbox" aria-label="Owners"><button data-uif-role="option">Ada</button><button data-uif-role="option" disabled>Unavailable</button><button data-uif-role="option">Grace</button></div></div>
        <div id="details" class="uif-drawer uif-drawer-right" data-uif="drawer" aria-label="Details" hidden><div class="uif-drawer-body"><h2>Details</h2><p>This is a browser drawer, not a native window.</p><button class="uif-btn" data-uif-action="close" data-uif-target="#details">Close details</button></div></div>
      </main></div>`,
  },
  rad: {
    start: 'startRAD', title: 'Selected RAD CRUD',
    markup: `<header><h1>Selected RAD CRUD</h1><p>Static, same-origin JSON fixtures demonstrate integration. No record is persisted, authenticated or changed on a server.</p></header>
      <main class="uif-stack">
        <form class="uif-card uif-stack" data-uif="form" action="./save.json" method="get" data-uif-target="#save-result"><h2>Form validation</h2><label for="record-name">Record name</label><input id="record-name" class="uif-input" name="name" data-uif-rule="required" required><button class="uif-btn" type="submit">Save demo</button><button class="uif-btn uif-btn-secondary" type="reset">Reset</button></form>
        <section id="save-result" aria-live="polite">No submission yet.</section>
        <section><h2>Partial component replacement</h2><button class="uif-btn" data-uif="ajax" data-uif-src="./partial.json" data-uif-target="#record-tabs">Load partial</button><div id="record-tabs" data-uif="tabs" class="uif-tabs"><div data-uif-role="tablist" aria-label="Record sections"><button data-uif-role="tab">Summary</button><button data-uif-role="tab">History</button></div><section data-uif-role="tabpanel">Original summary</section><section data-uif-role="tabpanel">Original history</section></div></section>
        <section class="uif-table-wrap"><h2>Server-page table</h2><table id="records" class="uif-table" data-uif="table" data-uif-mode="remote" data-uif-src="./rows.json"><caption>Demo records — static response, not a live query</caption><thead><tr><th scope="col" data-uif-column="name">Name</th><th scope="col" data-uif-column="status">Status</th></tr></thead><tbody><tr><td>Server fallback</td><td>Ready</td></tr></tbody></table></section>
      </main>`,
    files: {
      'save.json': { html: '<p>Validated demo response received. No record was persisted.</p>' },
      'partial.json': { html: '<div data-uif-role="tablist" aria-label="Record sections"><button data-uif-role="tab">Summary</button><button data-uif-role="tab">History</button></div><section data-uif-role="tabpanel">Refreshed summary</section><section data-uif-role="tabpanel">Refreshed history</section>' },
      'rows.json': { rows: [{ name: 'Example record', status: 'Ready' }], columns: [{ key: 'name' }, { key: 'status' }], total: 1, page: 1, pageSize: 25, totalPages: 1 },
    },
  },
  mobile: {
    start: 'startMobile', title: 'Selected mobile shell',
    markup: `<div class="uif-mobile-shell" data-uif="mobile-shell"><header data-uif-role="topbar"><h1>Selected mobile shell</h1></header><main id="mobile-content" data-uif-role="content"><p>Mobile web only. Service workers, push permission, durable queues and native OS packaging are not included.</p><p data-uif="network-status" class="uif-note"></p><button class="uif-btn" data-uif-action="open" data-uif-target="#sheet">Open sheet</button><section id="sheet" data-uif="sheet" class="uif-sheet-modal uif-p-4" aria-label="Mobile details" hidden><h2>Mobile details</h2><p>Keyboard focus and dismissal share the modal overlay owner.</p><button class="uif-btn" data-uif-action="close" data-uif-target="#sheet">Close sheet</button></section></main><nav data-uif-role="bottom-nav" aria-label="Primary"><a href="#mobile-content" aria-current="page">Home</a><a href="#profile-note">Profile</a></nav><p id="profile-note">Connection status is a browser hint, not proof that the backend is reachable.</p></div>`,
  },
  desktop: {
    start: 'startDesktop', title: 'Selected desktop workspace',
    markup: `<div data-uif="desktop-shell" class="uif-desktop-shell"><aside class="uif-desktop-sidebar" data-uif-role="sidebar"><nav class="uif-desktop-nav" data-uif-role="nav" aria-label="Workspace"><a class="uif-desktop-nav-item" href="#workspace-content" aria-current="page">Workspace</a><a class="uif-desktop-nav-item" href="#preferences">Preferences</a></nav></aside><div class="uif-desktop-main"><header class="uif-desktop-topbar"><h1>Selected desktop workspace</h1></header><main id="workspace-content" data-uif-role="main" class="uif-desktop-content"><p>Server-rendered browser workspace. No native filesystem, privileged tools, persistent queue or OS packaging.</p><section id="preferences" class="uif-desktop-panel"><div class="uif-desktop-panel-body"><h2>Density preferences</h2><button class="uif-btn" data-uif-action="density" data-uif-density="compact">Set compact density</button><button class="uif-btn uif-btn-secondary" data-uif-action="density" data-uif-density="default">Set default density</button><p>No storage key is configured: these demo preferences are in-memory.</p></div></section></main><footer class="uif-desktop-statusbar"><span data-uif-offline-label role="status"></span></footer></div></div>`,
  },
};
