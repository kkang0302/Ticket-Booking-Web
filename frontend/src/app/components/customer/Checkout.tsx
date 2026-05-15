import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Seat, Concert, vouchers } from "../../data/mockData";
import { CreditCard, Tag, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [concert, setConcert] = useState<Concert | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    const seatsData = localStorage.getItem('selectedSeats');
    const concertData = localStorage.getItem('selectedConcert');

    if (seatsData && concertData) {
      setSelectedSeats(JSON.parse(seatsData));
      setConcert(JSON.parse(concertData));
    } else {
      navigate('/concerts');
    }
  }, [navigate]);

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const bookingFee = 5.99;

  const applyVoucher = () => {
    setVoucherError("");
    const voucher = vouchers.find(v => v.code === voucherCode.toUpperCase() && v.status === 'active');

    if (!voucher) {
      setVoucherError("Invalid or expired voucher code");
      setAppliedVoucher(null);
      return;
    }

    if (voucher.minPurchase && subtotal < voucher.minPurchase) {
      setVoucherError(`Minimum purchase of $${voucher.minPurchase} required`);
      setAppliedVoucher(null);
      return;
    }

    setAppliedVoucher(voucher);
    setVoucherError("");
  };

  const discount = appliedVoucher
    ? appliedVoucher.discountType === 'percentage'
      ? subtotal * (appliedVoucher.discountValue / 100)
      : appliedVoucher.discountValue
    : 0;

  const total = subtotal + bookingFee - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus('processing');

    setTimeout(() => {
      const success = Math.random() > 0.1;
      setPaymentStatus(success ? 'success' : 'failed');

      if (success) {
        localStorage.removeItem('selectedSeats');
        localStorage.removeItem('selectedConcert');
        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      }
    }, 2000);
  };

  if (!concert) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl mb-4">Payment Successful!</h2>
          <p className="text-muted-foreground mb-6">
            Your booking has been confirmed. A confirmation email has been sent to {formData.email}
          </p>
          <div className="text-sm text-muted-foreground">Redirecting to your bookings...</div>
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
              <div className="space-y-4">
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
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" />
                <h2 className="text-xl">Payment Details</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                </div>

                {paymentStatus === 'failed' && (
                  <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <span className="text-destructive">Payment failed. Please try again.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paymentStatus === 'processing'}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay $${total.toFixed(2)}`
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
                  onClick={applyVoucher}
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Apply
                </button>
              </div>
              {voucherError && (
                <div className="mt-2 text-sm text-destructive">{voucherError}</div>
              )}
              {appliedVoucher && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ Voucher "{appliedVoucher.code}" applied - {appliedVoucher.description}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl mb-4">Order Summary</h3>

              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">{concert.title}</div>
                <div className="text-sm text-muted-foreground">{concert.artist}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(concert.date).toLocaleDateString()} at {concert.time}
                </div>
              </div>

              <div className="mb-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">Selected Seats</div>
                <div className="space-y-1">
                  {selectedSeats.map(seat => (
                    <div key={seat.id} className="flex justify-between text-sm">
                      <span>Section {seat.section}, Row {seat.row}, Seat {seat.number}</span>
                      <span>${seat.price}</span>
                    </div>
                  ))}
                </div>
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
                {appliedVoucher && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount ({appliedVoucher.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
