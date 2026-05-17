import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Check, Users, Star, Crown } from "lucide-react";
import { request } from "../../../services/api";
import { Concert as ApiConcert } from "../../../types/api";
import { mapConcertToUI } from "../../../utils/concertMapper";
import { Concert as UIConcert } from "../../../types/ui";

interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  available: number;
  icon: any;
  color: string;
}

export default function TicketSelection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [concert, setConcert] = useState<UIConcert | null>(null);
  const [apiConcert, setApiConcert] = useState<ApiConcert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTiers, setSelectedTiers] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        setLoading(true);
        const data = await request<ApiConcert>(`/concerts/${id}`);
        setApiConcert(data);
        setConcert(mapConcertToUI(data));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch concert details');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchConcert();
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading ticket categories...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  if (!concert || !apiConcert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Concert not found</h2>
        </div>
      </div>
    );
  }

  // Map backend ticket categories to UI tiers
  const ticketTiers: TicketTier[] = apiConcert.ticketCategories?.map((category, index) => {
    let icon = Users;
    let color = 'from-blue-500 to-cyan-500';
    let features = ['General admission', 'Standard seating'];
    let description = 'Standard admission ticket';

    if (category.name.toLowerCase().includes('vip')) {
      icon = Crown;
      color = 'from-yellow-500 to-orange-500';
      features = ['Front row seats', 'Meet & Greet access', 'Exclusive VIP lounge'];
      description = 'Premium experience with exclusive benefits';
    } else if (category.name.toLowerCase().includes('premium')) {
      icon = Star;
      color = 'from-purple-500 to-pink-500';
      features = ['Premium seating area', 'Fast track entry'];
      description = 'Great view with added comfort';
    }

    return {
      id: String(category.id),
      name: category.name,
      price: category.price,
      description,
      features,
      available: category.remainingQuantity,
      icon,
      color,
    };
  }) || [];

  const handleQuantityChange = (tierId: string, change: number) => {
    const currentQty = selectedTiers[tierId] || 0;
    const newQty = Math.max(0, Math.min(10, currentQty + change));

    if (newQty === 0) {
      const { [tierId]: _, ...rest } = selectedTiers;
      setSelectedTiers(rest);
    } else {
      setSelectedTiers({ ...selectedTiers, [tierId]: newQty });
    }
  };

  const totalTickets = Object.values(selectedTiers).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(selectedTiers).reduce((sum, [tierId, qty]) => {
    const tier = ticketTiers.find(t => t.id === tierId);
    return sum + (tier ? tier.price * qty : 0);
  }, 0);

  const handleProceedToCheckout = () => {
    if (totalTickets > 0) {
      const ticketDetails = Object.entries(selectedTiers).map(([tierId, qty]) => {
        const tier = discountedPrices.find(t => t.id === tierId);
        return { tier, quantity: qty };
      });
      localStorage.setItem('selectedTickets', JSON.stringify(ticketDetails));
      localStorage.setItem('selectedConcert', JSON.stringify(concert));
      navigate('/checkout');
    }
  };

  const discountedPrices = ticketTiers.map(tier => ({
    ...tier,
    price: concert.isFlashSale
      ? Math.round(tier.price * (1 - (concert.flashSaleDiscount || 0) / 100))
      : tier.price,
    originalPrice: tier.price,
  }));

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/concerts/${id}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to concert details
        </button>

        <div className="mb-8">
          <h1 className="text-3xl mb-2">Select Your Tickets</h1>
          <div className="text-muted-foreground">
            {concert.title} - {concert.artist}
          </div>
          {concert.isFlashSale && (
            <div className="mt-2 inline-block px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-sm">
              Flash Sale Active - {concert.flashSaleDiscount}% OFF
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {discountedPrices.map((tier) => {
              const Icon = tier.icon;
              const quantity = selectedTiers[tier.id] || 0;

              return (
                <div
                  key={tier.id}
                  className={`bg-card border-2 rounded-lg overflow-hidden transition-all ${
                    quantity > 0 ? 'border-primary shadow-lg' : 'border-border'
                  }`}
                >
                  <div className={`h-2 bg-gradient-to-r ${tier.color}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-gradient-to-r ${tier.color} rounded-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl mb-2">{tier.name}</h3>
                          <p className="text-muted-foreground mb-3">{tier.description}</p>

                          <div className="mb-4">
                            {concert.isFlashSale ? (
                              <div className="flex items-baseline gap-3">
                                <span className="line-through text-xl text-muted-foreground">
                                  ${tier.originalPrice}
                                </span>
                                <span className="text-3xl text-primary">
                                  ${tier.price}
                                </span>
                              </div>
                            ) : (
                              <span className="text-3xl text-primary">${tier.price}</span>
                            )}
                          </div>

                          <div className="space-y-2">
                            {tier.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 text-sm text-muted-foreground">
                            {tier.available} tickets available
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(tier.id, -1)}
                          disabled={quantity === 0}
                          className="w-10 h-10 rounded-lg bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-xl">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(tier.id, 1)}
                          disabled={quantity >= 10 || quantity >= tier.available}
                          className="w-10 h-10 rounded-lg bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      {quantity > 0 && (
                        <div className="ml-auto text-lg">
                          Subtotal: <span className="text-primary">${tier.price * quantity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl mb-4">Booking Summary</h3>

              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">Selected Tickets</div>
                {totalTickets === 0 ? (
                  <div className="text-muted-foreground text-sm">No tickets selected</div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selectedTiers).map(([tierId, qty]) => {
                      const tier = discountedPrices.find(t => t.id === tierId);
                      if (!tier) return null;

                      return (
                        <div key={tierId} className="flex justify-between items-center py-2 border-b border-border">
                          <div>
                            <div>{tier.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {qty} × ${tier.price}
                            </div>
                          </div>
                          <span>${tier.price * qty}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Fee</span>
                  <span>$5.99</span>
                </div>
                <div className="flex justify-between text-xl pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">${(totalPrice + 5.99).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={totalTickets === 0}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {totalTickets === 0 ? 'Select tickets to continue' : 'Proceed to Checkout'}
              </button>

              <div className="mt-4 text-xs text-muted-foreground text-center">
                Maximum 10 tickets per order
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
