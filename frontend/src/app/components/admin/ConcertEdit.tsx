import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { request } from "../../../services/api";
import { Concert as ApiConcert, TicketCategory } from "../../../types/api";

const inputClass =
  "w-full max-w-md px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const inputSmClass =
  "w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const btnPrimary =
  "px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity";

const btnSecondary =
  "px-5 py-2.5 border border-border rounded-lg text-foreground bg-card hover:bg-accent transition-colors";

const btnDestructive =
  "px-3 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90";

export default function ConcertEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState<ApiConcert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    date: "",
    time: "",
    status: "DRAFT",
    description: "",
  });

  const [newCategory, setNewCategory] = useState({ name: "", price: "", totalQuantity: "" });

  useEffect(() => {
    if (!id) return;
    const fetchConcert = async () => {
      try {
        setLoading(true);
        const data = await request<ApiConcert>(`/admin/concerts/${id}`);
        setConcert(data);
        const d = new Date(data.startTime);
        setFormData({
          title: data.title,
          venue: data.venue,
          date: d.toISOString().split("T")[0],
          time: d.toTimeString().substring(0, 5),
          status: data.status,
          description: (data as { description?: string }).description || "",
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch concert");
      } finally {
        setLoading(false);
      }
    };
    fetchConcert();
  }, [id]);

  const handleUpdateConcert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const startTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      await request(`/admin/concerts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: formData.title,
          venue: formData.venue,
          startTime,
          status: formData.status,
          description: formData.description,
        }),
      });
      alert("Concert updated");
      navigate("/admin/concerts");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update concert");
    }
  };

  const handleAddCategory = async () => {
    if (!id) return;
    try {
      await request(`/admin/concerts/ticket-categories`, {
        method: "POST",
        body: JSON.stringify({
          concertId: Number(id),
          name: newCategory.name || "General",
          price: Number(newCategory.price),
          totalQuantity: Number(newCategory.totalQuantity),
        }),
      });
      const data = await request<ApiConcert>(`/admin/concerts/${id}`);
      setConcert(data);
      setNewCategory({ name: "", price: "", totalQuantity: "" });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to add category");
    }
  };

  const handleUpdateCategory = async (cat: TicketCategory) => {
    try {
      await request(`/admin/concerts/ticket-categories/${cat.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: cat.name,
          price: Number(cat.price),
          totalQuantity: Number(cat.totalQuantity),
        }),
      });
      const data = await request<ApiConcert>(`/admin/concerts/${id}`);
      setConcert(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update category");
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Delete this ticket category?")) return;
    try {
      await request(`/admin/concerts/ticket-categories/${catId}`, { method: "DELETE" });
      const data = await request<ApiConcert>(`/admin/concerts/${id}`);
      setConcert(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
        Loading concert...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl">
        <p className="text-destructive">{error}</p>
        <button type="button" onClick={() => navigate("/admin/concerts")} className={`mt-4 ${btnSecondary}`}>
          Back
        </button>
      </div>
    );
  }

  if (!concert) {
    return <div className="p-6 text-muted-foreground">Concert not found</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/admin/concerts")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to concerts
        </button>

        <h1 className="text-2xl font-semibold mb-6">Edit Concert</h1>

        <form
          onSubmit={handleUpdateConcert}
          className="bg-card border border-border rounded-lg p-6 space-y-5 mb-8"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Venue</label>
            <input
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1.5">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputSmClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={inputSmClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={inputClass}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SOLD_OUT">Sold Out</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`${inputClass} max-w-lg resize-y min-h-[100px]`}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={() => navigate("/admin/concerts")} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary}>
              Save concert
            </button>
          </div>
        </form>

        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Ticket categories</h2>

          <div className="space-y-1">
            {concert.ticketCategories?.map((cat) => (
              <div
                key={cat.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end py-3 border-b border-border last:border-0"
              >
                <div className="sm:col-span-4">
                  <label className="block text-xs text-muted-foreground mb-1">Name</label>
                  <input
                    value={cat.name}
                    onChange={(e) =>
                      setConcert({
                        ...concert,
                        ticketCategories: concert.ticketCategories!.map((c) =>
                          c.id === cat.id ? { ...c, name: e.target.value } : c
                        ),
                      })
                    }
                    className={inputSmClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={String(cat.price)}
                    onChange={(e) =>
                      setConcert({
                        ...concert,
                        ticketCategories: concert.ticketCategories!.map((c) =>
                          c.id === cat.id ? { ...c, price: Number(e.target.value) } : c
                        ),
                      })
                    }
                    className={inputSmClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">Total qty</label>
                  <input
                    type="number"
                    min={0}
                    value={String(cat.totalQuantity)}
                    onChange={(e) =>
                      setConcert({
                        ...concert,
                        ticketCategories: concert.ticketCategories!.map((c) =>
                          c.id === cat.id ? { ...c, totalQuantity: Number(e.target.value) } : c
                        ),
                      })
                    }
                    className={inputSmClass}
                  />
                </div>
                <div className="sm:col-span-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateCategory(cat)}
                    className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => handleDeleteCategory(cat.id)} className={btnDestructive}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Add category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <input
                  placeholder="Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className={inputSmClass}
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  placeholder="Price"
                  type="number"
                  min={0}
                  value={newCategory.price}
                  onChange={(e) => setNewCategory({ ...newCategory, price: e.target.value })}
                  className={inputSmClass}
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  placeholder="Total"
                  type="number"
                  min={0}
                  value={newCategory.totalQuantity}
                  onChange={(e) => setNewCategory({ ...newCategory, totalQuantity: e.target.value })}
                  className={inputSmClass}
                />
              </div>
              <div className="sm:col-span-4">
                <button type="button" onClick={handleAddCategory} className={btnPrimary}>
                  Add category
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
