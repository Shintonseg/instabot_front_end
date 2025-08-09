import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  fetchUnrepliedComments,
  postCommentReply,
  fetchAndStoreAllComments,
} from "../services/instagram";
import type { CommentReplyRecord } from "../types/instagram";

type Toast = { id: number; text: string; tone?: "ok" | "warn" };

export default function MediaCommentsPage({ mediaId }: { mediaId: string }) {
  const location = useLocation();
  const caption = (location.state?.caption as string) ?? "";

  const [comments, setComments] = useState<CommentReplyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);      // ⬅ syncing all comments
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [limit, setLimit] = useState<number>(50);     // ⬅ adjustable limit for fetch-all
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastId = 0;

  function pushToast(text: string, tone: "ok" | "warn" = "ok") {
    const id = ++toastId + Date.now();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }

  const usernameByCommentId = (cid: string) =>
    comments.find((c) => c.commentId === cid)?.username ?? "user";

  useEffect(() => {
    loadComments();
    setReplyMap({});
  }, [mediaId]);

  async function loadComments() {
    setLoading(true);
    try {
      const page = await fetchUnrepliedComments(mediaId, 0, 50);
      setComments(page.content || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ⬇ NEW: trigger backend to fetch & store ALL comments (then refresh)
  async function handleFetchAll() {
    setSyncing(true);
    try {
      const res = await fetchAndStoreAllComments(mediaId, limit);
      pushToast(`Saved/updated ${res.savedOrUpdated} comments`);
      await loadComments();
    } catch (e: any) {
      pushToast(`Failed to fetch all comments: ${e.message}`, "warn");
    } finally {
      setSyncing(false);
    }
  }

  function handleChange(commentId: string, value: string) {
    setReplyMap((prev) => ({ ...prev, [commentId]: value }));
  }

  // single send -> per-username toast
  async function handleSend(commentId: string) {
    const message = replyMap[commentId]?.trim();
    if (!message) return;
    try {
      setSending(true);
      await postCommentReply(commentId, message);
      setReplyMap((prev) => ({ ...prev, [commentId]: "" }));
      pushToast(`Reply sent to ${usernameByCommentId(commentId)}`);
      await loadComments();
    } catch (err: any) {
      pushToast(`Failed to send to ${usernameByCommentId(commentId)}`, "warn");
    } finally {
      setSending(false);
    }
  }

  // bulk send -> ONE summary toast
  async function handleSendAll() {
    const entries = Object.entries(replyMap)
      .map(([commentId, msg]) => [commentId, msg?.trim()] as const)
      .filter(([, msg]) => !!msg);

    if (entries.length === 0) return;

    setSending(true);
    try {
      const results = await Promise.allSettled(
        entries.map(([commentId, msg]) => postCommentReply(commentId, msg!))
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const total = results.length;
      const fail = total - ok;

      pushToast(
        fail === 0
          ? `✅ Sent ${ok} / ${total} replies`
          : `✅ Sent ${ok} / ${total} replies • ${fail} failed`,
        fail === 0 ? "ok" : "warn"
      );

      setReplyMap((prev) => {
        const next = { ...prev };
        for (const [commentId] of entries) next[commentId] = "";
        return next;
      });

      await loadComments();
    } finally {
      setSending(false);
    }
  }

  const canSendAll = useMemo(
    () => Object.values(replyMap).some((v) => (v ?? "").trim().length > 0),
    [replyMap]
  );

  return (
    <div className="p-6 space-y-4">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-md px-3 py-2 text-sm shadow text-white",
              t.tone === "warn" ? "bg-amber-600" : "bg-green-600",
            ].join(" ")}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Header with caption + actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Comments for media <span className="text-blue-600">{mediaId}</span>
          </h2>
          {caption && (
            <p className="mt-1 text-sm text-gray-700 max-w-5xl whitespace-pre-wrap break-words">
              {caption}
            </p>
          )}
        </div>

        {/* Action bar: limit + Fetch All + Send All */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Limit</label>
          <input
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
            className="w-20 border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={handleFetchAll}
            disabled={syncing}
            className={[
              "h-9 px-3 rounded-md text-white text-sm",
              syncing ? "bg-gray-300 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700",
            ].join(" ")}
            title="Fetch & store all comments for this media"
          >
            {syncing ? "Fetching…" : "Fetch all comments"}
          </button>

          <button
            onClick={handleSendAll}
            disabled={!canSendAll || sending}
            className={[
              "h-9 px-4 rounded-md text-white text-sm",
              canSendAll && !sending
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed",
            ].join(" ")}
            title={canSendAll ? "Send all typed replies" : "Type at least one reply"}
          >
            {sending ? "Sending…" : "Send All"}
          </button>
        </div>
      </div>

      {loading && <div className="text-sm">Loading comments…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && comments.length === 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 px-4 py-3 shadow-sm flex items-start gap-3">
          <div className="text-lg leading-none">✅</div>
          <div className="text-sm">
            <div className="font-semibold">No unreplied comments found</div>
            <div className="opacity-80">
              Great job—looks like you’re all caught up for this media!
            </div>
          </div>
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-3 py-2 text-left">Username</th>
                <th className="border px-3 py-2 text-left">Comment</th>
                <th className="border px-3 py-2 text-left">Reply</th>
                <th className="border px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{c.username}</td>
                  <td className="border px-3 py-2">{c.text}</td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      value={replyMap[c.commentId] ?? ""}
                      onChange={(e) => handleChange(c.commentId, e.target.value)}
                      placeholder="Type reply..."
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() => handleSend(c.commentId)}
                      disabled={sending || !(replyMap[c.commentId]?.trim())}
                      className={[
                        "px-3 py-1 rounded text-white text-sm",
                        replyMap[c.commentId]?.trim()
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-300 cursor-not-allowed",
                      ].join(" ")}
                    >
                      Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
