import { AgentInteractionEnvelope } from '@batoi/uif-core';

interface AIRenderOptions {
    maxCharacters?: number;
    maxItems?: number;
    showActions?: boolean;
}
interface AgentComposerOptions extends AIRenderOptions {
    label?: string;
    placeholder?: string;
    submitLabel?: string;
    stopLabel?: string;
    templates?: string[];
}
interface AgentComposerController {
    setBusy(busy: boolean): void;
    destroy(): void;
}
interface AgentStreamController {
    append(input: unknown): boolean;
    complete(input?: unknown): void;
    cancel(): void;
    destroy(): void;
}
interface GovernedAgentTransportOptions {
    src: string;
    allowCrossOrigin?: boolean;
    timeout?: number;
    csrfToken?: string;
    csrfHeader?: string;
    credentials?: RequestCredentials;
    key?: string;
}
interface GovernedAgentTransport {
    send(input: unknown): Promise<AgentInteractionEnvelope>;
    poll(requestId: string): Promise<AgentInteractionEnvelope>;
    cancel(): void;
}
declare function renderAIAction(el: HTMLElement): void;
declare function renderPromptPanel(el: HTMLElement, history?: string[], options?: AIRenderOptions): void;
declare function renderAssistantResponse(el: HTMLElement, content: string, options?: AIRenderOptions): void;
declare function appendStreamingChunk(el: HTMLElement, chunk: string, options?: AIRenderOptions): void;
declare function createStreamSurface(el: HTMLElement, options?: AIRenderOptions): {
    append(chunk: string): void;
    cancel(): void;
};
declare function renderAIResultCard(el: HTMLElement, content: string, options?: AIRenderOptions): void;
declare function renderAgentMessage(parent: HTMLElement, envelope: AgentInteractionEnvelope, options?: AIRenderOptions): HTMLElement;
declare function renderAssistantThread(el: HTMLElement, input: unknown[], options?: AIRenderOptions): void;
declare function renderAgentComposer(el: HTMLElement, options?: AgentComposerOptions): AgentComposerController;
declare function createAgentStreamSurface(el: HTMLElement, options?: AIRenderOptions): AgentStreamController;
declare function createGovernedAgentTransport(options: GovernedAgentTransportOptions): GovernedAgentTransport;
declare function initAssistantThread(el: HTMLElement): void;
declare const aiAction: {
    name: string;
    init: typeof renderAIAction;
};
declare const aiThread: {
    name: string;
    init: typeof initAssistantThread;
};
declare const aiComposer: {
    name: string;
    init: typeof renderAgentComposer;
};

export { type AIRenderOptions, type AgentComposerController, type AgentComposerOptions, type AgentStreamController, type GovernedAgentTransport, type GovernedAgentTransportOptions, aiAction, aiComposer, aiThread, appendStreamingChunk, createAgentStreamSurface, createGovernedAgentTransport, createStreamSurface, initAssistantThread, renderAIAction, renderAIResultCard, renderAgentComposer, renderAgentMessage, renderAssistantResponse, renderAssistantThread, renderPromptPanel };
