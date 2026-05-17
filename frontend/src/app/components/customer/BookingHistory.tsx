import { useState, useEffect, useCallback } from "react";
import { Calendar, MapPin, Ticket, Download, CheckCircle, Clock, XCircle, AlertTriangle, Loader } from "lucide-react";
import { request } from "../../../services/api";
import { Booking as ApiBooking } from "../../../types/api";

export default function BookingHistory() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await request<ApiBooking[]>("/bookings/me");
      setBookings(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleMockPay = async (bookingId: number) => {
    const confirmed = window.confirm(
      "This is a mock payment. No real charge will be made. Continue?"
    );
    if (!confirmed) return;

    setPayingId(bookingId);
    setPayError(null);
    try {
      await request(`/bookings/${bookingId}/pay`, { method: "POST" });
      await fetchBookings();
    } catch (err: unknown) {
      setPayError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => {
          if (filter === "confirmed") return b.status === "PAID";
          if (filter === "pending") return b.status === "PENDING";
          if (filter === "cancelled")
            return ["CANCELLED", "FAILED", "EXPIRED"].includes(b.status);
          return true;
        });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "EXPIRED":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "CANCELLED":
      case "FAILED":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    if (status === "PAID") return "Confirmed";
    if (status === "PENDING") return "Awaiting payment";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading bookings...</div>;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 px-4">{error}</div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your concert tickets</p>
        </div>

        {payError && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            {payError}
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["all", "confirmed", "pending", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const concertTitle = booking.concert?.title || "Unknown Concert";
              const venue = booking.concert?.venue || "Unknown Venue";
              const date = booking.concert
                ? new Date(booking.concert.startTime).toLocaleDateString()
                : "";
              const time = booking.concert
                ? new Date(booking.concert.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";
              const bookingItems = booking.items || booking.bookingItems;
              const seatsDescription =
                bookingItems
                  ?.map((i) => `${i.ticketCategory?.name || "Ticket"} x${i.quantity}`)
                  .join(", ") || "No items";

              return (
                <div
                  key={booking.id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              booking.status === "PAID"
                                ? "bg-green-500/10 text-green-500"
                                : booking.status === "PENDING"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : booking.status === "EXPIRED"
                                    ? "bg-orange-500/10 text-orange-500"
                                    : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">Booking #{booking.id}</span>
                      </div>

                      <h3 className="text-xl mb-2">{concertTitle}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {date} at {time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Ticket className="w-4 h-4" />
                          <span>{seatsDescription}</span>
                        </div>
                        <div className="text-muted-foreground">
                          Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {booking.voucher?.code && (
                        <div className="mt-3 text-sm text-green-600 dark:text-green-400">
                          Voucher &quot;{booking.voucher.code}&quot; applied
                        </div>
                      )}
                    </div>

                    <div className="md:text-right space-y-3 min-w-[180px]">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {booking.status === "PAID" ? "Total Paid" : "Amount Due"}
                        </div>
                        <div className="text-2xl text-primary">
                          ${Number(booking.totalAmount).toFixed(2)}
                        </div>
                      </div>

                      {booking.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleMockPay(booking.id)}
                          disabled={payingId === booking.id}
                          className="w-full md:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {payingId === booking.id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Pay money"
                          )}
                        </button>
                      )}

                      {booking.status === "PAID" && (
                        <button
                          type="button"
                          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                        >
                          <Download className="w-4 h-4" />
                          Download Ticket
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
