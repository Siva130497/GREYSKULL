import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { getSession } from "../lib/storage";
import { emitStockUpdated } from "../lib/events";

import AddStockItemDrawer from "../components/AddStockItemDrawer";

export default function StockList() {
  const { shell } = getSession();

  const [items, setItems] = useState([]);
  const [outCount, setOutCount] = useState(0);
  const [search, setSearch] = useState("");

  // ✅ loader state (added)
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true); // ✅ start loading
      const res = await api.get(`/stock?shellId=${shell._id}`);
      const payload = res.data?.data || {};
      setItems(payload.items || []);
      setOutCount(payload.outCount || 0);
    } finally {
      setLoading(false); // ✅ stop loading even if error
    }
  }

  useEffect(() => {
    if (!shell?._id) return;
    load();
  }, [shell?._id]);

  async function toggle(shellStockId) {
    await api.patch(`/stock/${shellStockId}/toggle`);
    await load();
    emitStockUpdated();
  }

  async function remove(shellStockId) {
    await api.delete(`/stock/${shellStockId}`);
    await load();
    emitStockUpdated();
  }

  async function addItem(name, category) {
    await api.post(`/stock`, { shellId: shell._id, name, category });
    await load();
    emitStockUpdated();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((x) => {
      const n = (x.item?.name || "").toLowerCase();
      const c = (x.item?.category || "").toLowerCase();
      return n.includes(q) || c.includes(q);
    });
  }, [items, search]);

  // Out of stock pinned (still grouped later too)
  const outOfStock = filtered.filter((x) => !x.inStock);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const x of filtered) {
      const cat = x.item?.category || "Uncategorised";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(x);
    }
    // sort categories + items
    const cats = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
    return cats.map((cat) => {
      const list = map.get(cat);
      list.sort((a, b) =>
        (a.item?.name || "").localeCompare(b.item?.name || "")
      );
      return { cat, list };
    });
  }, [filtered]);

  return (
    <div className="bg-shellbg p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border shadow-sm p-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
            Essential Stock
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mt-1">
            {shell?.name} Stock List
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Out of stock:{" "}
            <span className="font-bold text-red-600">{outCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item or category..."
            className="h-11 w-[280px] max-w-full rounded-xl border border-gray-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />

          <AddStockItemDrawer onAdd={addItem} />
        </div>
      </div>

      {/* ✅ Loader (added) */}
      {loading ? (
        <StockListSkeleton />
      ) : (
        <>
          {/* Out of stock pinned */}
          {outOfStock.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-extrabold text-gray-900">Out of stock</div>
                <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-full">
                  {outOfStock.length} items
                </div>
              </div>

              <div className="space-y-2">
                {outOfStock.map((x) => (
                  <StockRow
                    key={x._id}
                    item={x}
                    onToggle={() => toggle(x._id)}
                    onDelete={() => remove(x._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Grouped by category */}
          <div className="space-y-4">
            {grouped.map(({ cat, list }) => (
              <div key={cat} className="bg-white rounded-2xl border shadow-sm">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <div className="font-bold text-gray-900">{cat}</div>
                  <div className="text-xs text-gray-500">{list.length} items</div>
                </div>

                <div className="p-4 space-y-2">
                  {list.map((x) => (
                    <StockRow
                      key={x._id}
                      item={x}
                      onToggle={() => toggle(x._id)}
                      onDelete={() => remove(x._id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* bottom spacing so it never hides under tab bar */}
      <div className="h-8" />
    </div>
  );
}

function StockRow({ item, onToggle, onDelete }) {
  const name = item?.item?.name || "";
  const inStock = !!item?.inStock;

  return (
    <div
      className={[
        "rounded-xl border px-4 py-3 flex items-center gap-3",
        inStock ? "bg-white border-gray-200" : "bg-red-50 border-red-200",
      ].join(" ")}
    >
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={inStock}
          onChange={onToggle}
          className="h-5 w-5 accent-red-600"
        />

        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          {!inStock && (
            <div className="text-xs font-semibold text-red-700">
              Out of stock
            </div>
          )}
        </div>
      </label>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onDelete}
          className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-[0.99] transition"
          title="Remove from this shell"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ✅ Skeleton Loader (added) */
function StockListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Out of stock card skeleton */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3"
            >
              <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-24 rounded bg-gray-200 animate-pulse mt-2" />
              </div>
              <div className="h-9 w-20 rounded-xl bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Category cards skeleton */}
      {Array.from({ length: 3 }).map((_, c) => (
        <div key={c} className="bg-white rounded-2xl border shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="h-4 w-44 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
          </div>

          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, r) => (
              <div
                key={r}
                className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3"
              >
                <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="h-9 w-20 rounded-xl bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}