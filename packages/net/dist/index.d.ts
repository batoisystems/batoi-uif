interface RequestOptions extends RequestInit {
    timeout?: number;
    parseAs?: 'auto' | 'json' | 'text' | 'response';
    key?: string;
    dedupe?: boolean;
    retries?: number;
    retryDelay?: number;
    idempotent?: boolean;
    csrfToken?: string;
    csrfHeader?: string;
    onUploadProgress?: (loaded: number, total: number) => void;
}
interface UIFRequestError extends Error {
    status?: number;
    response?: Response;
    data?: unknown;
}
type ConnectorType = 'api' | 'json' | 'csv' | 'static' | 'spreadsheet' | 'google-sheet';
type ConnectorMode = 'readonly' | 'readwrite';
interface DataConnector<T = unknown> {
    type: ConnectorType;
    name?: string;
    mode?: ConnectorMode;
    src?: string;
    method?: string;
    headers?: HeadersInit;
    data?: T;
    timeout?: number;
    refreshInterval?: number;
    transform?: (value: unknown) => T | Promise<T>;
}
interface ConnectorBindingOptions extends RequestOptions {
    onError?: (error: unknown) => void;
}
type RequestInterceptor = (url: string, options: RequestOptions) => void | RequestOptions | Promise<void | RequestOptions>;
type ResponseInterceptor = (response: Response) => void | Response | Promise<void | Response>;
declare function useRequestInterceptor(fn: RequestInterceptor): () => void;
declare function useResponseInterceptor(fn: ResponseInterceptor): () => void;
declare function cancelRequest(key: string): void;
declare function request<T = unknown>(url: string, options?: RequestOptions): Promise<T>;
declare function get<T = unknown>(url: string, options?: RequestOptions): Promise<T>;
declare function post<T = unknown>(url: string, data?: unknown, options?: RequestOptions): Promise<T>;
declare function submitForm<T = unknown>(formEl: HTMLFormElement, options?: RequestOptions): Promise<T>;
declare function upload<T = unknown>(url: string, formData: FormData, options?: RequestOptions): Promise<T>;
declare function parseCSV(text: string): string[][];
declare function csvToObjects(text: string): Array<Record<string, string>>;
declare function loadConnector<T = unknown>(connector: DataConnector<T>, options?: RequestOptions): Promise<T>;
declare function bindConnector<T = unknown>(connector: DataConnector<T>, handler: (value: T) => void | Promise<void>, options?: ConnectorBindingOptions): () => void;

export { type ConnectorBindingOptions, type ConnectorMode, type ConnectorType, type DataConnector, type RequestOptions, type UIFRequestError, bindConnector, cancelRequest, csvToObjects, get, loadConnector, parseCSV, post, request, submitForm, upload, useRequestInterceptor, useResponseInterceptor };
