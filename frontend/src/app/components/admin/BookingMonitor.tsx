import { useState, useEffect } from "react";
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, Clock, MoreVertical } from "lucide-react";
import { request } from "../../../services/api";
import { Booking as ApiBooking } from "../../../types/api";

export default function BookingMonitor() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await request<ApiBooking[]>('/admin/bookings');
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const customerName = booking.user?.fullName || '';
    const customerEmail = booking.user?.email || '';
    const concertTitle = booking.concert?.title || '';

    const matchesSearch = String(booking.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         concertTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'confirmed' && booking.status !== 'PAID') matchesStatus = false;
      if (statusFilter === 'pending' && booking.status !== 'PENDING') matchesStatus = false;
      if (statusFilter === 'cancelled' && booking.status !== 'CANCELLED') matchesStatus = false;
      if (statusFilter === 'failed' && booking.status !== 'FAILED') matchesStatus = false;
      if (statusFilter === 'suspicious' && booking.status !== 'SUSPICIOUS') matchesStatus = false;
    }
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['all', 'confirmed', 'pending', 'suspicious', 'failed', 'cancelled'];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'CANCELLED':
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'SUSPICIOUS':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setSelectedBooking(null);
    try {
      const apiStatus = newStatus === 'confirmed' ? 'PAID' : newStatus.toUpperCase();
      await request(`/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: apiStatus })
      });
      // Refresh bookings
      fetchBookings();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading bookings...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

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
                {filteredBookings.map((booking) => {
                  const bookingItems = booking.items || booking.bookingItems;
                  const itemsCount = bookingItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                  const seatDetails = bookingItems?.map(i => `${i.ticketCategory?.name} x${i.quantity}`).join(', ') || 'None';

                  return (
                    <tr key={booking.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>{String(booking.id).slice(0, 8)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{booking.user?.fullName || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{booking.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{booking.concert?.title || 'Unknown Concert'}</div>
                        <div className="text-xs text-muted-foreground">Various Artists</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{booking.concert ? new Date(booking.concert.startTime).toLocaleDateString() : 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{booking.concert ? new Date(booking.concert.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{seatDetails}</div>
                        <div className="text-xs text-muted-foreground">{itemsCount} seat(s)</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>${Number(booking.totalAmount).toFixed(2)}</div>
                        {booking.voucher?.code && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            {booking.voucher.code}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          <span className={`text-sm px-2 py-1 rounded ${
                            booking.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
                            booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                            booking.status === 'SUSPICIOUS' ? 'bg-orange-500/10 text-orange-500' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {booking.status === 'PAID' ? 'Confirmed' : booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
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
                  );
                })}
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
