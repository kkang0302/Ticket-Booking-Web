import { useState } from "react";
import { vouchers } from "../../data/mockData";
import { Plus, Edit, Trash2, Tag, TrendingUp } from "lucide-react";

export default function VoucherManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    minPurchase: '',
    status: 'active' as 'active' | 'inactive',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating voucher:', formData);
    setShowCreateModal(false);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      minPurchase: '',
      status: 'active',
    });
  };

  const activeVouchers = vouchers.filter(v => v.status === 'active');
  const inactiveVouchers = vouchers.filter(v => v.status === 'inactive' || v.status === 'expired');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500';
      case 'expired':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-accent text-accent-foreground';
    }
  };

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
                const usagePercentage = (voucher.usageCount / voucher.usageLimit * 100).toFixed(1);

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

                        <p className="text-muted-foreground mb-4">{voucher.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground mb-1">Discount</div>
                            <div>
                              {voucher.discountType === 'percentage'
                                ? `${voucher.discountValue}%`
                                : `$${voucher.discountValue}`}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Valid Period</div>
                            <div>
                              {new Date(voucher.validFrom).toLocaleDateString()} - {new Date(voucher.validUntil).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Usage</div>
                            <div>
                              {voucher.usageCount} / {voucher.usageLimit}
                            </div>
                          </div>
                          {voucher.minPurchase && (
                            <div>
                              <div className="text-muted-foreground mb-1">Min Purchase</div>
                              <div>${voucher.minPurchase}</div>
                            </div>
                          )}
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
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
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
                        <p className="text-muted-foreground text-sm">{voucher.description}</p>
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

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., 25% off summer concerts"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
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
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Discount Value {formData.discountType === 'percentage' ? '(%)' : '($)'}
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
                  <label className="block text-sm mb-2">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
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

                <div>
                  <label className="block text-sm mb-2">Minimum Purchase ($)</label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
