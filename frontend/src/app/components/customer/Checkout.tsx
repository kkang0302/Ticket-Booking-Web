import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Tag, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { request } from "../../../services/api";
import { Concert as UIConcert } from "../../../types/ui";

interface TicketDetail {
  tier: { id: number; name: string; price: number };
  quantity: number;
}

function getIdempotencyKey(concertId: number, items: { ticketCategoryId: number; quantity: number }[]) {
  const storageKey = `idempotency:${concertId}:${JSON.stringify(items)}`;
  let stored = sessionStorage.getItem(storageKey);
  if (!stored) {
    stored = crypto.randomUUID();
    sessionStorage.setItem(storageKey, stored);
  }
  return { storageKey, idempotencyKey: stored };
}

export default function Checkout() {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState<TicketDetail[]>([]);
  const [concert, setConcert] = useState<UIConcert | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [voucherError, setVoucherError] = useState("");

  useEffect(() => {
    const ticketsData = localStorage.getItem("selectedTickets");
    const concertData = localStorage.getItem("selectedConcert");

    if (ticketsData && concertData) {
      setSelectedTickets(JSON.parse(ticketsData));
      setConcert(JSON.parse(concertData));
    } else {
      navigate("/concerts");
    }
  }, [navigate]);

  const subtotal = selectedTickets.reduce((sum, item) => sum + item.tier.price * item.quantity, 0);
  const bookingFee = 5.99;
  const total = subtotal + bookingFee;

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setAppliedVoucherCode(null);
      setDiscount(0);
      setVoucherError("");
      return;
    }

    try {
      const voucher = await request<{ code: string; discountType: string; discountValue: number }>(
        `/vouchers/validate/${voucherCode}`
      );
      setAppliedVoucherCode(voucher.code);
      if (voucher.discountType === "PERCENTAGE") {
        setDiscount(total * (voucher.discountValue / 100));
      } else {
        setDiscount(voucher.discountValue);
      }
      setVoucherError("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid or expired voucher";
      setAppliedVoucherCode(null);
      setDiscount(0);
      setVoucherError(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("processing");
    setErrorMsg("");

    try {
      const items = selectedTickets.map((t) => ({
        ticketCategoryId: t.tier.id,
        quantity: t.quantity,
      }));

      const { storageKey, idempotencyKey } = getIdempotencyKey(Number(concert?.id), items);

      await request("/bookings", {
        method: "POST",
        body: JSON.stringify({
          concertId: concert?.id,
          items,
          voucherCode: appliedVoucherCode || undefined,
          idempotencyKey,
        }),
      });

      sessionStorage.removeItem(storageKey);
      setSubmitStatus("success");
      localStorage.removeItem("selectedTickets");
      localStorage.removeItem("selectedConcert");

      setTimeout(() => navigate("/bookings"), 2000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create booking");
      setSubmitStatus("failed");
    }
  };

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  if (submitStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl mb-4">Booking Created!</h2>
          <p className="text-muted-foreground mb-6">
            Your tickets are reserved. Go to My Bookings and click <strong>Pay money</strong> to
            complete mock payment (no real charge).
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl mb-4">Contact Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <p className="text-sm text-muted-foreground rounded-lg bg-muted/50 p-3">
                  Payment is mocked for this demo. After reserving tickets, use the{" "}
                  <strong>Pay money</strong> button on My Bookings — no card or real charge.
                </p>

                {submitStatus === "failed" && (
                  <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-destructive">{errorMsg || "Failed to create booking."}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === "processing"}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitStatus === "processing" ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Reserving tickets...
                    </>
                  ) : (
                    `Reserve tickets — $${Math.max(0, total - discount).toFixed(2)}`
                  )}
                </button>
              </form>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5" />
                <h2 className="text-xl">Apply Voucher</h2>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter voucher code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={applyVoucher}
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Apply
                </button>
              </div>
              {voucherError && <div className="mt-2 text-sm text-destructive">✗ {voucherError}</div>}
              {appliedVoucherCode && !voucherError && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ Voucher &quot;{appliedVoucherCode}&quot; will apply when you pay
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl mb-4">Order Summary</h3>
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">{concert.title}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(concert.date).toLocaleDateString()} at {concert.time}
                </div>
              </div>
              <div className="mb-4 pt-4 border-t border-border space-y-1">
                {selectedTickets.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.tier.name} × {item.quantity}
                    </span>
                    <span>${(item.tier.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Fee</span>
                  <span>${bookingFee.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">${Math.max(0, total - discount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

