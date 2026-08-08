import { IMetadata } from './category';

export interface IBrand {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface IBrandsResponse {
  results: number;
  metadata: IMetadata;
  data: IBrand[];
}

export interface ISpecificBrandResponse {
  data: IBrand;
}

