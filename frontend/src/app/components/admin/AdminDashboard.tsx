import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Users, Ticket, TrendingUp, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { request } from "../../../services/api";
import { Booking as ApiBooking, Concert as ApiConcert, Voucher as ApiVoucher } from "../../../types/api";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [concerts, setConcerts] = useState<ApiConcert[]>([]);
  const [vouchers, setVouchers] = useState<ApiVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsData, concertsData, vouchersData] = await Promise.all([
          request<ApiBooking[]>('/admin/bookings').catch(() => []),
          request<ApiConcert[]>('/admin/concerts').catch(() => []),
          request<ApiVoucher[]>('/admin/vouchers').catch(() => [])
        ]);
        setBookings(bookingsData);
        setConcerts(concertsData);
        setVouchers(vouchersData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'PAID').length;
  const suspiciousBookings = bookings.filter(b => b.status === 'SUSPICIOUS').length;
  const failedBookings = bookings.filter(b => b.status === 'FAILED' || b.status === 'CANCELLED').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'PAID')
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const totalSeatsAvailable = concerts.reduce((sum, c) => 
    sum + (c.ticketCategories?.reduce((acc, tc) => acc + tc.remainingQuantity, 0) || 0), 0);
  const totalSeats = concerts.reduce((sum, c) => 
    sum + (c.ticketCategories?.reduce((acc, tc) => acc + tc.totalQuantity, 0) || 0), 0);
  const occupancyRate = totalSeats > 0 ? ((totalSeats - totalSeatsAvailable) / totalSeats * 100).toFixed(1) : '0.0';

  const bookingsByStatus = [
    { name: 'Confirmed', value: confirmedBookings, color: '#22c55e' },
    { name: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, color: '#eab308' },
    { name: 'Suspicious', value: suspiciousBookings, color: '#f97316' },
    { name: 'Failed', value: failedBookings, color: '#ef4444' },
  ];

  const revenueByDate = bookings
    .filter(b => b.status === 'PAID')
    .reduce((acc: any[], booking) => {
      const date = new Date(booking.createdAt).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.revenue += Number(booking.totalAmount);
      } else {
        acc.push({ date, revenue: Number(booking.totalAmount) });
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
                    <div className="mb-1">{booking.concert?.title || 'Unknown Concert'}</div>
                    <div className="text-sm text-muted-foreground">{booking.user?.fullName || 'Unknown User'}</div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1">${Number(booking.totalAmount).toFixed(2)}</div>
                    <div className={`text-sm px-2 py-1 rounded inline-block ${
                      booking.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
                      booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                      booking.status === 'SUSPICIOUS' ? 'bg-orange-500/10 text-orange-500' :
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
              {concerts.slice(0, 5).map((concert) => {
                const avail = concert.ticketCategories?.reduce((acc, tc) => acc + tc.remainingQuantity, 0) || 0;
                const total = concert.ticketCategories?.reduce((acc, tc) => acc + tc.totalQuantity, 0) || 0;
                return (
                  <div key={concert.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex-1">
                      <div className="mb-1">{concert.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(concert.startTime).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1">{avail} / {total}</div>
                      <div className="text-sm text-muted-foreground">seats</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
