import { Outlet, Navigate } from "react-router-dom";
import { getSession } from "../lib/storage";
import BottomNav from "../components/BottomNav";
import RotateOverlay from "../components/RotateOverlay";
import TabBar from "../components/TabBar";

export default function Layout() {
  const session = getSession();
  if (!session) return <Navigate to="/" />;

  return (
  <div className="h-screen flex flex-col bg-shellbg ">
    <RotateOverlay />
    {/* <div className="h-screen overflow-hidden flex flex-col bg-shellbg">
      <TabBar /> 
      </div> */}
    <div className="h-full
          overflow-y-auto
          pb-[calc(96px+env(safe-area-inset-bottom))]
        ">
      <Outlet /> 
    </div >
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
    <BottomNav />
    </div>

  </div>
);
}