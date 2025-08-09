import { useEffect, useState } from "react";
import { fetchMedia } from "../services/instagram";
import type { Media } from "../types/instagram";

export default function MediaComments({ instagramId }: { instagramId: string }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [selected, setSelected] = useState<Media | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Media list */}
      <section className="lg:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Media</h2>
          {media.length > 0 && (
            <span className="text-xs text-gray-500">{media.length} items</span>
          )}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {/* Sticky search / toolbar if you need later */}
          <div className="p-3 border-b bg-gray-50">
            <input
              disabled
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
              placeholder="Search (coming soon)"
            />
          </div>

          <div className="max-h-[70vh] overflow-auto p-3 space-y-3">
            {loading && (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && media.length === 0 && (
              <div className="text-sm text-gray-500">No media found.</div>
            )}

            {!loading &&
              media.map((m) => {
                const active = selected?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className={[
                      "block w-full text-left rounded-xl border p-3 transition",
                      "hover:shadow-sm hover:bg-gray-50",
                      active ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50" : "border-gray-200 bg-white",
                    ].join(" ")}
                  >
                    <div className="text-sm font-medium line-clamp-2">
                      {m.caption || "(no caption)"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">ID: {m.id}</div>
                  </button>
                );
              })}

            {next && (
              <div className="pt-1">
                <button
                  disabled
                  className="w-full rounded-lg border px-3 py-2 text-sm text-gray-600 bg-white hover:bg-gray-50"
                  title="Wire ?after=... on backend to enable"
                >
                  Load more (enable pagination on backend)
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </section>

      {/* Right: Comments panel (placeholder until you send the endpoint) */}
      <section className="lg:col-span-2">
        <h2 className="text-lg font-semibold mb-3">Comments</h2>

        <div className="bg-white rounded-2xl border shadow-sm p-6 min-h-[40vh]">
          {!selected && (
            <div className="text-sm text-gray-500">
              Select a media from the left to view comments.
            </div>
          )}

          {selected && (
            <div className="space-y-4">
              <div className="pb-4 border-b">
                <div className="text-xs text-gray-500">Selected media</div>
                <div className="text-base font-semibold">{selected.caption || "(no caption)"}</div>
                <div className="text-xs text-gray-500 mt-1">ID: {selected.id}</div>
              </div>

              <div className="text-sm text-gray-500">
                Comments API not wired yet — share your
                <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded">GET /auto/media/{'{mediaId}'}/comments</code>
                controller/DTO and I’ll plug it in.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
