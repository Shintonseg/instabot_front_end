// src/App.tsx
import { BrowserRouter, Routes, Route, useParams, useLocation } from "react-router-dom";
import MediaList from "./pages/MediaList";
import MediaActionsPage from "./pages/MediaActionsPage";
import MediaCommentsPage from "./pages/MediaCommentsPage";
import AllCommentsPage from "./pages/AllCommentsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MediaList instagramId="17841464719859291" />} />
        <Route path="/media/:mediaId" element={<ActionsRoute />} />
        <Route path="/media/:mediaId/comments/unreplied" element={<UnrepliedRoute />} />
        <Route path="/media/:mediaId/comments/all" element={<AllCommentsRoute />} />
        {/* Auto-reply page placeholder */}
        {/* <Route path="/media/:mediaId/auto-reply" element={<AutoReplyRoute />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

function ActionsRoute() {
  const { mediaId } = useParams();
  const { state } = useLocation();
  return mediaId ? <MediaActionsPage mediaId={mediaId} caption={state?.caption ?? ""} /> : null;
}

function UnrepliedRoute() {
  const { mediaId } = useParams();
  const { state } = useLocation();
  return mediaId ? <MediaCommentsPage mediaId={mediaId} /> : null;
}

function AllCommentsRoute() {
  const { mediaId } = useParams();
  return mediaId ? <AllCommentsPage mediaId={mediaId} /> : null;
}
