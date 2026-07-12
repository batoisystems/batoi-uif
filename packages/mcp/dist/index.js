// src/index.ts
import { emit } from "@batoi/uif-core";
import { appendTextElement } from "@batoi/uif-dom";
function boundedItems(items, options) {
  return items.slice(0, Math.max(1, Math.floor(options.maxItems ?? 100)));
}
function serializeToolValue(value, options = {}) {
  const limit = Math.max(1, Math.floor(options.maxCharacters ?? 1e5));
  let serialized;
  try {
    serialized = JSON.stringify(value, null, 2) ?? "null";
  } catch {
    return "[Unserializable tool payload]";
  }
  return serialized.length > limit ? `${serialized.slice(0, limit)}
[truncated]` : serialized;
}
function renderToolApproval(el) {
  const tool = el.dataset.uifTool || "tool";
  const risk = el.dataset.uifRisk || "medium";
  const irreversible = el.dataset.uifIrreversible === "true";
  const card = document.createElement("div");
  card.className = "uif-tool-approval";
  card.dataset.risk = risk;
  appendTextElement(card, "strong", tool);
  appendTextElement(card, "span", `${risk}${irreversible ? " irreversible" : ""}`, "uif-risk-badge");
  if (irreversible) {
    const input = document.createElement("input");
    input.dataset.uifRole = "confirm";
    input.placeholder = "Type APPROVE";
    card.append(input);
  }
  ["approve", "reject"].forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.uifAction = action;
    button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    card.append(button);
  });
  el.replaceChildren(card);
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
function renderApprovalPolicy(el, checks, options = {}) {
  const section = document.createElement("section");
  section.className = "uif-tool-policy";
  section.setAttribute("role", "region");
  appendTextElement(section, "h3", "Policy checks");
  const list = document.createElement("ul");
  boundedItems(checks, options).forEach((check) => {
    const item = document.createElement("li");
    item.dataset.uifState = check.state;
    appendTextElement(item, "strong", check.label);
    if (check.detail) appendTextElement(item, "span", check.detail);
    list.append(item);
  });
  section.append(list);
  el.replaceChildren(section);
}
function renderToolProgress(el, message) {
  const progress = appendTextElement(document.createElement("div"), "div", message, "uif-tool-progress");
  progress.setAttribute("role", "status");
  el.replaceChildren(progress);
}
function renderToolTimeline(el, steps, options = {}) {
  const list = document.createElement("ol");
  list.className = "uif-tool-timeline";
  boundedItems(steps, options).forEach((step) => {
    const item = appendTextElement(list, "li", step.label);
    item.dataset.uifState = step.state ?? "pending";
  });
  el.replaceChildren(list);
}
function renderToolAuditTrail(el, entries, options = {}) {
  const list = document.createElement("ol");
  list.className = "uif-tool-audit";
  boundedItems(entries, options).forEach((entry) => {
    const item = document.createElement("li");
    appendTextElement(item, "strong", entry.actor ?? "system");
    item.append(` ${entry.action} `);
    appendTextElement(item, "time", entry.at ?? "");
    list.append(item);
  });
  el.replaceChildren(list);
}
function renderDiff(el, before, after) {
  const diff = document.createElement("div");
  diff.className = "uif-diff";
  const beforeEl = appendTextElement(diff, "pre", before);
  beforeEl.dataset.uifRole = "before";
  const afterEl = appendTextElement(diff, "pre", after);
  afterEl.dataset.uifRole = "after";
  el.replaceChildren(diff);
}
function renderToolResult(el, result, options = {}) {
  const pre = appendTextElement(document.createElement("div"), "pre", serializeToolValue(result, options), "uif-tool-result");
  el.replaceChildren(pre);
}
function renderToolReviewFlow(el, request, options = {}) {
  const review = document.createElement("section");
  review.className = "uif-tool-review";
  review.dataset.risk = request.risk ?? "medium";
  if (request.requestId) review.dataset.uifRequestId = request.requestId;
  if (request.expiresAt) review.dataset.uifExpiresAt = request.expiresAt;
  review.setAttribute("role", "region");
  const header = document.createElement("header");
  appendTextElement(header, "strong", request.tool);
  appendTextElement(header, "span", `${request.risk ?? "medium"}${request.irreversible ? " irreversible" : ""}`, "uif-risk-badge");
  review.append(header);
  if (request.payload !== void 0) {
    const payload = document.createElement("section");
    payload.className = "uif-tool-payload";
    appendTextElement(payload, "h3", "Payload preview");
    appendTextElement(payload, "pre", serializeToolValue(request.payload, options));
    review.append(payload);
  }
  if (request.policy?.length) {
    const policyHost = document.createElement("div");
    renderApprovalPolicy(policyHost, request.policy, options);
    review.append(...Array.from(policyHost.childNodes));
  }
  if (request.timeline?.length) {
    const timelineHost = document.createElement("div");
    renderToolTimeline(timelineHost, request.timeline, options);
    review.append(...Array.from(timelineHost.childNodes));
  }
  if (request.diff) {
    const diffHost = document.createElement("div");
    renderDiff(diffHost, request.diff.before, request.diff.after);
    review.append(...Array.from(diffHost.childNodes));
  }
  if (request.result !== void 0) {
    const resultHost = document.createElement("div");
    renderToolResult(resultHost, request.result, options);
    review.append(...Array.from(resultHost.childNodes));
  }
  if (request.audit?.length) {
    const auditHost = document.createElement("div");
    renderToolAuditTrail(auditHost, request.audit, options);
    review.append(...Array.from(auditHost.childNodes));
  }
  const actions = document.createElement("footer");
  ["approve", "reject"].forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.uifAction = action;
    button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    actions.append(button);
  });
  review.append(actions);
  el.replaceChildren(review);
  let decided = false;
  el.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("[data-uif-action]") : null;
    const action = target?.dataset.uifAction;
    if (action !== "approve" && action !== "reject") return;
    if (decided) {
      emit("uif:tool-replay-blocked", { tool: request.tool, requestId: request.requestId }, el);
      return;
    }
    if (action === "approve" && request.expiresAt && Date.parse(request.expiresAt) <= Date.now()) {
      emit("uif:tool-expired", { tool: request.tool, requestId: request.requestId, expiresAt: request.expiresAt }, el);
      return;
    }
    decided = true;
    review.dataset.uifDecision = action;
    actions.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
    emit(`uif:tool-${action}`, { tool: request.tool, risk: request.risk ?? "medium", irreversible: Boolean(request.irreversible), payload: request.payload, requestId: request.requestId, expiresAt: request.expiresAt, auditRef: request.auditRef }, el);
  });
}
var toolApproval = { name: "tool-approval", init: renderToolApproval };
export {
  renderApprovalPolicy,
  renderDiff,
  renderToolApproval,
  renderToolAuditTrail,
  renderToolProgress,
  renderToolResult,
  renderToolReviewFlow,
  renderToolTimeline,
  toolApproval
};
