export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  condition: 'New' | 'Like New' | 'Fair';
  description: string;
  images: string[];
  primaryImageIndex: number;
  status: 'In Stock' | 'Out of Stock' | 'Sold';
  createdAt: number;
  soldAt?: number;
  reviews?: Review[];
}

export type Category = 'iPhone' | 'Laptop' | 'Samsung' | 'Smartwatches' | 'JBL Bluetooth' | 'Phone Accessories' | 'Others';

export type Section = 'home' | 'products' | 'services' | 'contact' | 'admin' | 'category' | 'product-detail' | 'compare' | 'swap' | 'wishlist' | 'sell' | 'track';

export interface SwapRequest {
  id: string;
  type: 'swap' | 'sell';
  userDeviceModel: string;
  userDeviceCondition: string;
  userDeviceSpecs: string;
  interestedInModel: string;
  userName: string;
  userContact: string;
  devicePhotos?: string[];
  status: 'Pending' | 'Reviewed' | 'Contacted' | 'Completed' | 'Rejected';
  createdAt: number;
}
