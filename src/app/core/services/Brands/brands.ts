import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IBrandsResponse, ISpecificBrandResponse } from '../../models/brand';

@Service()
export class BrandsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}v1/brands`;

  /**
   * جلب كافة البراندات مع دعم كامل لكافة معاملات التصفية والفرز (limit, keyword, page...)
   */
  getAllBrands(params?: Record<string, string | number | boolean>): Observable<IBrandsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<IBrandsResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * جلب براند محدد بواسطة الـ ID الخاص به — يرجع براند واحد (data: IBrand) مش مصفوفة
   * ملحوظة: النوع الراجع لازم يكون ISpecificBrandResponse مش IBrandsResponse
   */
  getBrandById(id: string): Observable<ISpecificBrandResponse> {
    return this.http.get<ISpecificBrandResponse>(`${this.apiUrl}/${id}`);
  }
}
