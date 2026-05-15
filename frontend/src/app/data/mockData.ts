// Mock data for the Concert Ticket Booking Platform

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

export interface Seat {
  id: string;
  section: string;
  row: string;
  number: number;
  price: number;
  status: 'available' | 'selected' | 'reserved' | 'sold';
}

export interface Booking {
  id: string;
  concertId: string;
  concertTitle: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'failed' | 'suspicious';
  bookingDate: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  voucherApplied?: string;
}

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  minPurchase?: number;
  status: 'active' | 'inactive' | 'expired';
}

export const concerts: Concert[] = [
  {
    id: '1',
    title: 'Summer Nights Music Festival',
    artist: 'The Electric Dreams',
    date: '2026-07-15',
    time: '19:00',
    venue: 'Madison Square Garden',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    price: 89,
    category: 'Rock',
    description: 'Experience an unforgettable night with The Electric Dreams as they bring their electrifying performance to Madison Square Garden.',
    availableSeats: 450,
    totalSeats: 2000,
    isFlashSale: true,
    flashSaleEndTime: '2026-05-20T23:59:59',
    flashSaleDiscount: 25,
  },
  {
    id: '2',
    title: 'Jazz Under The Stars',
    artist: 'Miles Morrison Quartet',
    date: '2026-06-22',
    time: '20:00',
    venue: 'Blue Note',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
    price: 65,
    category: 'Jazz',
    description: 'An intimate evening of smooth jazz with the renowned Miles Morrison Quartet.',
    availableSeats: 120,
    totalSeats: 300,
    isFlashSale: false,
  },
  {
    id: '3',
    title: 'Electronic Paradise',
    artist: 'DJ Nexus',
    date: '2026-08-10',
    time: '22:00',
    venue: 'Brooklyn Steel',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    price: 55,
    category: 'Electronic',
    description: 'Dance the night away with DJ Nexus\'s latest electronic beats and stunning visuals.',
    availableSeats: 800,
    totalSeats: 1500,
    isFlashSale: true,
    flashSaleEndTime: '2026-05-25T23:59:59',
    flashSaleDiscount: 30,
  },
  {
    id: '4',
    title: 'Classical Symphony Night',
    artist: 'New York Philharmonic',
    date: '2026-09-05',
    time: '19:30',
    venue: 'Carnegie Hall',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1519683384663-28d3a7d2c99e?w=800',
    price: 120,
    category: 'Classical',
    description: 'A magnificent evening of classical music performed by the world-renowned New York Philharmonic.',
    availableSeats: 200,
    totalSeats: 1200,
    isFlashSale: false,
  },
  {
    id: '5',
    title: 'Indie Vibes Festival',
    artist: 'Various Artists',
    date: '2026-07-28',
    time: '18:00',
    venue: 'Central Park SummerStage',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    price: 45,
    category: 'Indie',
    description: 'Celebrate indie music with a diverse lineup of emerging and established artists.',
    availableSeats: 1500,
    totalSeats: 3000,
    isFlashSale: false,
  },
  {
    id: '6',
    title: 'Hip Hop Legends Tour',
    artist: 'MC Flow & The Crew',
    date: '2026-08-25',
    time: '20:30',
    venue: 'Barclays Center',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    price: 95,
    category: 'Hip Hop',
    description: 'Witness hip hop history as MC Flow brings the iconic beats and rhymes to life.',
    availableSeats: 600,
    totalSeats: 1800,
    isFlashSale: true,
    flashSaleEndTime: '2026-05-18T23:59:59',
    flashSaleDiscount: 20,
  },
];

