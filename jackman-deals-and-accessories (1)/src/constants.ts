import { Product, Category } from './types';

export const CATEGORIES: Category[] = [
  'iPhone',
  'Laptop',
  'Samsung',
  'Smartwatches',
  'JBL Bluetooth',
  'Phone Accessories',
  'Others'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    category: 'iPhone',
    price: 'GH₵ 14,500',
    condition: 'New',
    description: 'Natural Titanium, 256GB, Sealed with full warranty.',
    images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0,
    status: 'In Stock',
    createdAt: Date.now() - 100000
  },
  {
    id: '2',
    name: 'MacBook Pro M3',
    category: 'Laptop',
    price: 'GH₵ 22,000',
    condition: 'New',
    description: '14-inch, 16GB RAM, 512GB SSD, Space Black.',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0,
    status: 'In Stock',
    createdAt: Date.now() - 200000
  },
  {
    id: '3',
    name: 'Samsung S24 Ultra',
    category: 'Samsung',
    price: 'GH₵ 13,800',
    condition: 'Like New',
    description: 'Titanium Gray, 12GB/512GB, Box and accessories included.',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0,
    status: 'In Stock',
    createdAt: Date.now() - 300000
  },
  {
    id: '4',
    name: 'Apple Watch Series 9',
    category: 'Smartwatches',
    price: 'GH₵ 5,200',
    condition: 'New',
    description: '45mm, Midnight Aluminum Case with Sport Band.',
    images: ['https://images.unsplash.com/photo-1434493907317-a46b53b81824?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0,
    status: 'In Stock',
    createdAt: Date.now() - 400000
  },
  {
    id: '5',
    name: 'iPhone 14 Pro',
    category: 'iPhone',
    price: 'GH₵ 9,500',
    condition: 'Like New',
    description: 'Deep Purple, 128GB, Battery health 98%.',
    images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0,
    status: 'Sold',
    createdAt: Date.now() - 500000,
    soldAt: Date.now() - 100000
  },
  {
    id: '6',
    name: 'Samsung Galaxy Buds 2 Pro',
    category: 'Phone Accessories',
    price: 'GH₵ 1,200',
    condition: 'New',
    description: 'Bora Purple, Sealed.',
    images: ['https://images.unsplash.com/photo-1660505191535-492777f9899f?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0,
    status: 'Sold',
    createdAt: Date.now() - 600000,
    soldAt: Date.now() - 200000
  }
];
