// src/pages/MediaActionsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAndStoreAllComments } from "../services/instagram";

type Props = { mediaId: string; caption?: string };

export default function MediaActionsPage({ mediaId, caption = "" }: Props) {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(50);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleFetchAll() {
    setSyncing(true);
    try {
      const res = await fetchAndStoreAllComments(mediaId, limit);
      setToast(`Saved/updated ${res.savedOrUpdated} comments`);
      setTimeout(() => setToast(null), 2200);
    } catch (e: any) {
      setToast(`Failed: ${e.message}`);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-sky-600 text-white text-sm px-3 py-2 shadow">
          {toast}
        </div>
      )}

      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Media actions</h1>
        <div className="text-sm text-gray-600">
          Media: <span className="text-blue-600">{mediaId}</span>
        </div>
        {caption && (
          <p className="text-sm text-gray-700 max-w-5xl whitespace-pre-wrap break-words">
            {caption}
          </p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Get all comments (fetch & store) */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-semibold">Get all comments</h2>
          <p className="text-sm text-gray-600">
            Fetches comments from Instagram (in batches) and stores/updates them in DB.
          </p>
          <button
            onClick={handleFetchAll}
            disabled={syncing}
            className={[
              "h-9 px-4 rounded-md text-white text-sm",
              syncing ? "bg-gray-300 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700",
            ].join(" ")}
          >
            {syncing ? "Fetching…" : "Fetch & store"}
          </button>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Limit</label>
            <input
              type="number"
              min={1}
              max={500}
              value={limit}
              onChange={(e) =>
                setLimit(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
              }
              className="w-24 border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Card 2: Get unreplied comments */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-semibold">Get unreplied comments</h2>
          <p className="text-sm text-gray-600">
            Lists comments not yet replied. Reply individually or in bulk.
          </p>
          <button
            onClick={() => navigate(`/media/${mediaId}/comments/unreplied`, { state: { caption } })}
            className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Open unreplied list
          </button>

        </div>

        {/* Card 3: Send auto reply */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-semibold">Send auto reply</h2>
          <p className="text-sm text-gray-600">
            Configure rules/keywords to auto-reply to new comments.
          </p>
          <button
            onClick={() => navigate(`/media/${mediaId}/auto-reply`, { state: { caption } })}
            className="h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
          >
            Open auto-reply
          </button>
        </div>
      </div>
    </div>
  );
}
