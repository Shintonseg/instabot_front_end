import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, useLocation, Outlet, NavLink, Link } from "react-router-dom";

import MediaList from "./pages/MediaList";
import MediaActionsPage from "./pages/MediaActionsPage";
import MediaCommentsPage from "./pages/MediaCommentsPage";
import AllCommentsPage from "./pages/AllCommentsPage";
import AutoReplyPage from "./pages/AutoReplyPage";

/** Scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

/** Navbar that derives mediaId from the URL */
function Navbar() {
  const { mediaId } = useParams<{ mediaId: string }>();
  const base = `/media/${mediaId}`;

  const linkBase = "px-3 py-2 rounded-full text-sm transition";
  const linkActive = "text-white bg-[#0095F6]";
  const linkInactive = "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1100px] px-4 h-14 flex items-center gap-3">
        {/* Brand / back to home */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400" />
          <span className="text-[18px] font-semibold">Insta Tools</span>
        </Link>

        {/* Links for the current media */}
        <nav className="hidden md:flex items-center gap-2 ml-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) => [linkBase, isActive ? linkActive : linkInactive].join(" ")}
          >
            Media
          </NavLink>
          <NavLink
            to={`${base}/comments/all`}
            className={({ isActive }) => [linkBase, isActive ? linkActive : linkInactive].join(" ")}
          >
            All comments
          </NavLink>
          <NavLink
            to={`${base}/comments/unreplied`}
            className={({ isActive }) => [linkBase, isActive ? linkActive : linkInactive].join(" ")}
          >
            Unreplied
          </NavLink>
          <NavLink
            to={`${base}/auto-reply`}
            className={({ isActive }) => [linkBase, isActive ? linkActive : linkInactive].join(" ")}
          >
            Auto reply
          </NavLink>
        </nav>

        <div className="ml-auto h-8 w-8 rounded-full bg-neutral-200" />
      </div>
    </header>
  );
}

/** Layout used only under /media/:mediaId/* so home stays clean */
function MediaLayout() {
  return (
    <div className="min-h-[100dvh] bg-[#FFF9F7]">
      <Navbar />
      {/* Pages can manage their own inner padding/containers */}
      <Outlet />
    </div>
  );
}

/** Route wrappers (unchanged behavior) */
function ActionsRoute() {
  const { mediaId } = useParams();
  const { state } = useLocation() as { state?: { caption?: string } };
  return mediaId ? <MediaActionsPage mediaId={mediaId} caption={state?.caption ?? ""} /> : null;
}
function UnrepliedRoute() {
  const { mediaId } = useParams();
  return mediaId ? <MediaCommentsPage mediaId={mediaId} /> : null;
}
function AllCommentsRoute() {
  const { mediaId } = useParams();
  return mediaId ? <AllCommentsPage mediaId={mediaId} /> : null;
}
function AutoReplyRoute() {
  const { mediaId } = useParams();
  const { state } = useLocation() as { state?: { caption?: string } };
  return mediaId ? <AutoReplyPage mediaId={mediaId} caption={state?.caption ?? ""} /> : null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Home (no navbar) */}
        <Route path="/" element={<MediaList instagramId="17841464719859291" />} />

        {/* All media-specific pages share the navbar via this layout */}
        <Route path="/media/:mediaId" element={<MediaLayout />}>
          <Route index element={<ActionsRoute />} />
          <Route path="comments/unreplied" element={<UnrepliedRoute />} />
          <Route path="comments/all" element={<AllCommentsRoute />} />
          <Route path="auto-reply" element={<AutoReplyRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
