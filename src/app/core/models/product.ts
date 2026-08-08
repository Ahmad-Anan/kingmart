import { IBrand } from './brand';
import { ICategory, IMetadata, ISubCategory } from './category';

export interface IProduct {
  _id: string;
  id: string;

  title: string;
  slug: string;
  description: string;

  price: number;
  priceAfterDiscount?: number;

  quantity: number;
  sold: number;

  ratingsAverage: number;
  ratingsQuantity: number;

  imageCover: string;
  images: string[];

  availableColors?: string[];

  category: ICategory;
  subcategory: ISubCategory[];
  brand: IBrand;

  createdAt: string;
  updatedAt: string;
}

export interface IProductsResponse {
  results: number;
  metadata: IMetadata;
  data: IProduct[];
}

export interface IProductResponse {
  data: IProduct;
}
