import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Zap } from "lucide-react";
import { request } from "../../../services/api";
import { Concert as ApiConcert } from "../../../types/api";

export default function ConcertManagement() {
  const [concerts, setConcerts] = useState<ApiConcert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    date: '',
    time: '',
    venue: '',
    location: '',
    price: '',
    category: 'Rock',
    description: '',
    totalSeats: '',
    isFlashSale: false,
    flashSaleDiscount: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    fetchConcerts();
  }, []);

  const fetchConcerts = async () => {
    try {
      setLoading(true);
      const data = await request<ApiConcert[]>('/admin/concerts');
      setConcerts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch concerts');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (concert: ApiConcert) => {
    // navigate to edit page
    window.location.href = `/admin/concerts/${concert.id}/edit`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      const endTime = new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000).toISOString();

      if (editingId) {
        await request(`/admin/concerts/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || 'No description provided',
            venue: formData.venue,
            startTime,
            status: formData.status,
          })
        });
        // If admin provided a price and totalSeats while editing, create a new ticket category
        if (formData.price && formData.totalSeats) {
          await request('/admin/concerts/ticket-categories', {
            method: 'POST',
            body: JSON.stringify({
              concertId: editingId,
              name: formData.category || 'General Admission',
              price: Number(formData.price),
              totalQuantity: Number(formData.totalSeats),
            })
          });
        }
      } else {
        const newConcert = await request<ApiConcert>('/admin/concerts', {
          method: 'POST',
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || 'No description provided',
            venue: formData.venue,
            startTime,
            status: formData.status,
          })
        });

        // Add ticket category if price and totalSeats provided
        if (formData.price && formData.totalSeats && newConcert.id) {
          await request('/admin/concerts/ticket-categories', {
            method: 'POST',
            body: JSON.stringify({
              concertId: newConcert.id,
              name: formData.category || 'General Admission',
              price: Number(formData.price),
              totalQuantity: Number(formData.totalSeats),
            })
          });
        }
      }

      setShowCreateModal(false);
      setEditingId(null);
      setFormData({
        title: '',
        artist: '',
        date: '',
        time: '',
        venue: '',
        location: '',
        price: '',
        category: 'Rock',
        description: '',
        totalSeats: '',
        isFlashSale: false,
        flashSaleDiscount: '',
      });
      fetchConcerts();
    } catch (err: any) {
      alert(`Failed to create concert: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this concert?')) return;
    try {
      await request(`/admin/concerts/${id}`, { method: 'DELETE' });
      fetchConcerts();
    } catch (err: any) {
      alert(`Failed to delete concert: ${err.message}`);
    }
  };

  const categories = ['Rock', 'Pop', 'Jazz', 'Electronic', 'Classical', 'Hip Hop', 'Indie', 'Country'];

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading concerts...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Concert Management</h1>
            <p className="text-muted-foreground">Create and manage concert events</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Concert
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concerts.map((concert) => {
            const availableSeats = concert.ticketCategories?.reduce((acc, tc) => acc + tc.remainingQuantity, 0) || 0;
            const totalSeats = concert.ticketCategories?.reduce((acc, tc) => acc + tc.totalQuantity, 0) || 0;

            return (
              <div key={concert.id} className="bg-card border border-border rounded-lg overflow-hidden group flex flex-col">
                <div className="aspect-[16/9] overflow-hidden relative bg-muted flex items-center justify-center">
                  <div className="text-muted-foreground text-sm">No Image Available</div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="text-sm text-muted-foreground mb-2">Concert</div>
                  <h3 className="text-xl mb-2 line-clamp-1">{concert.title}</h3>
                  <div className="text-muted-foreground mb-4">Various Artists</div>

                  <div className="space-y-2 text-sm mb-4 flex-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{new Date(concert.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{new Date(concert.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span>{concert.venue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-primary">{concert.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seats:</span>
                      <span>{availableSeats} / {totalSeats}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border mt-auto">
                    <button 
                      onClick={() => handleEdit(concert)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button onClick={() => handleDelete(concert.id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl">{editingId ? 'Edit Concert' : 'Create New Concert'}</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Concert Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Artist/Performer</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">Ticket Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Total Seats</label>
                  <input
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="SOLD_OUT">Sold Out</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFlashSale}
                      onChange={(e) => setFormData({ ...formData, isFlashSale: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Enable Flash Sale</span>
                  </label>
                </div>

                {formData.isFlashSale && (
                  <div>
                    <label className="block text-sm mb-2">Flash Sale Discount (%)</label>
                    <input
                      type="number"
                      value={formData.flashSaleDiscount}
                      onChange={(e) => setFormData({ ...formData, flashSaleDiscount: e.target.value })}
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingId ? 'Update Concert' : 'Create Concert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
