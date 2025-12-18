
import { Product, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
  { id: '2', name: 'Fashion', slug: 'fashion' },
  { id: '3', name: 'Home & Living', slug: 'home-living' },
  { id: '4', name: 'Accessories', slug: 'accessories' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Precision Wireless Mouse',
    description: 'Ergonomic wireless mouse with adjustable DPI and silent clicks.',
    price: 49.99,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/mouse/600/600',
    stock: 25
  },
  {
    id: 'p2',
    name: 'Mechanical Keyboard TKL',
    description: 'Tenkeyless mechanical keyboard with RGB backlighting and blue switches.',
    price: 89.99,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/keyboard/600/600',
    stock: 15
  },
  {
    id: 'p3',
    name: 'Canvas Weekender Bag',
    description: 'Durable canvas bag perfect for short trips and daily use.',
    price: 120.00,
    category: 'Fashion',
    image: 'https://picsum.photos/seed/bag/600/600',
    stock: 10
  },
  {
    id: 'p4',
    name: 'Premium Leather Wallet',
    description: 'Handcrafted leather wallet with RFID protection.',
    price: 45.00,
    category: 'Accessories',
    image: 'https://picsum.photos/seed/wallet/600/600',
    stock: 50
  },
  {
    id: 'p5',
    name: 'Minimalist Wall Clock',
    description: 'Sleek wooden wall clock with silent quartz movement.',
    price: 35.50,
    category: 'Home & Living',
    image: 'https://picsum.photos/seed/clock/600/600',
    stock: 8
  },
  {
    id: 'p6',
    name: 'Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation for an immersive audio experience.',
    price: 299.99,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/headphones/600/600',
    stock: 12
  }
];
