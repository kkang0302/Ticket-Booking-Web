import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag, TrendingUp } from "lucide-react";
import { request } from "../../../services/api";
import { Voucher as ApiVoucher } from "../../../types/api";

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<ApiVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    validUntil: '',
    usageLimit: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await request<ApiVoucher[]>('/admin/vouchers');
      setVouchers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await request('/admin/vouchers', {
        method: 'POST',
        body: JSON.stringify({
          code: formData.code,
          discountType: formData.discountType,
          discountValue: Number(formData.discountValue),
          usageLimit: Number(formData.usageLimit),
          expiredAt: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
          status: formData.status,
        })
      });

      setShowCreateModal(false);
      setFormData({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        validUntil: '',
        usageLimit: '',
        status: 'ACTIVE',
      });
      fetchVouchers();
    } catch (err: any) {
      alert(`Failed to create voucher: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this voucher?')) return;
    try {
      await request(`/admin/vouchers/${id}`, { method: 'DELETE' });
      fetchVouchers();
    } catch (err: any) {
      alert(`Failed to delete voucher: ${err.message}`);
    }
  };

  const activeVouchers = vouchers.filter(v => v.status === 'ACTIVE');
  const inactiveVouchers = vouchers.filter(v => v.status === 'INACTIVE');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500';
      case 'INACTIVE':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-accent text-accent-foreground';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading vouchers...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Voucher Management</h1>
            <p className="text-muted-foreground">Create and manage promotional vouchers</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Voucher
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Active Vouchers</span>
            </div>
            <div className="text-3xl">{activeVouchers.length}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Total Usage</span>
            </div>
            <div className="text-3xl">{vouchers.reduce((sum, v) => sum + v.usageCount, 0)}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Available Uses</span>
            </div>
            <div className="text-3xl">
              {activeVouchers.reduce((sum, v) => sum + (v.usageLimit - v.usageCount), 0)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl mb-4">Active Vouchers</h2>
            <div className="space-y-3">
              {activeVouchers.map((voucher) => {
                const usagePercentage = voucher.usageLimit > 0 ? (voucher.usageCount / voucher.usageLimit * 100).toFixed(1) : '0';

                return (
                  <div key={voucher.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="px-3 py-1 bg-primary/10 text-primary rounded font-mono">
                            {voucher.code}
                          </div>
                          <span className={`text-sm px-2 py-1 rounded ${getStatusColor(voucher.status)}`}>
                            {voucher.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                          <div>
                            <div className="text-muted-foreground mb-1">Discount</div>
                            <div>
                              {voucher.discountType === 'PERCENTAGE'
                                ? `${voucher.discountValue}%`
                                : `$${voucher.discountValue}`}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Expiry Date</div>
                            <div>
                              {voucher.expiredAt ? new Date(voucher.expiredAt).toLocaleDateString() : 'No expiry'}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Usage</div>
                            <div>
                              {voucher.usageCount} / {voucher.usageLimit}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Usage Progress</span>
                            <span>{usagePercentage}%</span>
                          </div>
                          <div className="h-2 bg-accent rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${usagePercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button onClick={() => handleDelete(voucher.id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {inactiveVouchers.length > 0 && (
            <div>
              <h2 className="text-xl mb-4">Inactive & Expired Vouchers</h2>
              <div className="space-y-3">
                {inactiveVouchers.map((voucher) => (
                  <div key={voucher.id} className="bg-card/50 border border-border rounded-lg p-6 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="px-3 py-1 bg-muted text-muted-foreground rounded font-mono">
                            {voucher.code}
                          </div>
                          <span className={`text-sm px-2 py-1 rounded ${getStatusColor(voucher.status)}`}>
                            {voucher.status}
                          </span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                        Reactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl">Create New Voucher</h2>
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
                  <label className="block text-sm mb-2">Voucher Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SUMMER25"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Discount Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
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
                  Create Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
