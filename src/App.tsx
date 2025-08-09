import MediaList from "./pages/MediaList";

export default function App() {
  const instagramId = "17841464719859291"; // replace with your real mapping
  return (
    <div className="min-h-screen">
      <header className="px-6 py-4 border-b bg-white">
        <h1 className="text-3xl font-bold tracking-tight">Insta Automation</h1>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <MediaList instagramId={instagramId} />
      </main>
    </div>
  );
}
