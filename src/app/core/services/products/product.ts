import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IProductResponse, IProductsResponse } from '../../models/product';

@Service()
export class ProductsService {
  private readonly http = inject(HttpClient);

  private readonly productsEndpoint = `${environment.apiUrl}v1/products`;

  private buildQueryParams(params?: Record<string, string | number | undefined>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) {
      return httpParams;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  getProducts(params?: Record<string, string | number | undefined>): Observable<IProductsResponse> {
    return this.http.get<IProductsResponse>(this.productsEndpoint, {
      params: this.buildQueryParams(params),
    });
  }

  getProductById(id: string): Observable<IProductResponse> {
    return this.http.get<IProductResponse>(`${this.productsEndpoint}/${id}`);
  }
}