export const bookings: Booking[] = [
  {
    id: 'BK001',
    concertId: '1',
    concertTitle: 'Summer Nights Music Festival',
    artist: 'The Electric Dreams',
    date: '2026-07-15',
    time: '19:00',
    venue: 'Madison Square Garden',
    seats: ['A12', 'A13'],
    totalPrice: 178,
    status: 'confirmed',
    bookingDate: '2026-05-10T14:30:00',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'BK002',
    concertId: '2',
    concertTitle: 'Jazz Under The Stars',
    artist: 'Miles Morrison Quartet',
    date: '2026-06-22',
    time: '20:00',
    venue: 'Blue Note',
    seats: ['B5'],
    totalPrice: 65,
    status: 'confirmed',
    bookingDate: '2026-05-12T09:15:00',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    paymentMethod: 'PayPal',
    voucherApplied: 'JAZZ10',
  },
  {
    id: 'BK003',
    concertId: '3',
    concertTitle: 'Electronic Paradise',
    artist: 'DJ Nexus',
    date: '2026-08-10',
    time: '22:00',
    venue: 'Brooklyn Steel',
    seats: ['GA001', 'GA002', 'GA003'],
    totalPrice: 165,
    status: 'pending',
    bookingDate: '2026-05-14T18:45:00',
    customerName: 'Mike Chen',
    customerEmail: 'mike.chen@email.com',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'BK004',
    concertId: '1',
    concertTitle: 'Summer Nights Music Festival',
    artist: 'The Electric Dreams',
    date: '2026-07-15',
    time: '19:00',
    venue: 'Madison Square Garden',
    seats: ['C20', 'C21', 'C22', 'C23'],
    totalPrice: 356,
    status: 'suspicious',
    bookingDate: '2026-05-15T02:30:00',
    customerName: 'Unknown User',
    customerEmail: 'temp@tempmail.com',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'BK005',
    concertId: '4',
    concertTitle: 'Classical Symphony Night',
    artist: 'New York Philharmonic',
    date: '2026-09-05',
    time: '19:30',
    venue: 'Carnegie Hall',
    seats: ['Orchestra-A15'],
    totalPrice: 120,
    status: 'failed',
    bookingDate: '2026-05-13T16:20:00',
    customerName: 'Emily Davis',
    customerEmail: 'emily.d@email.com',
    paymentMethod: 'Credit Card',
  },
];

export const vouchers: Voucher[] = [
  {
    id: 'V001',
    code: 'SUMMER25',
    description: '25% off all summer concerts',
    discountType: 'percentage',
    discountValue: 25,
    validFrom: '2026-05-01',
    validUntil: '2026-08-31',
    usageLimit: 1000,
    usageCount: 245,
    minPurchase: 50,
    status: 'active',
  },
  {
    id: 'V002',
    code: 'JAZZ10',
    description: '$10 off Jazz concerts',
    discountType: 'fixed',
    discountValue: 10,
    validFrom: '2026-05-01',
    validUntil: '2026-12-31',
    usageLimit: 500,
    usageCount: 87,
    status: 'active',
  },
  {
    id: 'V003',
    code: 'EARLYBIRD',
    description: '15% early bird discount',
    discountType: 'percentage',
    discountValue: 15,
    validFrom: '2026-04-01',
    validUntil: '2026-05-10',
    usageLimit: 200,
    usageCount: 200,
    status: 'expired',
  },
  {
    id: 'V004',
    code: 'WELCOME20',
    description: '$20 off first booking',
    discountType: 'fixed',
    discountValue: 20,
    validFrom: '2026-05-01',
    validUntil: '2026-12-31',
    usageLimit: 2000,
    usageCount: 432,
    minPurchase: 75,
    status: 'active',
  },
];

export const generateSeats = (concertId: string): Seat[] => {
  const sections = ['A', 'B', 'C', 'D'];
  const seats: Seat[] = [];

  sections.forEach((section, sectionIndex) => {
    const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];
    rows.forEach((row) => {
      for (let num = 1; num <= 10; num++) {
        const random = Math.random();
        let status: Seat['status'] = 'available';

        if (random < 0.1) status = 'sold';
        else if (random < 0.15) status = 'reserved';

        seats.push({
          id: `${section}${row}-${num}`,
          section,
          row,
          number: num,
          price: 89 - (sectionIndex * 10),
          status,
        });
      }
    });
  });

  return seats;
};
