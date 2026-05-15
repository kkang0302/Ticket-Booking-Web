import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { concerts, generateSeats, Seat } from "../../data/mockData";
import { ArrowLeft, Info } from "lucide-react";

export default function SeatSelection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const concert = concerts.find(c => c.id === id);
  const [seats, setSeats] = useState<Seat[]>(generateSeats(id || ''));
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Concert not found</h2>
        </div>
      </div>
    );
  }

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'sold' || seat.status === 'reserved') return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
      setSeats(seats.map(s => s.id === seat.id ? { ...s, status: 'available' as const } : s));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
      setSeats(seats.map(s => s.id === seat.id ? { ...s, status: 'selected' as const } : s));
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const sections = ['A', 'B', 'C', 'D'];

  const handleProceedToCheckout = () => {
    if (selectedSeats.length > 0) {
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
      localStorage.setItem('selectedConcert', JSON.stringify(concert));
      navigate('/checkout');
    }
  };

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
          <h1 className="text-3xl mb-2">Select Your Seats</h1>
          <div className="text-muted-foreground">
            {concert.title} - {concert.artist}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="bg-primary/10 text-center py-3 rounded-lg mb-8">
                <div className="text-sm text-muted-foreground">STAGE</div>
              </div>

              <div className="space-y-6">
                {sections.map(section => (
                  <div key={section}>
                    <div className="text-sm text-muted-foreground mb-2">Section {section}</div>
                    <div className="grid grid-cols-10 gap-1">
                      {seats
                        .filter(s => s.section === section)
                        .map(seat => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'sold' || seat.status === 'reserved'}
                            className={`
                              aspect-square rounded text-xs flex items-center justify-center transition-all
                              ${seat.status === 'available' ? 'bg-accent hover:bg-primary hover:text-primary-foreground cursor-pointer' : ''}
                              ${seat.status === 'selected' ? 'bg-primary text-primary-foreground' : ''}
                              ${seat.status === 'sold' ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}
                              ${seat.status === 'reserved' ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : ''}
                            `}
                            title={`${seat.section}${seat.row}-${seat.number} - $${seat.price}`}
                          >
                            {seat.number}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent/10 border border-border rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <div className="mb-2">Seat Legend:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-accent rounded" />
                      <span className="text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded" />
                      <span className="text-muted-foreground">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted rounded" />
                      <span className="text-muted-foreground">Sold</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted/50 rounded" />
                      <span className="text-muted-foreground">Reserved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl mb-4">Booking Summary</h3>

              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">Selected Seats</div>
                {selectedSeats.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No seats selected</div>
                ) : (
                  <div className="space-y-2">
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="flex justify-between items-center py-2 border-b border-border">
                        <span>Section {seat.section}, Row {seat.row}, Seat {seat.number}</span>
                        <span>${seat.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Fee</span>
                  <span>$5.99</span>
                </div>
                <div className="flex justify-between text-xl pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice + 5.99}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={selectedSeats.length === 0}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedSeats.length === 0 ? 'Select seats to continue' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
