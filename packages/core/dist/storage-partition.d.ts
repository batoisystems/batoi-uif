interface UIFStoragePartition {
    applicationId: string;
    principalId: string;
    tenantId?: string;
}
declare function configureStoragePartition(partition: UIFStoragePartition | null): void;
declare function getStoragePartition(): Readonly<UIFStoragePartition> | null;
declare function getStoragePartitionPrefix(partition?: Readonly<UIFStoragePartition> | null): string | null;
declare function partitionStorageKey(key: string, partition?: Readonly<UIFStoragePartition> | null): string;
declare function clearStoragePartition(storage?: Storage, partition?: Readonly<UIFStoragePartition> | null): number;

export { type UIFStoragePartition, clearStoragePartition, configureStoragePartition, getStoragePartition, getStoragePartitionPrefix, partitionStorageKey };
