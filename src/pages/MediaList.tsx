import { useEffect, useState } from "react";
import { fetchMedia } from "../services/instagram";
import type { Media } from "../types/instagram";

export default function MediaList({ instagramId }: { instagramId: string }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [next, setNext] = useState<string | null>(null);
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
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Media</h2>
        {media.length > 0 && (
          <span className="text-xs text-gray-500">{media.length} items</span>
        )}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="max-h-[70vh] overflow-auto p-4 space-y-3">
          {loading && (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && media.length === 0 && (
            <div className="text-sm text-gray-500">No media found.</div>
          )}

          {!loading &&
            media.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border bg-white p-3 hover:bg-gray-50 transition"
              >
                <div className="text-sm font-medium line-clamp-2">
                  {m.caption || "(no caption)"}
                </div>
                <div className="mt-1 text-xs text-gray-500">ID: {m.id}</div>
              </div>
            ))}

          {next && (
            <div className="pt-2 text-xs text-gray-500">
              More available (backend returned paging info).  
              Add `@RequestParam String after` to your controller to enable a “Load more” button.
            </div>
          )}
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </section>
  );
}
