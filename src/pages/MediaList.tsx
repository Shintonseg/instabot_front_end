import { useEffect, useMemo, useRef, useState } from "react";
import { fetchMedia } from "../services/instagram";
import type { Media } from "../types/instagram";

export default function MediaList({ instagramId }: { instagramId: string }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // search state
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  // refs to scroll selected card into view
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const page = await fetchMedia(instagramId);
        setMedia(page.items);
        setNext(page.next ?? null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [instagramId]);

  // suggestions (top 8 captions)
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return media
      .filter((m) => (m.caption ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [media, query]);

  function selectMedia(m: Media) {
    setSelectedId(m.id);
    setOpen(false);
    setQuery(m.caption ?? "");
    const node = itemRefs.current[m.id];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(m.id);
      setTimeout(() => setFlashId(null), 1000);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = suggestions[activeIdx] ?? suggestions[0];
      if (target) selectMedia(target);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setOpen(false);
    setActiveIdx(-1);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Media</h2>
        {media.length > 0 && (
          <span className="text-xs text-gray-500">{media.length} items</span>
        )}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b bg-gray-50 relative">
          <div className="relative">
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search by caption…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActiveIdx(-1);
              }}
              onFocus={() => query && setOpen(true)}
              onKeyDown={onKeyDown}
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700"
              >
                ✖
              </button>
            )}

            {/* Suggestions dropdown */}
            {open && suggestions.length > 0 && (
              <div
                className="absolute z-10 mt-1 w-full rounded-xl border bg-white shadow-lg max-h-64 overflow-auto"
                role="listbox"
              >
                {suggestions.map((s, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      className={[
                        "w-full text-left px-3 py-2 text-sm",
                        isActive ? "bg-blue-50" : "hover:bg-gray-50",
                      ].join(" ")}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectMedia(s)}
                      role="option"
                      aria-selected={isActive}
                    >
                      <span className="line-clamp-2">
                        {s.caption || "(no caption)"}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">
                        ID: {s.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="max-h-[70vh] overflow-auto p-4 space-y-3">
          {loading && (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && media.length === 0 && (
            <div className="text-sm text-gray-500">No media found.</div>
          )}

          {!loading &&
            media.map((m) => {
              const isSelected = m.id === selectedId;
              const isFlash = m.id === flashId;
              return (
                <div
                  key={m.id}
                  ref={(el) => {
                    itemRefs.current[m.id] = el;
                  }}
                  className={[
                    "rounded-2xl border p-4 transition",
                    "bg-white hover:bg-gray-50",
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-gray-200",
                    isFlash ? "animate-pulse" : "",
                  ].join(" ")}
                >
                  <div className="text-sm font-medium line-clamp-2">
                    {m.caption || "(no caption)"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">ID: {m.id}</div>
                </div>
              );
            })}

          {next && (
            <div className="pt-2 text-xs text-gray-500">
              More available (backend returned paging). Add <code>?after=…</code>{" "}
              to enable “Load more”.
            </div>
          )}
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </section>
  );
}
