// wishlist.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IWishlistIdsResponse, IWishlistResponse } from '../../models/wishlist';
import { AuthService } from '../auth/auth';

@Service()
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}v1/wishlist`;

  // Single source of truth للـ wishlist عبر الأبليكيشن كله (Navbar badge, heart icons, wishlist page..)
  readonly wishlistData = signal<IWishlistResponse | null>(null);

  // بيتحدث من الـ 3 endpoints كلهم (GET بيديها منتجات كاملة، POST/DELETE بيدوا IDs بس)،
  // فهو المصدر الوحيد اللي isInWishlist() بتعتمد عليه — مش على cartData().data الكامل
  readonly wishlistProductIds = signal<ReadonlySet<string>>(new Set());
  readonly wishlistCount = computed(() => this.wishlistProductIds().size);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ token: this.authService.getToken() ?? '' });
  }

  getLoggedUserWishlist(): Observable<IWishlistResponse> {
    return this.http.get<IWishlistResponse>(this.baseUrl, { headers: this.getHeaders() }).pipe(
      tap((res) => {
        this.wishlistData.set(res);
        this.wishlistProductIds.set(new Set(res.data.map((product) => product._id)));
      }),
    );
  }

  addProductToWishlist(productId: string): Observable<IWishlistIdsResponse> {
    return this.http
      .post<IWishlistIdsResponse>(this.baseUrl, { productId }, { headers: this.getHeaders() })
      .pipe(tap((res) => this.wishlistProductIds.set(new Set(res.data))));
  }

  removeProductFromWishlist(productId: string): Observable<IWishlistIdsResponse> {
    return this.http
      .delete<IWishlistIdsResponse>(`${this.baseUrl}/${productId}`, { headers: this.getHeaders() })
      .pipe(
        tap((res) => {
          const remainingIds = new Set(res.data);
          this.wishlistProductIds.set(remainingIds);

          // DELETE بيرجع IDs بس مش منتجات كاملة، فمفيش داعي لـ GET جديد —
          // بنفلتر الـ full product list المخزنة بالفعل على نفس الـ IDs الراجعة من السيرفر
          this.wishlistData.update((current) =>
            current
              ? {
                  ...current,
                  count: remainingIds.size,
                  data: current.data.filter((product) => remainingIds.has(product._id)),
                }
              : current,
          );
        }),
      );
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistProductIds().has(productId);
  }
}
