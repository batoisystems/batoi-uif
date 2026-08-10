// src/index.ts
import {
  emit,
  parseUIFJSON,
  validateAgentEnvelope,
  getCompatibilityMode
} from "@batoi/uif-core";
import { appendTextElement, isSafeURL } from "@batoi/uif-dom";
import { cancelRequest, request } from "@batoi/uif-net";
var decisionControllers = /* @__PURE__ */ new WeakMap();
function ownDecisionController(el, abortController) {
  decisionControllers.get(el)?.destroy();
  const controller = {
    destroy() {
      abortController.abort();
      if (decisionControllers.get(el) === controller) decisionControllers.delete(el);
    }
  };
  decisionControllers.set(el, controller);
  return controller;
}
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
var governedIdentifierPattern = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,199}$/;
function createGovernedToolTransport(options) {
  if (!isSafeURL(options.src, {
    context: "network",
    allowHash: false,
    sameOrigin: !options.allowCrossOrigin,
    requireCapability: options.allowCrossOrigin === true
  })) {
    throw new Error("Batoi UIF blocked an unsafe governed tool gateway URL");
  }
  const key = options.key ?? `tool:${crypto.randomUUID()}`;
  const validateResponse = (input) => {
    const result = validateAgentEnvelope(input);
    if (!result.valid || !["tool-review", "tool-progress", "tool-result", "receipt", "error"].includes(result.envelope.kind)) {
      throw new Error(`Invalid governed tool response: ${result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ") || "unexpected envelope kind"}`);
    }
    return result.envelope;
  };
  const baseRequest = {
    key,
    timeout: options.timeout ?? 3e4,
    credentials: options.credentials ?? "same-origin",
    csrfToken: options.csrfToken,
    csrfHeader: options.csrfHeader,
    parseAs: "json",
    retries: 0
  };
  const assertIdentifier = (value, label) => {
    if (!governedIdentifierPattern.test(value)) throw new Error(`Invalid governed tool ${label}`);
  };
  return {
    async submitDecision(decision) {
      assertIdentifier(decision.requestId, "request identifier");
      if (decision.envelopeId) assertIdentifier(decision.envelopeId, "envelope identifier");
      const response = await request(options.src, {
        ...baseRequest,
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          requestId: decision.requestId,
          decision: decision.decision,
          envelopeId: decision.envelopeId,
          reason: decision.reason?.slice(0, 4e3)
        })
      });
      return validateResponse(response);
    },
    async poll(requestId) {
      assertIdentifier(requestId, "request identifier");
      const url = new URL(options.src, window.location.href);
      url.searchParams.set("requestId", requestId);
      return validateResponse(await request(url.href, { ...baseRequest, method: "GET" }));
    },
    cancel() {
      cancelRequest(key);
    }
  };
}
function renderToolPlan(el, items, options = {}) {
  const section = document.createElement("section");
  section.className = "uif-tool-plan";
  section.setAttribute("role", "region");
  appendTextElement(section, "h3", "Proposed tool plan");
  const list = document.createElement("ol");
  boundedItems(items, options).forEach((entry) => {
    const item = document.createElement("li");
    item.dataset.uifPlanId = String(entry.id ?? "").slice(0, 200);
    item.dataset.uifApproval = entry.approval ?? "required";
    appendTextElement(item, "strong", String(entry.tool ?? "").slice(0, 1e3));
    appendTextElement(item, "p", String(entry.summary ?? "").slice(0, 1e4));
    if (Array.isArray(entry.dependsOn) && entry.dependsOn.length) appendTextElement(item, "p", `Depends on: ${entry.dependsOn.slice(0, 100).map(String).join(", ")}`);
    if (entry.expectedOutput) appendTextElement(item, "p", `Expected output: ${String(entry.expectedOutput).slice(0, 1e4)}`);
    list.append(item);
  });
  section.append(list);
  el.replaceChildren(section);
}
function renderToolDiscovery(el, tools, options = {}) {
  const section = document.createElement("section");
  section.className = "uif-tool-discovery";
  section.setAttribute("role", "region");
  appendTextElement(section, "h3", "Available governed tools");
  const list = document.createElement("ul");
  boundedItems(tools, options).forEach((tool) => {
    const item = document.createElement("li");
    item.dataset.uifTool = String(tool.name ?? "").slice(0, 200);
    item.dataset.uifRisk = tool.risk ?? "medium";
    item.dataset.uifState = tool.available === false ? "unavailable" : "available";
    item.dataset.uifApproval = tool.approval ?? "required";
    appendTextElement(item, "strong", String(tool.title ?? tool.name ?? "").slice(0, 1e3));
    if (tool.description) appendTextElement(item, "p", String(tool.description).slice(0, 1e4));
    if (tool.scopes?.length) appendTextElement(item, "p", `Scopes: ${boundedItems(tool.scopes.map(String), options).join(", ")}`);
    list.append(item);
  });
  section.append(list);
  el.replaceChildren(section);
}
function renderToolPermissions(el, scopes, options = {}) {
  const section = document.createElement("section");
  section.className = "uif-tool-permissions";
  section.setAttribute("role", "region");
  appendTextElement(section, "h3", "Permissions and scope");
  const list = document.createElement("ul");
  boundedItems(scopes, options).forEach((scope) => {
    const item = document.createElement("li");
    item.dataset.uifState = scope.state;
    appendTextElement(item, "strong", String(scope.name ?? "").slice(0, 1e3));
    if (scope.detail) appendTextElement(item, "span", String(scope.detail).slice(0, 1e4));
    if (scope.expiresAt) {
      const time = appendTextElement(item, "time", scope.expiresAt);
      time.dateTime = scope.expiresAt;
    }
    list.append(item);
  });
  section.append(list);
  el.replaceChildren(section);
}
function renderToolReceipt(el, receipt, options = {}) {
  const section = document.createElement("section");
  section.className = "uif-tool-receipt";
  section.dataset.uifState = receipt.status;
  section.dataset.uifVerified = String(receipt.verified === true);
  section.setAttribute("role", "region");
  appendTextElement(section, "h3", receipt.verified ? "Verified execution receipt" : "Server-reported execution receipt");
  appendTextElement(section, "p", String(receipt.summary ?? "").slice(0, 1e4));
  if (receipt.auditRef) appendTextElement(section, "p", `Audit reference: ${receipt.auditRef}`);
  if (receipt.issuedAt) {
    const time = appendTextElement(section, "time", receipt.issuedAt);
    time.dateTime = receipt.issuedAt;
  }
  if (receipt.artifacts?.length) {
    const list = document.createElement("ul");
    boundedItems(receipt.artifacts, options).forEach((artifact) => {
      const item = document.createElement("li");
      appendTextElement(item, "strong", String(artifact.label ?? "").slice(0, 1e3));
      appendTextElement(item, "code", String(artifact.reference ?? "").slice(0, 4e3));
      if (artifact.checksum) appendTextElement(item, "code", String(artifact.checksum).slice(0, 1e3));
      list.append(item);
    });
    section.append(list);
  }
  el.replaceChildren(section);
}
function renderAgentToolEnvelope(el, input, options = {}) {
  const result = validateAgentEnvelope(input, options);
  if (!result.valid || !["tool-plan", "tool-review", "tool-progress", "tool-result", "receipt"].includes(result.envelope.kind)) {
    emit("uif:agent:error", { code: "AGENT_TOOL_ENVELOPE_INVALID", issues: result.issues }, el);
    return null;
  }
  const envelope = result.envelope;
  const data = envelope.content.find((part) => part.type === "data");
  const text = envelope.content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
  if (envelope.kind === "tool-plan") {
    const items = Array.isArray(data?.value) ? data.value : [];
    renderToolPlan(el, items, options);
  } else if (envelope.kind === "receipt") {
    const source = data?.value && typeof data.value === "object" && !Array.isArray(data.value) ? data.value : {};
    renderToolReceipt(el, {
      id: envelope.id,
      requestId: envelope.requestId,
      status: envelope.status === "partial" || envelope.status === "failed" || envelope.status === "cancelled" ? envelope.status : "completed",
      issuedAt: envelope.createdAt,
      auditRef: envelope.auditRef,
      verified: source.verified === true,
      summary: (source.summary ?? text) || "Execution receipt received.",
      artifacts: source.artifacts
    }, options);
  } else if (envelope.kind === "tool-progress") {
    renderToolProgress(el, text || envelope.status);
  } else if (envelope.kind === "tool-result") {
    renderToolResult(el, data?.value ?? text, options);
  } else {
    renderToolReviewFlow(el, {
      tool: envelope.actor?.label ?? "Governed tool",
      requestId: envelope.requestId,
      expiresAt: envelope.expiresAt,
      auditRef: envelope.auditRef,
      risk: envelope.risk?.level,
      irreversible: envelope.risk?.reversible === false,
      payload: data?.value ?? text
    }, options);
  }
  el.dataset.uifEnvelopeId = envelope.id;
  el.dataset.uifState = envelope.status;
  return envelope;
}
function initAgentToolEnvelope(el) {
  const raw = el.dataset.uifEnvelope;
  if (!raw) return;
  try {
    const result = parseUIFJSON(raw, { shape: "object", limits: { maxItems: 1e3, maxDepth: 16, maxKeys: 1e4 } });
    if (!result.valid || !result.value) throw new Error("Invalid or oversized tool envelope JSON");
    renderAgentToolEnvelope(el, result.value);
    return decisionControllers.get(el);
  } catch (error) {
    emit("uif:agent:error", { code: "AGENT_TOOL_ENVELOPE_JSON", error }, el);
  }
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
  const abortController = new AbortController();
  el.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("[data-uif-action]") : null;
    const action = target?.dataset.uifAction;
    const confirmation = el.querySelector('[data-uif-role="confirm"]');
    if (action === "approve" && irreversible && confirmation?.value !== "APPROVE") {
      emit("uif:tool-confirmation-required", { tool, risk }, el);
      return;
    }
    if (action === "approve" || action === "reject") emit(`uif:tool-${action}`, { tool, risk, irreversible }, el);
  }, { signal: abortController.signal });
  return ownDecisionController(el, abortController);
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
function renderToolReviewFlow(el, request2, options = {}) {
  const review = document.createElement("section");
  review.className = "uif-tool-review";
  review.dataset.risk = request2.risk ?? "medium";
  if (request2.requestId) review.dataset.uifRequestId = request2.requestId;
  if (request2.expiresAt) review.dataset.uifExpiresAt = request2.expiresAt;
  review.setAttribute("role", "region");
  const header = document.createElement("header");
  appendTextElement(header, "strong", request2.tool);
  appendTextElement(header, "span", `${request2.risk ?? "medium"}${request2.irreversible ? " irreversible" : ""}`, "uif-risk-badge");
  review.append(header);
  if (request2.payload !== void 0) {
    const payload = document.createElement("section");
    payload.className = "uif-tool-payload";
    appendTextElement(payload, "h3", "Payload preview");
    appendTextElement(payload, "pre", serializeToolValue(request2.payload, options));
    review.append(payload);
  }
  if (request2.policy?.length) {
    const policyHost = document.createElement("div");
    renderApprovalPolicy(policyHost, request2.policy, options);
    review.append(...Array.from(policyHost.childNodes));
  }
  if (request2.timeline?.length) {
    const timelineHost = document.createElement("div");
    renderToolTimeline(timelineHost, request2.timeline, options);
    review.append(...Array.from(timelineHost.childNodes));
  }
  if (request2.diff) {
    const diffHost = document.createElement("div");
    renderDiff(diffHost, request2.diff.before, request2.diff.after);
    review.append(...Array.from(diffHost.childNodes));
  }
  if (request2.result !== void 0) {
    const resultHost = document.createElement("div");
    renderToolResult(resultHost, request2.result, options);
    review.append(...Array.from(resultHost.childNodes));
  }
  if (request2.audit?.length) {
    const auditHost = document.createElement("div");
    renderToolAuditTrail(auditHost, request2.audit, options);
    review.append(...Array.from(auditHost.childNodes));
  }
  const actions = document.createElement("footer");
  const strictReview = getCompatibilityMode() === "v3";
  const expiresAt = request2.expiresAt ? Date.parse(request2.expiresAt) : Number.NaN;
  const reviewIssues = strictReview ? [!request2.requestId ? "missing-request-id" : "", !request2.expiresAt || Number.isNaN(expiresAt) ? "invalid-expiry" : ""].filter(Boolean) : [];
  ["approve", "reject"].forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.uifAction = action;
    button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    if (action === "approve" && reviewIssues.length) button.disabled = true;
    actions.append(button);
  });
  if (reviewIssues.length) {
    review.dataset.uifState = "unavailable";
    const status = appendTextElement(actions, "p", "Approval is unavailable because the governed review is incomplete.");
    status.setAttribute("role", "status");
    emit("uif:tool-invalid-review", { tool: request2.tool, issues: reviewIssues }, el);
  }
  review.append(actions);
  el.replaceChildren(review);
  let decided = false;
  const abortController = new AbortController();
  el.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("[data-uif-action]") : null;
    const action = target?.dataset.uifAction;
    if (action !== "approve" && action !== "reject") return;
    if (decided) {
      emit("uif:tool-replay-blocked", { tool: request2.tool, requestId: request2.requestId }, el);
      return;
    }
    if (action === "approve" && request2.expiresAt && Date.parse(request2.expiresAt) <= Date.now()) {
      emit("uif:tool-expired", { tool: request2.tool, requestId: request2.requestId, expiresAt: request2.expiresAt }, el);
      return;
    }
    decided = true;
    review.dataset.uifDecision = action;
    review.dataset.uifState = "decision-pending";
    review.setAttribute("aria-busy", "true");
    actions.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
    emit(`uif:tool-${action}`, { tool: request2.tool, risk: request2.risk ?? "medium", irreversible: Boolean(request2.irreversible), payload: request2.payload, requestId: request2.requestId, expiresAt: request2.expiresAt, auditRef: request2.auditRef }, el);
  }, { signal: abortController.signal });
  return ownDecisionController(el, abortController);
}
var toolApproval = { name: "tool-approval", init: renderToolApproval };
var agentTool = { name: "agent-tool", init: initAgentToolEnvelope };
export {
  agentTool,
  createGovernedToolTransport,
  initAgentToolEnvelope,
  renderAgentToolEnvelope,
  renderApprovalPolicy,
  renderDiff,
  renderToolApproval,
  renderToolAuditTrail,
  renderToolDiscovery,
  renderToolPermissions,
  renderToolPlan,
  renderToolProgress,
  renderToolReceipt,
  renderToolResult,
  renderToolReviewFlow,
  renderToolTimeline,
  toolApproval
};
