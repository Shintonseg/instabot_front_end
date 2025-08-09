import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-[100dvh] bg-[#FFF9F7]">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
