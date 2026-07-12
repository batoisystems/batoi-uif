interface AIRenderOptions {
    maxCharacters?: number;
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
declare const aiAction: {
    name: string;
    init: typeof renderAIAction;
};

export { type AIRenderOptions, aiAction, appendStreamingChunk, createStreamSurface, renderAIAction, renderAIResultCard, renderAssistantResponse, renderPromptPanel };
