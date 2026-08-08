// cart.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IAddToCartResponse, ICartResponse } from '../../models/cart';
import { AuthService } from '../auth/auth';

@Service()
export class Cart {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}v2/cart`;

  // Single source of truth للسلة عبر الأبليكيشن كله (Navbar badge, Cart page..)
  readonly cartData = signal<ICartResponse | null>(null);
  readonly cartCount = computed(() => this.cartData()?.numOfCartItems ?? 0);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ token: this.authService.getToken() ?? '' });
  }

  addProductToCart(productId: string): Observable<IAddToCartResponse> {
    return this.http
      .post<IAddToCartResponse>(this.baseUrl, { productId }, { headers: this.getHeaders() })
      .pipe(
        // الـ add endpoint بيرجع numOfCartItems بس، فبنجيب الـ cart كامل بعدها عشان الـ state يتزامن
        tap(() => this.getLoggedUserCart().subscribe()),
      );
  }

  getLoggedUserCart(): Observable<ICartResponse> {
    return this.http
      .get<ICartResponse>(this.baseUrl, { headers: this.getHeaders() })
      .pipe(tap((res) => this.cartData.set(res)));
  }

  updateCartProductQuantity(productId: string, count: number): Observable<ICartResponse> {
    return this.http
      .put<ICartResponse>(`${this.baseUrl}/${productId}`, { count }, { headers: this.getHeaders() })
      .pipe(tap((res) => this.cartData.set(res)));
  }

  removeProductFromCart(productId: string): Observable<ICartResponse> {
    return this.http
      .delete<ICartResponse>(`${this.baseUrl}/${productId}`, { headers: this.getHeaders() })
      .pipe(tap((res) => this.cartData.set(res)));
  }

  clearUserCart(): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(this.baseUrl, { headers: this.getHeaders() })
      .pipe(tap(() => this.cartData.set(null)));
  }
}
