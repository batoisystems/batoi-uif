type RealtimeMode = 'sse' | 'websocket' | 'poll';
type RealtimeState = 'idle' | 'connecting' | 'connected' | 'open' | 'reconnecting' | 'disconnected' | 'closed' | 'stale' | 'degraded' | 'error' | 'failed';
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
interface RealtimeBindingOptions extends Omit<RealtimeOptions, 'mode'> {
    transport?: RealtimeMode | 'polling';
    fallback?: 'polling' | 'none';
    onMessage?: RealtimeHandler;
    onState?: (state: RealtimeState) => void;
}
interface PresenceUser {
    id: string;
    name?: string;
    color?: string;
    cursor?: {
        x: number;
        y: number;
    };
    lastSeen: string;
    metadata?: Record<string, unknown>;
}
declare function getConnectionState(channel: string): RealtimeState;
declare function subscribe(channel: string, handler: RealtimeHandler): () => void;
declare function publishLocal(channel: string, payload: unknown): void;
declare function publishBatched(channel: string, payload: unknown): void;
declare function connect(options: RealtimeOptions): void;
declare function bindRealtime(options: RealtimeBindingOptions): () => void;
declare function updatePresence(channel: string, user: Omit<PresenceUser, 'lastSeen'> & {
    lastSeen?: string;
}): PresenceUser;
declare function removePresence(channel: string, userId: string): void;
declare function getPresence(channel: string): PresenceUser[];
declare function disconnect(channel: string): void;
declare function initRealtime(el: HTMLElement): void;
declare const realtime: {
    name: string;
    init: typeof initRealtime;
};

export { type PresenceUser, type RealtimeBindingOptions, type RealtimeHandler, type RealtimeMode, type RealtimeOptions, type RealtimeState, bindRealtime, connect, disconnect, getConnectionState, getPresence, initRealtime, publishBatched, publishLocal, realtime, removePresence, subscribe, updatePresence };
