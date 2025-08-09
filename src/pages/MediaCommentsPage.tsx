import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchUnrepliedComments, postCommentReply } from "../services/instagram";
import type { CommentReplyRecord } from "../types/instagram";

export default function MediaCommentsPage({ mediaId }: { mediaId: string }) {
  // caption passed from navigation state (fallback to empty)
  const location = useLocation();
  const caption = (location.state?.caption as string) ?? "";

  const [comments, setComments] = useState<CommentReplyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadComments();
    // reset inputs when media changes
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
      await loadComments();
    } catch (err: any) {
      alert("Failed to send reply: " + err.message);
    } finally {
      setSending(false);
    }
  }

  // --- Send All: gather non-empty replies and submit in parallel
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

      // optional: basic toast/summary
      const ok = results.filter(r => r.status === "fulfilled").length;
      const fail = results.length - ok;
      if (fail > 0) {
        alert(`Sent ${ok}, failed ${fail}.`);
      }

      // clear only the ones we sent
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
    () => Object.values(replyMap).some(v => (v ?? "").trim().length > 0),
    [replyMap]
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header with ID + wrapped caption */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Comments for media{" "}
            <span className="text-blue-600">{mediaId}</span>
          </h2>
          {caption && (
            <p className="mt-1 text-sm text-gray-700 max-w-5xl whitespace-pre-wrap break-words">
              {caption}
            </p>
          )}
        </div>

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

      {loading && <div className="text-sm">Loading comments…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && comments.length === 0 && (
        <div className="text-sm text-gray-500">No unreplied comments found.</div>
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
