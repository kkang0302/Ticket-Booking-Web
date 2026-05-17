export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
}

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  totalQuantity: number;
  remainingQuantity: number;
  concertId: string;
}

export interface Concert {
  id: string;
  title: string;
  venue: string;
  startTime: string;
  status: 'PUBLISHED' | 'DRAFT' | 'CANCELLED';
  ticketCategories: TicketCategory[];
}

export interface BookingItem {
  id: string;
  bookingId: string;
  ticketCategoryId: string;
  quantity: number;
  priceAtBooking: number;
  ticketCategory?: TicketCategory;
}

export interface Booking {
  id: string;
  userId: string;
  concertId: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED' | 'EXPIRED' | 'RESERVED';
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  items?: BookingItem[];
  bookingItems?: BookingItem[];
  user?: User;
  concert?: Concert;
  voucher?: Voucher;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  usageLimit: number;
  usageCount: number;
  expiredAt: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
  };
}
