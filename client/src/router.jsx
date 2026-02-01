import { createBrowserRouter } from "react-router-dom";
import Layout from "./app/layout";
import Login from "./pages/Login";
import StationDiary from "./pages/StationDiary";
import CostaGuide from "./pages/CostaGuide";
import TabBar from "./components/TabBar";
import StockList from "./pages/StockList";

// import StockList from "./pages/StockList";
// import More from "./pages/More";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {
    path: "/app",
    element: <Layout />,
    children: [
      { path: "diary", element: <StationDiary /> },
      { path: "costa", element: <CostaGuide /> },
      { path: "stock", element: <StockList /> },
      // { path: "more", element: <More /> }
    ]
  }
]);