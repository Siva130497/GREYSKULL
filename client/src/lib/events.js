export const STOCK_UPDATED_EVENT = "stock:updated";

export function emitStockUpdated() {
  window.dispatchEvent(new Event(STOCK_UPDATED_EVENT));
}