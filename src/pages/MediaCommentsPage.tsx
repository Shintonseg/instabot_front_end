// src/pages/MediaCommentsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchUnrepliedComments, postCommentReply } from "../services/instagram";
import type { CommentReplyRecord } from "../types/instagram";

type Toast = { id: number; text: string; tone?: "ok" | "warn" };

export default function MediaCommentsPage({ mediaId }: { mediaId: string }) {
  const location = useLocation();
  const caption = (location.state?.caption as string) ?? "";

  const [comments, setComments] = useState<CommentReplyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function handleChange(commentId: string, value: string) {
    setReplyMap((prev) => ({ ...prev, [commentId]: value }));
  }

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

  // helper for avatar initials
  const initials = (name: string) =>
    (name?.trim()?.slice(0, 2) || "US").toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
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

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-3">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold">
            Comments for media{" "}
            <span className="text-pink-600">{mediaId}</span>
          </h2>
          {caption && (
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap break-words">
              {caption}
            </p>
          )}
        </div>

        {/* Actions: Send All */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendAll}
            disabled={!canSendAll || sending}
            className={[
              "h-9 px-4 rounded-full text-white text-sm font-medium",
              canSendAll && !sending
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-95"
                : "bg-gray-300 cursor-not-allowed",
            ].join(" ")}
            title={canSendAll ? "Send all typed replies" : "Type at least one reply"}
          >
            {sending ? "Sending…" : "Send All"}
          </button>
        </div>
      </div>

      {/* List (IG-style cards) */}
      <div className="max-w-3xl space-y-3">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 px-4 py-3 shadow-sm">
            ✅ No unreplied comments found.
          </div>
        )}

        {!loading && !error && comments.map((c) => (
          <article key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start gap-3">
              {/* IG-like avatar ring */}
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px] shrink-0">
                <div className="h-full w-full rounded-full bg-white grid place-items-center">
                  <div className="h-9 w-9 rounded-full bg-gray-200 grid place-items-center text-xs font-semibold text-gray-700">
                    {initials(c.username)}
                  </div>
                </div>
              </div>

              {/* content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-semibold">{c.username}</span>{" "}
                  <span className="text-gray-800">{c.text}</span>
                </div>

                {/* reply input row */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyMap[c.commentId] ?? ""}
                    onChange={(e) => handleChange(c.commentId, e.target.value)}
                    placeholder="Reply…"
                    className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                  <button
                    onClick={() => handleSend(c.commentId)}
                    disabled={sending || !(replyMap[c.commentId]?.trim())}
                    className={[
                      "px-4 py-2 rounded-full text-white text-sm font-medium whitespace-nowrap",
                      replyMap[c.commentId]?.trim()
                        ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:brightness-95"
                        : "bg-gray-300 cursor-not-allowed",
                    ].join(" ")}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
