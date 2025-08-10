import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useLocation,
  Outlet,
  NavLink,
  Link,
} from "react-router-dom";

import MediaList from "./pages/MediaList";
import MediaActionsPage from "./pages/MediaActionsPage";
import MediaCommentsPage from "./pages/MediaCommentsPage";
import AllCommentsPage from "./pages/AllCommentsPage";
import AutoReplyPage from "./pages/AutoReplyPage";

/** Scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/** Navbar that works on ALL pages (scrollable tabs on small screens) */
function Navbar() {
  const { mediaId } = useParams<{ mediaId: string }>();
  const base = mediaId ? `/media/${mediaId}` : null;

  const linkBase = "px-3 py-2 rounded-full text-sm transition";
  const linkActive = "text-white bg-[#0095F6]";
  const linkInactive = "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1100px] px-4 h-14 flex items-center gap-3">
        {/* Brand / back to home */}
        <Link to="/" className="flex-none flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400" />
          <span className="text-[18px] font-semibold">Insta Tools</span>
        </Link>

        {/* Tabs — always visible; horizontally scrollable on small screens */}
        <nav className="flex-1 min-w-0">
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar [-webkit-overflow-scrolling:touch] ml-2 snap-x snap-mandatory">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                [
                  "snap-start flex-none",
                  linkBase,
                  isActive ? linkActive : linkInactive,
                ].join(" ")
              }
            >
              Media
            </NavLink>

            {/* Only render media-specific tabs when we have a mediaId */}
            {base ? (
              <>
                <NavLink
                  to={`${base}/comments/all`}
                  className={({ isActive }) =>
                    [
                      "snap-start flex-none",
                      linkBase,
                      isActive ? linkActive : linkInactive,
                    ].join(" ")
                  }
                >
                  All comments
                </NavLink>
                <NavLink
                  to={`${base}/comments/unreplied`}
                  className={({ isActive }) =>
                    [
                      "snap-start flex-none",
                      linkBase,
                      isActive ? linkActive : linkInactive,
                    ].join(" ")
                  }
                >
                  Unreplied
                </NavLink>
                <NavLink
                  to={`${base}/auto-reply`}
                  className={({ isActive }) =>
                    [
                      "snap-start flex-none",
                      linkBase,
                      isActive ? linkActive : linkInactive,
                    ].join(" ")
                  }
                >
                  Auto reply
                </NavLink>
              </>
            ) : (
              // Placeholder tabs when no media is selected (disabled look)
              <>
                <span className={[linkBase, "text-gray-400"].join(" ")}>All comments</span>
                <span className={[linkBase, "text-gray-400"].join(" ")}>Unreplied</span>
                <span className={[linkBase, "text-gray-400"].join(" ")}>Auto reply</span>
              </>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex-none h-8 w-8 rounded-full bg-neutral-200" />
      </div>
    </header>
  );
}

/** App-wide layout so Navbar appears on EVERY page */
function AppLayout() {
  return (
    <div className="min-h-[100dvh] bg-[#FFF9F7]">
      <Navbar />
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
        {/* Wrap ALL routes with the app layout so Navbar is everywhere */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<MediaList instagramId="17841464719859291" />} />
          <Route path="/media/:mediaId">
            <Route index element={<ActionsRoute />} />
            <Route path="comments/unreplied" element={<UnrepliedRoute />} />
            <Route path="comments/all" element={<AllCommentsRoute />} />
            <Route path="auto-reply" element={<AutoReplyRoute />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
