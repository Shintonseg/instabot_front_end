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

  async function handleSeeAll() {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetchAndStoreAllComments(mediaId, limit);
      setToast(`Saved/updated ${res.savedOrUpdated} comments`);
    } catch (e: any) {
      setToast(`Fetch failed: ${e?.message ?? "unknown error"} — showing DB data`);
    } finally {
      setTimeout(() => setToast(null), 2200);
      setSyncing(false);
      // Always open the DB list view (no filter = all)
      navigate(`/media/${mediaId}/comments/all`, { state: { caption } });
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black/85 text-white text-sm px-4 py-2 shadow">
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            Media actions
          </h1>
          <div className="ml-auto text-xs text-gray-600">
            Media: <span className="text-pink-600 font-medium">{mediaId}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Caption bubble */}
        {caption && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {caption}
            </p>
          </div>
        )}

        {/* Action cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Card 1: See all comments (fetch -> navigate) */}
          <section className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500" />
            <div className="p-5 space-y-3">
              <header className="flex items-center gap-2">
                <IconSync />
                <h2 className="font-semibold">Get all comments</h2>
              </header>
              <p className="text-sm text-gray-600">
                Fetch comments from Instagram (batched), upsert into DB, then open the full list.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSeeAll}
                  disabled={syncing}
                  className={[
                    "h-9 px-5 rounded-full text-white text-sm font-medium whitespace-nowrap min-w-[140px] text-center",
                    syncing
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:brightness-95",
                  ].join(" ")}
                >
                  {syncing ? "Loading" : "See all comments"}
                </button>
                <label className="text-sm text-gray-600">Limit</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={limit}
                  onChange={(e) =>
                    setLimit(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
                  }
                  className="w-24 rounded-full border border-gray-300 px-3 py-1 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 2: Unreplied list */}
          <section className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500" />
            <div className="p-5 space-y-3">
              <header className="flex items-center gap-2">
                <IconChat />
                <h2 className="font-semibold">Get unreplied comments</h2>
              </header>
              <p className="text-sm text-gray-600">
                View comments pending reply. Reply individually or in bulk.
              </p>
              <button
                onClick={() =>
                  navigate(`/media/${mediaId}/comments/unreplied`, { state: { caption } })
                }
                className="h-9 px-4 rounded-full text-white text-sm font-medium bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-95"
              >
                Open unreplied comments
              </button>
            </div>
          </section>

          {/* Card 3: Auto-reply */}
          <section className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500" />
            <div className="p-5 space-y-3">
              <header className="flex items-center gap-2">
                <IconBolt />
                <h2 className="font-semibold">Send auto reply</h2>
              </header>
              <p className="text-sm text-gray-600">
                Configure keywords/rules to auto-reply to new comments.
              </p>
              <button
                onClick={() =>
                  navigate(`/media/${mediaId}/auto-reply`, { state: { caption } })
                }
                className="h-9 px-4 rounded-full text-white text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-95"
              >
                Open auto-reply
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* --- tiny inline icons to match IG’s minimal vibe --- */
function IconSync() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-700">
      <path d="M21 12a9 9 0 01-15.3 6.6M3 12A9 9 0 0118.3 5.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 20v-4H3M21 8h-4V4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-700">
      <path d="M20 12a8 8 0 01-8 8 8 8 0 01-3.5-.8L4 21l1.8-4.5A8 8 0 1120 12z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-700">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
