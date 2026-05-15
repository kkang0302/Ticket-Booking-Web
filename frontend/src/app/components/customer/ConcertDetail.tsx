import { useParams, Link } from "react-router";
import { concerts } from "../../data/mockData";
import { Calendar, Clock, MapPin, Users, Zap, Tag } from "lucide-react";
import { useState, useEffect } from "react";

export default function ConcertDetail() {
  const { id } = useParams<{ id: string }>();
  const concert = concerts.find(c => c.id === id);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (concert?.isFlashSale && concert.flashSaleEndTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(concert.flashSaleEndTime!).getTime();
        const distance = end - now;

        if (distance < 0) {
          setTimeRemaining("Expired");
          clearInterval(timer);
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [concert]);

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Concert not found</h2>
          <Link to="/concerts" className="text-primary hover:underline">
            Browse all concerts
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = concert.isFlashSale
    ? Math.round(concert.price * (1 - (concert.flashSaleDiscount || 0) / 100))
    : concert.price;

  return (
    <div className="min-h-screen">
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src={concert.image}
          alt={concert.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="inline-block px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm mb-4">
                {concert.category}
              </div>
              <h1 className="text-4xl md:text-5xl mb-4">{concert.title}</h1>
              <div className="text-2xl text-muted-foreground mb-6">{concert.artist}</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div>{new Date(concert.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div>{concert.time}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg md:col-span-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Venue</div>
                    <div>{concert.venue}, {concert.location}</div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {concert.description}
                </p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{concert.availableSeats} of {concert.totalSeats} seats available</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {concert.isFlashSale && (
                <div className="bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-6 h-6" />
                    <span className="text-xl">Flash Sale Active!</span>
                  </div>
                  <div className="text-sm mb-2">Save {concert.flashSaleDiscount}% off regular price</div>
                  <div className="text-2xl mb-2">{timeRemaining}</div>
                  <div className="text-sm opacity-90">Hurry, limited time offer!</div>
                </div>
              )}

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-2">Starting from</div>
                  {concert.isFlashSale ? (
                    <div className="flex items-baseline gap-3">
                      <span className="line-through text-xl text-muted-foreground">
                        ${concert.price}
                      </span>
                      <span className="text-4xl text-primary">
                        ${discountedPrice}
                      </span>
                    </div>
                  ) : (
                    <div className="text-4xl text-primary">${concert.price}</div>
                  )}
                </div>

                <Link
                  to={`/concerts/${concert.id}/seats`}
                  className="block w-full py-4 bg-primary text-primary-foreground text-center rounded-lg hover:opacity-90 transition-opacity mb-4"
                >
                  Select Seats
                </Link>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Booking Fee</span>
                    <span>$5.99</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>E-Ticket (Free)</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm">Have a voucher code?</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Apply your voucher code at checkout to get additional discounts!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
