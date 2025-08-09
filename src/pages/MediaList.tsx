// src/pages/MediaList.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchMedia } from "../services/instagram";
import type { Media } from "../types/instagram";
import { useNavigate } from "react-router-dom";

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

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const page = await fetchMedia(instagramId);
        setMedia(page.items);
        setNext(page.next ?? null);
      } catch (e: any) {
        setError(e.message ?? "Failed to load media");
      } finally {
        setLoading(false);
      }
    })();
  }, [instagramId]);

  // suggestions (top 8 captions)
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return media.filter(m => (m.caption ?? "").toLowerCase().includes(q)).slice(0, 8);
  }, [media, query]);

  function selectMedia(m: Media) {
    setSelectedId(m.id);
    setOpen(false);
    setQuery(m.caption ?? "");
    const node = itemRefs.current[m.id];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(m.id);
      setTimeout(() => setFlashId(null), 900);
    }
    navigate(`/media/${m.id}`, { state: { caption: m.caption ?? "" } });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => (i - 1 + suggestions.length) % suggestions.length);
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

  // tiny helper for avatar initials
  const initials = (m: Media) =>
    (m.caption?.trim()?.[0] ?? m.id.slice(-2)).toString().toUpperCase();

  return (
    <section className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar with IG gradient title + pill search */}
      <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            Media
          </h2>
          {media.length > 0 && (
            <span className="text-xs text-gray-500">{media.length} items</span>
          )}
          <div className="ml-auto w-full sm:w-96 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <input
              className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Search by caption…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1); }}
              onFocus={() => query && setOpen(true)}
              onKeyDown={onKeyDown}
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700"
                aria-label="Clear search"
              >
                ✖
              </button>
            )}

            {/* Suggestions */}
            {open && suggestions.length > 0 && (
              <div
                className="absolute z-10 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto"
                role="listbox"
              >
                {suggestions.map((s, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      className={[
                        "w-full text-left px-4 py-2 text-sm",
                        isActive ? "bg-pink-50" : "hover:bg-gray-50",
                      ].join(" ")}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectMedia(s)}
                      role="option"
                      aria-selected={isActive}
                    >
                      <span className="line-clamp-2">{s.caption || "(no caption)"}</span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">ID: {s.id}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feed list */}
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="space-y-3">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse" />
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
                  ref={(el) => { itemRefs.current[m.id] = el; }}
                  className={[
                    "rounded-2xl border border-gray-100 bg-white shadow-sm transition",
                    "hover:shadow",
                    isSelected ? "ring-2 ring-pink-200" : "",
                    isFlash ? "animate-pulse" : "",
                  ].join(" ")}
                >
                  <div className="p-4 flex items-start gap-3">
                    {/* IG-like avatar ring */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px] shrink-0">
                      <div className="h-full w-full rounded-full bg-white grid place-items-center">
                        <div className="h-9 w-9 rounded-full bg-gray-200 grid place-items-center text-xs font-semibold text-gray-700">
                          {initials(m)}
                        </div>
                      </div>
                    </div>

                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {m.caption || "(no caption)"}
                      </div>
                      <div className="mt-1 text-[11px] text-gray-500">ID: {m.id}</div>
                    </div>

                    {/* action: open comments */}
                    <button
                      onClick={() => selectMedia(m)}
                      className="ml-2 rounded-full px-3 py-1 text-sm font-medium text-pink-600 hover:bg-pink-50"
                    >
                      Comments
                    </button>
                  </div>
                </div>
              );
            })}

          {next && (
            <div className="pt-2 text-xs text-gray-500">
              More available via paging (add <code>?after=…</code> for Load more).
            </div>
          )}
        </div>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>
    </section>
  );
}
