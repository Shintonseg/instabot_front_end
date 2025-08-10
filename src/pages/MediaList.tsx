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

  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement | null>(null);

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

  // filtered list for grid
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return media;
    return media.filter((m) => {
      const text = (m.caption ?? "").toLowerCase();
      return text.includes(q) || m.id.toLowerCase().includes(q);
    });
  }, [media, query]);

  // suggestions (top 8 captions)
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return media
      .filter((m) => (m.caption ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [media, query]);

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
      if (target) handleOpen(target);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleOpen(m: Media) {
    navigate(`/media/${m.id}`, { state: { caption: m.caption ?? "" } });
  }

  function clearSearch() {
    setQuery("");
    setOpen(false);
    setActiveIdx(-1);
    gridRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar with IG gradient title + pill search */}
      <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            Reels
          </h2>

          {filtered.length > 0 && (
            <span className="text-xs text-gray-500">
              {query ? `${filtered.length} of ${media.length}` : `${media.length} items`}
            </span>
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
                      onClick={() => handleOpen(s)}
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

      {/* Reels grid */}
      <div ref={gridRef} className="mx-auto max-w-6xl px-4 py-4">
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="relative rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="w-full pb-[177.78%] bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-sm text-gray-500">No matches.</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((m) => {
              const thumb = m.thumbnail_url ?? m.media_url ?? undefined;
              return (
                <button
                  key={m.id}
                  onClick={() => handleOpen(m)}
                  className="group relative overflow-hidden rounded-2xl bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  title={m.caption ?? ""}
                >
                  {/* 9:16 aspect without plugin */}
                  <div className="relative w-full pb-[177.78%]">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={m.caption || "Media"}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-xs text-gray-500 bg-gray-100">
                        No preview
                      </div>
                    )}

                    {/* video badge */}
                    {m.media_type === "VIDEO" && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Video
                      </span>
                    )}

                    {/* gradient + caption */}
                    <div className="absolute inset-x-0 bottom-0 p-2">
                      <div className="rounded-xl bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2">
                        <div className="line-clamp-2 text-left text-[12px] leading-snug text-white drop-shadow">
                          {m.caption || "(no caption)"}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {next && (
          <div className="pt-3 text-xs text-gray-500">
            Load more.
          </div>
        )}

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>
    </section>
  );
}
