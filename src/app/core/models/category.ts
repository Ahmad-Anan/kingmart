export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface IMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
  prevPage?: number;
}

export interface ICategoriesResponse {
  results: number;
  metadata: IMetadata;
  data: ICategory[];
}

export interface ICategoryResponse {
  data: ICategory;
}

export interface ISubCategoriesResponse {
  results: number;
  metadata: IMetadata;
  data: ISubCategory[];
}

export interface ISingleSubCategoryResponse {
  data: ISubCategory;
}

export interface IErrorResponse {
  statusMsg: string;
  message: string;
}
