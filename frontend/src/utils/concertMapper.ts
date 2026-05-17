import { Concert as ApiConcert } from '../types/api';
import { Concert as UIConcert } from '../types/ui';

export const mapConcertToUI = (apiConcert: ApiConcert): UIConcert => {
  const dateObj = new Date(apiConcert.startTime);
  const minPrice = apiConcert.ticketCategories?.length 
    ? Math.min(...apiConcert.ticketCategories.map(c => c.price))
    : 0;

  return {
    id: apiConcert.id,
    title: apiConcert.title,
    artist: 'Various Artists', // Placeholder since backend doesn't have it
    date: apiConcert.startTime,
    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    venue: apiConcert.venue,
    location: apiConcert.venue, // Placeholder mapping
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', // Placeholder
    price: minPrice,
    category: 'Live Music', // Placeholder
    description: 'A great concert.', // Placeholder
    availableSeats: apiConcert.ticketCategories?.reduce((acc, c) => acc + c.remainingQuantity, 0) || 0,
    totalSeats: apiConcert.ticketCategories?.reduce((acc, c) => acc + c.totalQuantity, 0) || 0,
    isFlashSale: false, // Placeholder
  };
};
