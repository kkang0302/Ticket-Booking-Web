import { useState } from "react";
import { Link } from "react-router";
import { concerts } from "../../data/mockData";
import { Calendar, Clock, MapPin, Search, Filter } from "lucide-react";

export default function ConcertList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(concerts.map(c => c.category)))];

  const filteredConcerts = concerts.filter(concert => {
    const matchesSearch = concert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         concert.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         concert.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || concert.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">All Concerts</h1>
          <p className="text-muted-foreground">
            Discover and book tickets to amazing live performances
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search concerts, artists, or venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredConcerts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No concerts found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConcerts.map((concert) => (
              <Link
                key={concert.id}
                to={`/concerts/${concert.id}`}
                className="group relative overflow-hidden rounded-lg bg-card border border-border hover:border-primary transition-all"
              >
                {concert.isFlashSale && (
                  <div className="absolute top-4 right-4 z-10 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm">
                    Flash Sale
                  </div>
                )}
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
                  <div className="text-muted-foreground mb-4">{concert.artist}</div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(concert.date).toLocaleDateString()}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{concert.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{concert.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {concert.isFlashSale ? (
                        <div className="flex items-baseline gap-2">
                          <span className="line-through text-sm text-muted-foreground">
                            ${concert.price}
                          </span>
                          <span className="text-2xl text-primary">
                            ${Math.round(concert.price * (1 - (concert.flashSaleDiscount || 0) / 100))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl text-primary">From ${concert.price}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {concert.availableSeats} seats left
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
