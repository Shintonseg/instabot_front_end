import { useMemo, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
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

  const valid = useMemo(() => !!keyword.trim() && !!message.trim(), [keyword, message]);
  const msgLen = message.trim().length;
  const noticeRef = useRef<HTMLDivElement>(null);

  async function handleRun() {
    if (!valid) {
      setNotice({ tone: "warn", text: "Keyword and reply message are required." });
      queueMicrotask(() => noticeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const res = await autoReplyPending(limit, keyword.trim(), message.trim());
      setNotice({ tone: "ok", text: `Reply sent to ${res.processed} comments` });
    } catch (e: any) {
      setNotice({ tone: "warn", text: `Failed: ${e?.message ?? "Unknown error"}` });
    } finally {
      setLoading(false);
      queueMicrotask(() => noticeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFF9F7] text-[#222]">
      {/* header */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-[1100px] px-4 py-6 flex items-center gap-3">
          <Link to=".." className="text-sm text-gray-500 hover:text-gray-700">← Back</Link>
          <h1 className="text-[22px] font-semibold bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Auto reply
          </h1>
          <div className="ml-auto text-sm text-gray-500">
            Media: <span className="text-[#c2185b] font-medium">{mediaId}</span>
          </div>
        </div>
      </div>

      {/* layout: left flexible, right fixed 300px */}
      <div className="mx-auto max-w-[1100px] px-4 py-6 grid gap-6 lg:grid-cols-[minmax(0,1fr),300px]">
        {/* left */}
        <div className="space-y-5">
          {incomingCaption && (
            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <p className="whitespace-pre-wrap leading-relaxed text-[15px] text-[#333]">{incomingCaption}</p>
            </div>
          )}

          <div className="relative rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
            <div className="absolute -top-[2px] left-3 right-3 h-[6px] rounded-b-xl bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400" />

            {/* chips */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {["link", "location", "price", "details"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKeyword(k)}
                  className={[
                    "rounded-full border text-sm px-3 py-1.5 transition",
                    keyword === k
                      ? "bg-[#222] text-white border-[#222]"
                      : "bg-white border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {k}
                </button>
              ))}
              <div className="ml-auto text-xs text-gray-500">Tips: use narrow keywords</div>
            </div>

            {/* limit + keyword */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Limit</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setLimit((n) => Math.max(1, n - 10))}
                    className="h-8 w-8 rounded-full border border-gray-200 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={limit}
                    disabled={loading}
                    onChange={(e) => setLimit(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-center disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setLimit((n) => Math.min(500, n + 10))}
                    className="h-8 w-8 rounded-full border border-gray-200 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">How many to process in this run.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  disabled={loading}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g. "link", "location"'
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* message */}
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Reply message</label>
              <textarea
                value={message}
                disabled={loading}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write a friendly reply…"
                className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span>Keep it short and human.</span>
                <span>{msgLen} chars</span>
              </div>
            </div>

            {/* actions */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={loading || !valid}
                className={[
                  "h-9 rounded-full px-5 text-sm font-medium text-white transition",
                  loading || !valid ? "bg-[#B2DFFC] cursor-not-allowed" : "bg-[#0095F6] hover:bg-[#1877F2]",
                ].join(" ")}
              >
                {loading ? "Processing…" : "Send auto-reply"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => { setKeyword(""); setMessage(""); setNotice(null); }}
                className="h-9 rounded-full px-4 text-sm border border-gray-200 bg-white hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            {/* notice sits immediately under the buttons */}
            {notice && (
              <div
                ref={noticeRef}
                className={[
                  "mt-3 rounded-xl px-3 py-2 text-sm border",
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

        {/* right (tips) – fixed narrow, sticky, minimal height */}
        <aside className="self-start sticky top-20 h-fit rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <h2 className="font-semibold text-[15px] mb-2">Tips</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Auto-reply scans pending comments across media.</li>
            <li>Use narrow keywords (e.g., <code>link</code>, <code>location</code>).</li>
            <li>Start with a small limit to verify behavior.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
