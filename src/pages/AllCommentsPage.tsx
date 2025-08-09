// src/pages/AllCommentsPage.tsx
import { useEffect, useState } from "react";
import { fetchAllCommentsFromDb } from "../services/instagram";
import type { CommentReplyRecord } from "../types/instagram";

export default function AllCommentsPage({ mediaId }: { mediaId: string }) {
  const [rows, setRows] = useState<CommentReplyRecord[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [repliedFilter, setRepliedFilter] = useState<"" | "true" | "false">("");

  useEffect(() => {
    load();
  }, [mediaId, page, size, repliedFilter]);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchAllCommentsFromDb(
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
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        All comments (DB) • <span className="text-blue-600">{mediaId}</span>
      </h2>

      <div className="flex items-center gap-3 text-sm">
        <label>Filter:</label>
        <select
          value={repliedFilter}
          onChange={(e) => { setPage(0); setRepliedFilter(e.target.value as any); }}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="false">Unreplied</option>
          <option value="true">Replied</option>
        </select>

        <label className="ml-4">Page size</label>
        <select
          value={size}
          onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }}
          className="border rounded px-2 py-1"
        >
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-3 py-2 text-left">Username</th>
              <th className="border px-3 py-2 text-left">Comment</th>
              <th className="border px-3 py-2 text-left">Replied</th>
              <th className="border px-3 py-2 text-left">Replied At</th>
              <th className="border px-3 py-2 text-left">Replies</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{r.username}</td>
                <td className="border px-3 py-2">{r.text}</td>
                <td className="border px-3 py-2">{r.replied ? "Yes" : "No"}</td>
                <td className="border px-3 py-2">{r.repliedAt ?? "-"}</td>
                <td className="border px-3 py-2">{r.replies?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex items-center gap-2 text-sm">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        >
          Prev
        </button>
        <div>Page {page + 1} / {Math.max(1, totalPages)}</div>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
