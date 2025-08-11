// src/pages/AllCommentsPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllCommentsFromDb } from "../services/instagram";
import type { CommentReplyRecord } from "../types/instagram";

type Paged<T> = { content: T[]; totalPages: number };

export default function AllCommentsPage({ mediaId }: { mediaId: string }) {
  const [rows, setRows] = useState<CommentReplyRecord[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [repliedFilter, setRepliedFilter] = useState<"" | "true" | "false">("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaId, page, size, repliedFilter]);

  async function load() {
    setLoading(true);
    try {
      const data: Paged<CommentReplyRecord> = await fetchAllCommentsFromDb(
        mediaId,
        page,
        size,
        repliedFilter === "" ? undefined : repliedFilter === "true"
      );
      setRows(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header with Back + title + media id */}
      <div className="mx-auto max-w-[1100px] px-4 py-6 flex items-center gap-3">
        <Link to=".." className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </Link>
        <h1 className="text-[22px] font-semibold bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          All comments
        </h1>
        <div className="ml-auto text-sm text-gray-500">
          Media: <span className="text-[#c2185b] font-medium">{mediaId}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mx-auto max-w-[1100px] px-4">
        <div className="flex items-center gap-3 text-sm mb-4">
          <label>Filter:</label>
          <select
            value={repliedFilter}
            onChange={(e) => {
              setPage(0);
              setRepliedFilter(e.target.value as any);
            }}
            className="rounded-full border border-gray-300 px-3 py-1 focus:ring-2 focus:ring-pink-500"
            disabled={loading}
          >
            <option value="">All</option>
            <option value="false">Unreplied</option>
            <option value="true">Replied</option>
          </select>

          <label className="ml-4">Page size</label>
          <select
            value={size}
            onChange={(e) => {
              setPage(0);
              setSize(Number(e.target.value));
            }}
            className="rounded-full border border-gray-300 px-3 py-1 focus:ring-2 focus:ring-pink-500"
            disabled={loading}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <span className="ml-auto text-sm text-gray-600">
            {repliedFilter === "false"
              ? `Unreplied: ${rows.length}`
              : repliedFilter === "true"
              ? `Replied: ${rows.length}`
              : `Total: ${rows.length}`}
          </span>

          {loading && <span className="ml-2 animate-pulse">Loading…</span>}
        </div>
      </div>

      {/* List */}
      <div className="mx-auto max-w-[1100px] px-4">
        <div className="space-y-3 max-w-2xl">
          {loading && rows.length === 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse"
              />
            ))}

          {!loading && rows.length === 0 && (
            <div className="text-sm text-gray-500">No comments found.</div>
          )}

          {!loading &&
            rows.map((r) => (
              <article
                key={r.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex items-start gap-3">
                  {/* IG-like avatar ring */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px] shrink-0">
                    <div className="h-full w-full rounded-full bg-white grid place-items-center">
                      <div className="h-9 w-9 rounded-full bg-gray-200 grid place-items-center text-xs font-semibold text-gray-700">
                        {r.username.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* main comment row */}
                    <div className="text-sm">
                      <span className="font-semibold">{r.username}</span>{" "}
                      <span className="text-gray-800">{r.text}</span>
                    </div>
                    <div className="mt-1 text-xs">
                      {r.replied ? (
                        <span className="text-emerald-600 font-medium">Replied</span>
                      ) : (
                        <span className="text-gray-500">Not replied</span>
                      )}
                    </div>

                    {/* replies (show texts instead of repliedAt) */}
                    {r.replies && r.replies.length > 0 && (
                      <div className="mt-3 space-y-2 pl-4 border-l border-gray-200">
                        {r.replies.map((rep) => (
                          <div key={rep.id} className="text-sm">
                            <span className="font-semibold text-pink-600">You</span>{" "}
                            <span className="text-gray-800">{rep.text}</span>
                            <div className="text-[11px] text-gray-400">{rep.timestamp}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
        </div>

        {/* pagination */}
        <div className="flex items-center gap-2 text-sm mt-6">
          <button
            disabled={loading || page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-4 py-1 rounded-full border bg-white disabled:opacity-50"
          >
            Prev
          </button>
          <div>
            Page {page + 1} / {Math.max(1, totalPages)}
          </div>
          <button
            disabled={loading || page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-1 rounded-full border bg-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
