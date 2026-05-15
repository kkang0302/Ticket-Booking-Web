import { useState } from "react";
import { bookings } from "../../data/mockData";
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, Clock, MoreVertical } from "lucide-react";

export default function BookingMonitor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.concertTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['all', 'confirmed', 'pending', 'suspicious', 'failed', 'cancelled'];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'suspicious':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const handleUpdateStatus = (bookingId: string, newStatus: string) => {
    console.log(`Updating booking ${bookingId} to status: ${newStatus}`);
    setSelectedBooking(null);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Booking Monitor</h1>
          <p className="text-muted-foreground">Monitor and manage all ticket bookings</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by booking ID, customer name, email, or concert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent/50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 text-sm">Booking ID</th>
                  <th className="text-left px-6 py-4 text-sm">Customer</th>
                  <th className="text-left px-6 py-4 text-sm">Concert</th>
                  <th className="text-left px-6 py-4 text-sm">Date</th>
                  <th className="text-left px-6 py-4 text-sm">Seats</th>
                  <th className="text-left px-6 py-4 text-sm">Amount</th>
                  <th className="text-left px-6 py-4 text-sm">Status</th>
                  <th className="text-left px-6 py-4 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>{booking.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{booking.customerName}</div>
                      <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{booking.concertTitle}</div>
                      <div className="text-xs text-muted-foreground">{booking.artist}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{new Date(booking.date).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{booking.seats.join(', ')}</div>
                      <div className="text-xs text-muted-foreground">{booking.seats.length} seat(s)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>${booking.totalPrice}</div>
                      {booking.voucherApplied && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {booking.voucherApplied}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className={`text-sm px-2 py-1 rounded ${
                          booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                          booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          booking.status === 'suspicious' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {selectedBooking === booking.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors rounded-t-lg"
                            >
                              Mark as Confirmed
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                            >
                              Cancel Booking
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'suspicious')}
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                            >
                              Flag as Suspicious
                            </button>
                            <button
                              onClick={() => console.log('View details:', booking.id)}
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors rounded-b-lg"
                            >
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No bookings found matching your criteria
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing {filteredBookings.length} of {bookings.length} bookings</div>
        </div>
      </div>
    </div>
  );
}
