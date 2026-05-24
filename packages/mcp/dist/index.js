// src/index.ts
import { emit } from "@batoi/uif-core";
function renderToolApproval(el) {
  const tool = el.dataset.uifTool || "tool";
  const risk = el.dataset.uifRisk || "medium";
  const irreversible = el.dataset.uifIrreversible === "true";
  el.innerHTML = `
    <div class="uif-tool-approval" data-risk="${risk}">
      <strong>${tool}</strong>
      <span class="uif-risk-badge">${risk}${irreversible ? " irreversible" : ""}</span>
      ${irreversible ? '<input data-uif-role="confirm" placeholder="Type APPROVE">' : ""}
      <button data-uif-action="approve">Approve</button>
      <button data-uif-action="reject">Reject</button>
    </div>`;
  el.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("[data-uif-action]") : null;
    const action = target?.dataset.uifAction;
    const confirmation = el.querySelector('[data-uif-role="confirm"]');
    if (action === "approve" && irreversible && confirmation?.value !== "APPROVE") {
      emit("uif:tool-confirmation-required", { tool, risk }, el);
      return;
    }
    if (action === "approve" || action === "reject") emit(`uif:tool-${action}`, { tool, risk, irreversible }, el);
  });
}
function renderToolProgress(el, message) {
  el.innerHTML = `<div class="uif-tool-progress" role="status">${message}</div>`;
}
function renderToolTimeline(el, steps) {
  el.innerHTML = `<ol class="uif-tool-timeline">${steps.map((step) => `<li data-uif-state="${step.state ?? "pending"}">${step.label}</li>`).join("")}</ol>`;
}
function renderToolAuditTrail(el, entries) {
  el.innerHTML = `<ol class="uif-tool-audit">${entries.map((entry) => `<li><strong>${entry.actor ?? "system"}</strong> ${entry.action} <time>${entry.at ?? ""}</time></li>`).join("")}</ol>`;
}
function renderDiff(el, before, after) {
  el.innerHTML = `<div class="uif-diff"><pre data-uif-role="before">${before}</pre><pre data-uif-role="after">${after}</pre></div>`;
}
function renderToolResult(el, result) {
  el.innerHTML = `<pre class="uif-tool-result">${JSON.stringify(result, null, 2)}</pre>`;
}
var toolApproval = { name: "tool-approval", init: renderToolApproval };
export {
  renderDiff,
  renderToolApproval,
  renderToolAuditTrail,
  renderToolProgress,
  renderToolResult,
  renderToolTimeline,
  toolApproval
};
