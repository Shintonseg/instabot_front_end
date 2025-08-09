import { useEffect, useState } from "react";
import { fetchUnrepliedComments, postCommentReply } from "../services/instagram";
import type { CommentReplyRecord } from "../types/instagram";

export default function MediaCommentsPage({ mediaId }: { mediaId: string }) {
  const [comments, setComments] = useState<CommentReplyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadComments();
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
      await postCommentReply(commentId, message);
      setReplyMap((prev) => ({ ...prev, [commentId]: "" }));
      // Refresh list
      await loadComments();
    } catch (err: any) {
      alert("Failed to send reply: " + err.message);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Comments for media <span className="text-blue-600">{mediaId}</span>
      </h2>

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
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
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
