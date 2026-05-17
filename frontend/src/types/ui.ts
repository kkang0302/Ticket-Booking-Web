export interface Concert {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  image: string;
  price: number;
  category: string;
  description: string;
  availableSeats: number;
  totalSeats: number;
  isFlashSale: boolean;
  flashSaleEndTime?: string;
  flashSaleDiscount?: number;
}
