export interface Review {
  _id: string;
  title?: string;
  review: string;
  rating: number;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
  product: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IReviewsResponse {
  results: number;
  data: Review[];
}

export interface CreateReviewDto {
  review: string;
  rating: number;
}

export interface UpdateReviewDto {
  review?: string;
  rating?: number;
}
