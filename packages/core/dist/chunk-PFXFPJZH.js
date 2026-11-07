import {
  UIFError
} from "./chunk-JL4ZCOE3.js";

// src/storage-partition.ts
var activeStoragePartition = null;
var identifierPattern = /^[a-zA-Z0-9._-]{1,128}$/;
function validateIdentifier(value, field) {
  const normalized = value.trim();
  if (!identifierPattern.test(normalized)) {
    throw new UIFError(`Invalid UIF storage partition ${field}`, {
      code: "UIF_STORAGE_PARTITION",
      category: "security",
      package: "core",
      phase: "storage",
      recoverable: false
    });
  }
  return normalized;
}
function configureStoragePartition(partition) {
  if (!partition) {
    activeStoragePartition = null;
    return;
  }
  activeStoragePartition = Object.freeze({
    applicationId: validateIdentifier(partition.applicationId, "applicationId"),
    tenantId: validateIdentifier(partition.tenantId ?? "default", "tenantId"),
    principalId: validateIdentifier(partition.principalId, "principalId")
  });
}
function getStoragePartition() {
  return activeStoragePartition;
}
function getStoragePartitionPrefix(partition = activeStoragePartition) {
  if (!partition) return null;
  return `uif:${partition.applicationId}:${partition.tenantId ?? "default"}:${partition.principalId}:`;
}
function partitionStorageKey(key, partition = activeStoragePartition) {
  const normalized = key.trim();
  if (!normalized || normalized.length > 256 || /[\u0000-\u001f\u007f]/.test(normalized)) {
    throw new UIFError("Invalid UIF storage key", {
      code: "UIF_STORAGE_KEY",
      category: "security",
      package: "core",
      phase: "storage",
      recoverable: false
    });
  }
  const prefix = getStoragePartitionPrefix(partition);
  return prefix ? `${prefix}${encodeURIComponent(normalized)}` : normalized;
}
function clearStoragePartition(storage, partition = activeStoragePartition) {
  try {
    const target = storage ?? (typeof window === "undefined" ? void 0 : window.localStorage);
    const prefix = getStoragePartitionPrefix(partition);
    if (!target || !prefix) return 0;
    const keys = [];
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

export {
  configureStoragePartition,
  getStoragePartition,
  getStoragePartitionPrefix,
  partitionStorageKey,
  clearStoragePartition
};
