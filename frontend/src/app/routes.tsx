import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/customer/Home";
import ConcertList from "./components/customer/ConcertList";
import ConcertDetail from "./components/customer/ConcertDetail";
import TicketSelection from "./components/customer/TicketSelection";
import Checkout from "./components/customer/Checkout";
import BookingHistory from "./components/customer/BookingHistory";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AdminDashboard from "./components/admin/AdminDashboard";
import BookingMonitor from "./components/admin/BookingMonitor";
import InventoryManagement from "./components/admin/InventoryManagement";
import ConcertManagement from "./components/admin/ConcertManagement";
import ConcertEdit from "./components/admin/ConcertEdit";
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
      { path: "concerts/:id/tickets", Component: TicketSelection },
      { path: "checkout", Component: Checkout },
      { path: "bookings", Component: BookingHistory },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/bookings", Component: BookingMonitor },
      { path: "admin/inventory", Component: InventoryManagement },
      { path: "admin/concerts", Component: ConcertManagement },
      { path: "admin/concerts/:id/edit", Component: ConcertEdit },
      { path: "admin/vouchers", Component: VoucherManagement },
      { path: "*", Component: NotFound },
    ],
  },
]);
