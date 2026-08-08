import { IProduct } from './product';

// GET /wishlist بيرجع منتجات كاملة (نفس شكل IProduct بالظبط)
export interface IWishlistResponse {
  status: string;
  count: number;
  data: IProduct[];
}

// POST/DELETE /wishlist بيرجعوا مصفوفة IDs بس، مش منتجات كاملة
export interface IWishlistIdsResponse {
  status: string;
  message: string;
  data: string[];
}
