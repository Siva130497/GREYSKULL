import { Outlet, Navigate } from "react-router-dom";
import { getSession } from "../lib/storage";
import BottomNav from "../components/BottomNav";

export default function Layout() {
  const session = getSession();
  if (!session?.token || !session?.user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-shellbg">
      <main
        className="
          flex-1 overflow-y-auto
          pb-[calc(80px+env(safe-area-inset-bottom))]
          md:pb-[calc(96px+env(safe-area-inset-bottom))]
        "
      >
        <Outlet />
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <BottomNav />
      </div>
    </div>
  );
}
