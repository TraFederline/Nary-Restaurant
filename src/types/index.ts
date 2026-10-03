export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'BILLING' | 'PAID';

export type OrderStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'UNPAID'
  | 'BILL REQUESTED'
  | 'PAID'
  | 'CANCELLED';

export type MenuCategory =
  | 'All'
  | 'Burgers'
  | 'Pizza'
  | 'Rice'
  | 'Noodles'
  | 'Chicken'
  | 'Seafood'
  | 'Drinks'
  | 'Desserts';

export type KhmerFont = 'kantumruy' | 'battambang' | 'siemreap' | 'noto';

export interface MenuItem {
  id: string;
  name: string;
  nameKm?: string;
  description: string;
  descriptionKm?: string;
  price: number;
  category: Exclude<MenuCategory, 'All'>;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  itemTotal: number;
}

export interface PaymentDetails {
  cashReceived: number;
  changeGiven: number;
  paymentMethod: 'CASH';
  processedBy: string;
  paidAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  guests: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  billRequestedAt?: string;
  paymentDetails?: PaymentDetails;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  currentGuests?: number;
  orderStartedAt?: string;
  zone?: string;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  currencySymbol: string;
  taxRate: number; // e.g. 0.05 for 5%
  receiptFooter: string;
}

export type ThemeMode = 'light' | 'dark';

export type ActivePage =
  | 'dashboard'
  | 'tables'
  | 'new-order'
  | 'active-orders'
  | 'billing'
  | 'order-history'
  | 'menu'
  | 'reports'
  | 'settings';
