import { UIFError } from './contracts.js';

export interface UIFStoragePartition {
  applicationId: string;
  principalId: string;
  tenantId?: string;
}

let activeStoragePartition: Readonly<UIFStoragePartition> | null = null;
const identifierPattern = /^[a-zA-Z0-9._-]{1,128}$/;

function validateIdentifier(value: string, field: keyof UIFStoragePartition): string {
  const normalized = value.trim();
  if (!identifierPattern.test(normalized)) {
    throw new UIFError(`Invalid UIF storage partition ${field}`, {
      code: 'UIF_STORAGE_PARTITION',
      category: 'security',
      package: 'core',
      phase: 'storage',
      recoverable: false,
    });
  }
  return normalized;
}

export function configureStoragePartition(partition: UIFStoragePartition | null): void {
  if (!partition) {
    activeStoragePartition = null;
    return;
  }
  activeStoragePartition = Object.freeze({
    applicationId: validateIdentifier(partition.applicationId, 'applicationId'),
    tenantId: validateIdentifier(partition.tenantId ?? 'default', 'tenantId'),
    principalId: validateIdentifier(partition.principalId, 'principalId'),
  });
}

export function getStoragePartition(): Readonly<UIFStoragePartition> | null {
  return activeStoragePartition;
}

export function getStoragePartitionPrefix(partition = activeStoragePartition): string | null {
  if (!partition) return null;
  return `uif:${partition.applicationId}:${partition.tenantId ?? 'default'}:${partition.principalId}:`;
}

export function partitionStorageKey(key: string, partition = activeStoragePartition): string {
  const normalized = key.trim();
  if (!normalized || normalized.length > 256 || /[\u0000-\u001f\u007f]/.test(normalized)) {
    throw new UIFError('Invalid UIF storage key', {
      code: 'UIF_STORAGE_KEY',
      category: 'security',
      package: 'core',
      phase: 'storage',
      recoverable: false,
    });
  }
  const prefix = getStoragePartitionPrefix(partition);
  return prefix ? `${prefix}${encodeURIComponent(normalized)}` : normalized;
}

export function clearStoragePartition(storage?: Storage, partition = activeStoragePartition): number {
  try {
    const target = storage ?? (typeof window === 'undefined' ? undefined : window.localStorage);
    const prefix = getStoragePartitionPrefix(partition);
    if (!target || !prefix) return 0;
    const keys: string[] = [];
    for (let index = 0; index < target.length; index += 1) {
      const key = target.key(index);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((key) => target.removeItem(key));
    return keys.length;
  } catch {
    return 0;
  }
}
