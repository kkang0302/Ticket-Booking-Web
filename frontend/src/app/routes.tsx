import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/customer/Home";
import ConcertList from "./components/customer/ConcertList";
import ConcertDetail from "./components/customer/ConcertDetail";
import SeatSelection from "./components/customer/SeatSelection";
import Checkout from "./components/customer/Checkout";
import BookingHistory from "./components/customer/BookingHistory";
import AdminDashboard from "./components/admin/AdminDashboard";
import BookingMonitor from "./components/admin/BookingMonitor";
import InventoryManagement from "./components/admin/InventoryManagement";
import ConcertManagement from "./components/admin/ConcertManagement";
import VoucherManagement from "./components/admin/VoucherManagement";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "concerts", Component: ConcertList },
      { path: "concerts/:id", Component: ConcertDetail },
      { path: "concerts/:id/seats", Component: SeatSelection },
      { path: "checkout", Component: Checkout },
      { path: "bookings", Component: BookingHistory },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/bookings", Component: BookingMonitor },
      { path: "admin/inventory", Component: InventoryManagement },
      { path: "admin/concerts", Component: ConcertManagement },
      { path: "admin/vouchers", Component: VoucherManagement },
      { path: "*", Component: NotFound },
    ],
  },
]);
