export type Row = (string | number | null)[];

// Baris dimuat per tabel (code-splitting) saat tab Data dibuka.
const loaders: Record<string, () => Promise<{ default: Row[] }>> = {
  Customer: () => import("./row/Customer"),
  Product: () => import("./row/Product"),
  CustomerAddress: () => import("./row/CustomerAddress"),
  SalesOrder: () => import("./row/SalesOrder"),
  Orders: () => import("./row/Orders"),
  Payment: () => import("./row/Payment"),
  Shipment: () => import("./row/Shipment"),
  Review: () => import("./row/Review"),
};

export async function loadRows(table: string): Promise<Row[]> {
  const loader = loaders[table];
  if (!loader) return [];
  return (await loader()).default;
}
