type RealtimeMode = 'sse' | 'websocket' | 'poll';
type RealtimeState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'stale' | 'error';
type RealtimeHandler = (payload: unknown) => void;
interface RealtimeOptions {
    channel: string;
    src?: string;
    mode?: RealtimeMode;
    interval?: number;
    reconnect?: boolean;
    backoff?: number;
    heartbeat?: number;
}
declare function getConnectionState(channel: string): RealtimeState;
declare function subscribe(channel: string, handler: RealtimeHandler): () => void;
declare function publishLocal(channel: string, payload: unknown): void;
declare function publishBatched(channel: string, payload: unknown): void;
declare function connect(options: RealtimeOptions): void;
declare function disconnect(channel: string): void;
declare function initRealtime(el: HTMLElement): void;
declare const realtime: {
    name: string;
    init: typeof initRealtime;
};

export { type RealtimeHandler, type RealtimeMode, type RealtimeOptions, type RealtimeState, connect, disconnect, getConnectionState, initRealtime, publishBatched, publishLocal, realtime, subscribe };
