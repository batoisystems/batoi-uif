interface NotificationItem {
    id: string;
    message: string;
    read?: boolean;
    type?: string;
    data?: unknown;
}
declare function addNotification(item: Omit<NotificationItem, 'id'> & {
    id?: string;
}): NotificationItem;
declare function getNotifications(): NotificationItem[];
declare function unreadCount(): number;
declare function markNotificationsRead(): void;
declare function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'>;
declare function registerPushServiceWorker(path?: string): Promise<ServiceWorkerRegistration | undefined>;
declare function subscribeToPush(options: PushSubscriptionOptionsInit): Promise<PushSubscription | undefined>;
declare function getPushSubscription(): Promise<PushSubscription | null>;
declare function unsubscribeFromPush(): Promise<boolean>;
declare function showInAppNotification(message: string, options?: {
    type?: string;
}): HTMLElement;
interface PushController {
    refresh(): void;
    destroy(): void;
}
declare function initPush(el: HTMLElement): PushController;
declare const push: {
    name: string;
    init: typeof initPush;
};

export { type NotificationItem, type PushController, addNotification, getNotifications, getPushSubscription, initPush, markNotificationsRead, push, registerPushServiceWorker, requestNotificationPermission, showInAppNotification, subscribeToPush, unreadCount, unsubscribeFromPush };
