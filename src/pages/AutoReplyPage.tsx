import { useState } from "react";
import { useLocation } from "react-router-dom";
import { autoReplyPending } from "../services/instagram";

type Props = { mediaId: string; caption?: string };

export default function AutoReplyPage({ mediaId, caption = "" }: Props) {
  const location = useLocation();
  const incomingCaption = (location.state?.caption as string) ?? caption;

  const [limit, setLimit] = useState(50);
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  async function handleRun() {
    if (!keyword.trim() || !message.trim()) {
      setNotice({ tone: "warn", text: "Keyword and reply message are required." });
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const res = await autoReplyPending(limit, keyword.trim(), message.trim());
      // 👇 show banner under the button
      setNotice({ tone: "ok", text: `Reply sent to ${res.processed} comments` });
    } catch (e: any) {
      setNotice({ tone: "warn", text: `Failed: ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Auto reply</h1>
        <div className="text-sm text-gray-600">
          Context media: <span className="text-blue-600">{mediaId}</span>
        </div>
        {incomingCaption && (
          <p className="text-sm text-gray-700 max-w-5xl whitespace-pre-wrap break-words">
            {incomingCaption}
          </p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Limit</label>
              <input
                type="number"
                min={1}
                max={500}
                value={limit}
                disabled={loading}
                onChange={(e) =>
                  setLimit(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
                }
                className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">How many to process in this run.</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Keyword</label>
              <input
                type="text"
                value={keyword}
                disabled={loading}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='e.g. "link", "location"'
                className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-100"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">Reply message</label>
              <textarea
                value={message}
                disabled={loading}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Your reply message to send when keyword matches"
                className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRun}
              disabled={loading}
              className={[
                "h-9 px-4 rounded-md text-white text-sm",
                loading ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700",
              ].join(" ")}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                  Processing…
                </span>
              ) : (
                "Run auto-reply"
              )}
            </button>

            {/* ✅ Banner-style notification under the button */}
            {notice && (
              <div
                className={[
                  "rounded-lg px-3 py-2 text-sm border",
                  notice.tone === "ok"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-amber-50 text-amber-900 border-amber-200",
                ].join(" ")}
              >
                {notice.text}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-2">
          <h2 className="font-semibold">Tips</h2>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Auto-reply is global: it scans pending comments across media.</li>
            <li>Use narrow keywords (e.g., <code>link</code>, <code>location</code>).</li>
            <li>Start with a small limit to verify behavior.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
