import { useEffect, useState } from "react";
import { fetchMedia } from "../services/instagram";
import type { Media } from "../types/instagram";

export default function MediaComments({ instagramId }: { instagramId: string }) {
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
    <div className="p-4">
      <h2 className="font-semibold mb-3">Media</h2>
      {loading && <div className="text-sm">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="space-y-2">
        {media.map((m) => (
          <div key={m.id} className="border rounded p-2">
            <div className="text-sm">{m.caption || "(no caption)"}</div>
            <div className="text-xs opacity-60">ID: {m.id}</div>
          </div>
        ))}
      </div>
      {next && (
        <div className="mt-3 text-xs opacity-70">
          Backend returned paging info. To load next pages, your controller must accept a query param like `?after=...`.
        </div>
      )}
    </div>
  );
}
