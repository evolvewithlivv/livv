/** Exact LIVV app icon artwork supplied by the founder. */
const LIVV_ICON = "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAABSxklEQVR42u29";

export function getLivvIconPng(_size: number): Uint8Array {
  return Uint8Array.from(atob(LIVV_ICON), c => c.charCodeAt(0));
}
