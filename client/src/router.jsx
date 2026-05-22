import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./app/layout";
import Login from "./pages/Login";
import StationDiary from "./pages/StationDiary";
import CostaGuide from "./pages/CostaGuide";
import CostaFaults from "./pages/CostaFaults";
import StockList from "./pages/StockList";
import OpenAndTrading from "./pages/OpenAndTrading";
import Planogram from "./pages/Planogram";
import AdminDashboard from "./pages/AdminDashboard";
import { getUser } from "./lib/storage";

function AuthGate({ children }) {
  const user = getUser();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RoleGate({ allow, fallback = "/app/diary", children }) {
  const user = getUser();
  if (!user) return <Navigate to="/" replace />;
  if (!allow.includes(user.role)) return <Navigate to={fallback} replace />;
  return children;
}

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {
    path: "/app",
    element: <Layout />,
    children: [
      {
        path: "diary",
        element: (
          <AuthGate>
            <StationDiary />
          </AuthGate>
        ),
      },
      {
        path: "costa",
        element: (
          <AuthGate>
            <CostaGuide />
          </AuthGate>
        ),
      },
      {
        path: "faults",
        element: (
          <AuthGate>
            <CostaFaults />
          </AuthGate>
        ),
      },
      {
        path: "stock",
        element: (
          <AuthGate>
            <StockList />
          </AuthGate>
        ),
      },
      {
        path: "trading",
        element: (
          <AuthGate>
            <OpenAndTrading />
          </AuthGate>
        ),
      },
      {
        path: "planogram",
        element: (
          <AuthGate>
            <Planogram />
          </AuthGate>
        ),
      },
      {
        path: "admin",
        element: (
          <RoleGate allow={["super_admin"]}>
            <AdminDashboard />
          </RoleGate>
        ),
      },
    ],
  },
]);
