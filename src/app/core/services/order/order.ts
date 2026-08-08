// order.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ICheckoutSessionResponse,
  ICreateCashOrderRequest,
  ICreateCashOrderResponse,
  IOrder,
} from '../../models/order';
import { AuthService } from '../auth/auth';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly cartOrdersUrl = `${environment.apiUrl}v2/orders`;
  private readonly userOrdersUrl = `${environment.apiUrl}v1/orders/user`;
  private readonly checkoutSessionUrl = `${environment.apiUrl}v1/orders/checkout-session`;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ token: this.authService.getToken() ?? '' });
  }

  createCashOrder(
    cartId: string,
    order: ICreateCashOrderRequest,
  ): Observable<ICreateCashOrderResponse> {
    return this.http.post<ICreateCashOrderResponse>(`${this.cartOrdersUrl}/${cartId}`, order, {
      headers: this.getHeaders(),
    });
  }

  createCheckoutSession(
    cartId: string,
    order: ICreateCashOrderRequest,
    successUrl: string,
  ): Observable<ICheckoutSessionResponse> {
    return this.http.post<ICheckoutSessionResponse>(
      `${this.checkoutSessionUrl}/${cartId}`,
      order,
      {
        headers: this.getHeaders(),
        params: new HttpParams().set('url', successUrl),
      },
    );
  }

  // GET v1/orders/user/:userId بيرجع مصفوفة الطلبات مباشرة، من غير wrapper زي باقي الـ endpoints
  getUserOrders(userId: string): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.userOrdersUrl}/${userId}`, {
      headers: this.getHeaders(),
    });
  }
}
