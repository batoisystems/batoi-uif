declare function renderAIAction(el: HTMLElement): void;
declare function renderPromptPanel(el: HTMLElement, history?: string[]): void;
declare function renderAssistantResponse(el: HTMLElement, content: string): void;
declare function appendStreamingChunk(el: HTMLElement, chunk: string): void;
declare function createStreamSurface(el: HTMLElement): {
    append(chunk: string): void;
    cancel(): void;
};
declare function renderAIResultCard(el: HTMLElement, content: string): void;
declare const aiAction: {
    name: string;
    init: typeof renderAIAction;
};

export { aiAction, appendStreamingChunk, createStreamSurface, renderAIAction, renderAIResultCard, renderAssistantResponse, renderPromptPanel };
