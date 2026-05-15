import { useState } from "react";
import { bookings } from "../../data/mockData";
import { Calendar, MapPin, Ticket, Download, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

export default function BookingHistory() {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

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

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your concert tickets</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-accent/80'
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
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className={`text-sm px-2 py-1 rounded ${
                          booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                          booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          booking.status === 'suspicious' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Booking #{booking.id}
                      </span>
                    </div>

                    <h3 className="text-xl mb-2">{booking.concertTitle}</h3>
                    <div className="text-muted-foreground mb-3">{booking.artist}</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.date).toLocaleDateString()} at {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Ticket className="w-4 h-4" />
                        <span>Seats: {booking.seats.join(', ')}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </div>

                    {booking.voucherApplied && (
                      <div className="mt-3 text-sm text-green-600 dark:text-green-400">
                        Voucher "{booking.voucherApplied}" applied
                      </div>
                    )}
                  </div>

                  <div className="md:text-right space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Paid</div>
                      <div className="text-2xl text-primary">${booking.totalPrice}</div>
                    </div>

                    {booking.status === 'confirmed' && (
                      <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                        <Download className="w-4 h-4" />
                        Download Ticket
                      </button>
                    )}

                    {booking.status === 'pending' && (
                      <div className="text-sm text-muted-foreground">
                        Payment processing...
                      </div>
                    )}

                    {booking.status === 'failed' && (
                      <button className="w-full md:w-auto px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                        Retry Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
