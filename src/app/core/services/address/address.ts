// address.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IAddAddressRequest,
  IAddressesResponse,
  IAddressMutationResponse,
  ISingleAddressResponse,
} from '../../models/address';
import { AuthService } from '../auth/auth';

@Service()
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}v1/addresses`;

  // Single source of truth لعناوين المستخدم عبر الأبليكيشن كله (صفحة العناوين، اختيار عنوان الشحن..)
  readonly addresses = signal<IAddressesResponse['data']>([]);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ token: this.authService.getToken() ?? '' });
  }

  getLoggedUserAddresses(): Observable<IAddressesResponse> {
    return this.http
      .get<IAddressesResponse>(this.baseUrl, { headers: this.getHeaders() })
      .pipe(tap((res) => this.addresses.set(res.data)));
  }

  getAddress(addressId: string): Observable<ISingleAddressResponse> {
    return this.http.get<ISingleAddressResponse>(`${this.baseUrl}/${addressId}`, {
      headers: this.getHeaders(),
    });
  }

  // شكل response الـ POST/DELETE مش مؤكد فعليًا من الـ API (على عكس الـ GET) —
  // بدل ما نفترض شكله ونحدّث الـ signal منه مباشرة، بنعمل refetch موثوق بعد النجاح
  addAddress(address: IAddAddressRequest): Observable<IAddressesResponse> {
    return this.http
      .post<IAddressMutationResponse>(this.baseUrl, address, { headers: this.getHeaders() })
      .pipe(switchMap(() => this.getLoggedUserAddresses()));
  }

  removeAddress(addressId: string): Observable<IAddressesResponse> {
    return this.http
      .delete<IAddressMutationResponse>(`${this.baseUrl}/${addressId}`, {
        headers: this.getHeaders(),
      })
      .pipe(switchMap(() => this.getLoggedUserAddresses()));
  }
}
