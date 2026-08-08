import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateReviewDto,
  IReviewsResponse,
  Review,
  UpdateReviewDto,
} from '../../models/reviews-response';

@Service()
export class ReviewsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}v1`;

  getReviewsForProduct(productId: string): Observable<IReviewsResponse> {
    return this.http.get<IReviewsResponse>(`${this.apiUrl}/products/${productId}/reviews`);
  }

  getAllReviews(params?: Record<string, any>): Observable<IReviewsResponse> {
    return this.http.get<IReviewsResponse>(`${this.apiUrl}/reviews`, { params });
  }

  getReviewById(reviewId: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/reviews/${reviewId}`);
  }

  createReview(productId: string, reviewData: CreateReviewDto): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/products/${productId}/reviews`, reviewData);
  }

  updateReview(reviewId: string, reviewData: UpdateReviewDto): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/reviews/${reviewId}`, reviewData);
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${reviewId}`);
  }
}
