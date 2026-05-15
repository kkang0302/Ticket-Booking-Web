import { Link } from "react-router";
import { concerts } from "../../data/mockData";
import { Clock, MapPin, Calendar, Zap } from "lucide-react";

export default function Home() {
  const flashSaleConcerts = concerts.filter(c => c.isFlashSale);
  const upcomingConcerts = concerts.slice(0, 3);

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl mb-6">
              Your Gateway to Unforgettable Live Music
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Book tickets to the hottest concerts, festivals, and live performances.
              Secure your seats in seconds.
            </p>
            <Link
              to="/concerts"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse All Concerts
            </Link>
          </div>
        </div>
      </section>

      {flashSaleConcerts.length > 0 && (
        <section className="py-16 bg-accent/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl">Flash Sales</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashSaleConcerts.map((concert) => (
                <Link
                  key={concert.id}
                  to={`/concerts/${concert.id}`}
                  className="group relative overflow-hidden rounded-lg bg-card border border-border hover:border-primary transition-all"
                >
                  <div className="absolute top-4 right-4 z-10 bg-destructive text-destructive-foreground px-3 py-1 rounded-full">
                    -{concert.flashSaleDiscount}%
                  </div>
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={concert.image}
                      alt={concert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">{concert.category}</div>
                    <h3 className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {concert.title}
                    </h3>
                    <div className="text-muted-foreground mb-1">{concert.artist}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(concert.date).toLocaleDateString()}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{concert.time}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="line-through text-muted-foreground">
                        ${concert.price}
                      </span>
                      <span className="text-2xl text-primary">
                        ${Math.round(concert.price * (1 - (concert.flashSaleDiscount || 0) / 100))}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl mb-8">Upcoming Concerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingConcerts.map((concert) => (
              <Link
                key={concert.id}
                to={`/concerts/${concert.id}`}
                className="group overflow-hidden rounded-lg bg-card border border-border hover:border-primary transition-all"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={concert.image}
                    alt={concert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">{concert.category}</div>
                  <h3 className="text-xl mb-2 group-hover:text-primary transition-colors">
                    {concert.title}
                  </h3>
                  <div className="text-muted-foreground mb-1">{concert.artist}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{concert.location}</span>
                  </div>
                  <div className="text-2xl text-primary">
                    From ${concert.price}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/concerts"
              className="inline-block px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              View All Concerts
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2">Instant Booking</h3>
              <p className="text-muted-foreground">
                Book your tickets in seconds with our streamlined checkout process
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2">Verified Events</h3>
              <p className="text-muted-foreground">
                All concerts are verified and tickets are 100% authentic
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2">Best Venues</h3>
              <p className="text-muted-foreground">
                Premium venues across the country for the ultimate experience
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
