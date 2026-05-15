import { Link } from "react-router";
import { bookings, concerts, vouchers } from "../../data/mockData";
import { Users, Ticket, TrendingUp, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const suspiciousBookings = bookings.filter(b => b.status === 'suspicious').length;
  const failedBookings = bookings.filter(b => b.status === 'failed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalSeatsAvailable = concerts.reduce((sum, c) => sum + c.availableSeats, 0);
  const totalSeats = concerts.reduce((sum, c) => sum + c.totalSeats, 0);
  const occupancyRate = ((totalSeats - totalSeatsAvailable) / totalSeats * 100).toFixed(1);

  const activeVouchers = vouchers.filter(v => v.status === 'active').length;

  const bookingsByStatus = [
    { name: 'Confirmed', value: confirmedBookings, color: '#22c55e' },
    { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: '#eab308' },
    { name: 'Suspicious', value: suspiciousBookings, color: '#f97316' },
    { name: 'Failed', value: failedBookings, color: '#ef4444' },
  ];

  const revenueByDate = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((acc: any[], booking) => {
      const date = new Date(booking.bookingDate).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.revenue += booking.totalPrice;
      } else {
        acc.push({ date, revenue: booking.totalPrice });
      }
      return acc;
    }, [])
    .slice(0, 7);

  const stats = [
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      link: '/admin/bookings',
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(0)}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      link: '/admin/bookings',
    },
    {
      label: 'Seat Occupancy',
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      link: '/admin/inventory',
    },
    {
      label: 'Suspicious Activity',
      value: suspiciousBookings,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      link: '/admin/bookings',
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor your concert ticket platform performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl mb-6">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl mb-6">Bookings by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Recent Bookings</h2>
              <Link to="/admin/bookings" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="mb-1">{booking.concertTitle}</div>
                    <div className="text-sm text-muted-foreground">{booking.customerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1">${booking.totalPrice}</div>
                    <div className={`text-sm px-2 py-1 rounded inline-block ${
                      booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                      booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      booking.status === 'suspicious' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Upcoming Concerts</h2>
              <Link to="/admin/concerts" className="text-sm text-primary hover:underline">
                Manage all
              </Link>
            </div>
            <div className="space-y-3">
              {concerts.slice(0, 5).map((concert) => (
                <div key={concert.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="mb-1">{concert.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(concert.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1">{concert.availableSeats} / {concert.totalSeats}</div>
                    <div className="text-sm text-muted-foreground">seats</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
