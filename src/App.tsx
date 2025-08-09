import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import MediaList from "./pages/MediaList";
import MediaCommentsPage from "./pages/MediaCommentsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MediaList instagramId="17841464719859291" />} />
        <Route path="/comments/:mediaId" element={<CommentsRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

function CommentsRoute() {
  const { mediaId } = useParams();
  return mediaId ? <MediaCommentsPage mediaId={mediaId} /> : null;
}