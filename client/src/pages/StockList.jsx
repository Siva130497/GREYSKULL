import { useEffect, useMemo, useState } from "react";
import { Trash2, Search } from "lucide-react";
import { api } from "../lib/api";
import { getShell, getUser, setActiveShell } from "../lib/storage";
import { emitStockUpdated } from "../lib/events";

import AddStockItemDrawer from "../components/AddStockItemDrawer";
import ProfileMenu from "../components/ProfileMenu";
import ShellSwitcher from "../components/ShellSwitcher";

export default function StockList() {
  const user = getUser();
  const isAdmin = user?.role === "super_admin";

  const [shell, setShellState] = useState(getShell());

  useEffect(() => {
    if (shell || !isAdmin) return;
    api
      .get("/shells")
      .then((res) => {
        const first = res.data?.data?.[0];
        if (!first) return;
        setActiveShell(first);
        setShellState(first);
      })
      .catch(() => {});
  }, [shell, isAdmin]);

  const [items, setItems] = useState([]);
  const [outCount, setOutCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!shell?._id) {
      setItems([]);
      setOutCount(0);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/stock?shellId=${shell._id}`);
      const payload = res.data?.data || {};
      setItems(payload.items || []);
      setOutCount(payload.outCount || 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!shell?._id) return;
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

  const outOfStock = filtered.filter((x) => !x.inStock);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const x of filtered) {
      const cat = x.item?.category || "Uncategorised";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(x);
    }
    const cats = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
    return cats.map((cat) => {
      const list = map.get(cat);
      list.sort((a, b) => (a.item?.name || "").localeCompare(b.item?.name || ""));
      return { cat, list };
    });
  }, [filtered]);

  return (
    <div className="bg-shellbg p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
          <div className="flex items-start justify-between gap-3 min-w-0 lg:flex-1">
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-semibold text-gray-500 tracking-wider uppercase">
                Essential Stock
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1 truncate">
                {shell?.name || "Pick a shell"} Stock List
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                <span>
                  Out of stock:{" "}
                  <span className="font-bold text-red-600">{outCount}</span>
                </span>
                <ShellSwitcher tone="muted" onChange={setShellState} />
              </div>
            </div>
            <div className="lg:hidden shrink-0">
              <ProfileMenu />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search item or category..."
                className="h-11 w-full lg:w-[280px] rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>

            {shell?._id && <AddStockItemDrawer onAdd={addItem} />}

            <div className="hidden lg:block">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </div>

      {!shell?._id ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-sm text-gray-500">
          Pick a shell from the header to view its stock list.
        </div>
      ) : loading ? (
        <StockListSkeleton />
      ) : (
        <>
          {outOfStock.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-extrabold text-sm sm:text-base text-gray-900">
                  Out of stock
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-full">
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

          <div className="space-y-3 sm:space-y-4">
            {grouped.map(({ cat, list }) => (
              <div key={cat} className="bg-white rounded-2xl border shadow-sm">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b flex items-center justify-between gap-3">
                  <div className="font-bold text-sm sm:text-base text-gray-900 truncate">
                    {cat}
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-500 shrink-0">
                    {list.length} items
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-2">
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

          {grouped.length === 0 && !outOfStock.length && (
            <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-sm text-gray-500">
              No items yet — add one to get started.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StockRow({ item, onToggle, onDelete }) {
  const name = item?.item?.name || "";
  const inStock = !!item?.inStock;

  return (
    <div
      className={[
        "rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3",
        inStock ? "bg-white border-gray-200" : "bg-red-50 border-red-200",
      ].join(" ")}
    >
      <label className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none flex-1 min-w-0">
        <input
          type="checkbox"
          checked={inStock}
          onChange={onToggle}
          className="h-5 w-5 accent-red-600 shrink-0"
        />

        <div className="min-w-0">
          <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">
            {name}
          </div>
          {!inStock && (
            <div className="text-[11px] sm:text-xs font-semibold text-red-700">
              Out of stock
            </div>
          )}
        </div>
      </label>

      <button
        onClick={onDelete}
        className="
          shrink-0
          inline-flex items-center justify-center gap-1
          text-xs font-bold
          h-9 sm:h-10
          px-2.5 sm:px-3
          rounded-xl border border-gray-200 bg-white
          hover:bg-gray-50 active:scale-[0.99] transition
          text-gray-700
        "
        title="Remove from this shell"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Delete</span>
      </button>
    </div>
  );
}

function StockListSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3"
            >
              <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-24 rounded bg-gray-200 animate-pulse mt-2" />
              </div>
              <div className="h-9 w-9 sm:w-20 rounded-xl bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
