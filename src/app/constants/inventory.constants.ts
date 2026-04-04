// Allowed state values as const assertions (immutable)
export const InventoryStateOrdered = 'Ordered' as const;
export const InventoryStateReceived = 'Received' as const;
export const InventoryStateUnpacked = 'Unpacked' as const;

// Union type of all valid states
export type InventoryState =
  | typeof InventoryStateOrdered
  | typeof InventoryStateReceived
  | typeof InventoryStateUnpacked;
