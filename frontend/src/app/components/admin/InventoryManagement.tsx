import { useState } from "react";
import { concerts } from "../../data/mockData";
import { TrendingUp, AlertCircle, Search } from "lucide-react";

export default function InventoryManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConcerts = concerts.filter(concert =>
    concert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concert.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concert.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOccupancyColor = (percentage: number) => {
    if (percentage > 80) return 'text-green-500';
    if (percentage > 50) return 'text-yellow-500';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Ticket Inventory Management</h1>
          <p className="text-muted-foreground">Monitor seat availability and occupancy rates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Seats</span>
            </div>
            <div className="text-3xl">{concerts.reduce((sum, c) => sum + c.totalSeats, 0)}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Available Seats</span>
            </div>
            <div className="text-3xl">{concerts.reduce((sum, c) => sum + c.availableSeats, 0)}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Avg Occupancy</span>
            </div>
            <div className="text-3xl">
              {((concerts.reduce((sum, c) => sum + (c.totalSeats - c.availableSeats), 0) /
                 concerts.reduce((sum, c) => sum + c.totalSeats, 0)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search concerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredConcerts.map((concert) => {
            const soldSeats = concert.totalSeats - concert.availableSeats;
            const occupancyPercentage = (soldSeats / concert.totalSeats * 100).toFixed(1);

            return (
              <div key={concert.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl mb-2">{concert.title}</h3>
                    <div className="text-muted-foreground mb-2">{concert.artist}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(concert.date).toLocaleDateString()} at {concert.time} · {concert.venue}
                    </div>
                  </div>

                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="text-2xl">{concert.totalSeats}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl text-green-500">{concert.availableSeats}</div>
                      <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                    <div>
                      <div className={`text-2xl ${getOccupancyColor(Number(occupancyPercentage))}`}>
                        {soldSeats}
                      </div>
                      <div className="text-sm text-muted-foreground">Sold</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy Rate</span>
                    <span className={getOccupancyColor(Number(occupancyPercentage))}>
                      {occupancyPercentage}%
                    </span>
                  </div>
                  <div className="h-3 bg-accent rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        Number(occupancyPercentage) > 80 ? 'bg-green-500' :
                        Number(occupancyPercentage) > 50 ? 'bg-yellow-500' :
                        'bg-destructive'
                      }`}
                      style={{ width: `${occupancyPercentage}%` }}
                    />
                  </div>
                </div>

                {concert.isFlashSale && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span>Flash Sale Active - {concert.flashSaleDiscount}% off until {concert.flashSaleEndTime}</span>
                    </div>
                  </div>
                )}

                {concert.availableSeats < 100 && (
                  <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-orange-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>Low Inventory Alert - Only {concert.availableSeats} seats remaining</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                    Adjust Inventory
                  </button>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredConcerts.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">No concerts found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
