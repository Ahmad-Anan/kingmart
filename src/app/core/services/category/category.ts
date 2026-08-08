import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ICategoriesResponse,
  ICategoryResponse,
  ISingleSubCategoryResponse,
  ISubCategoriesResponse,
} from '../../models/category';

@Service()
export class CategoryService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}v1`;
  private readonly categoriesEndpoint = `${this.apiUrl}/categories`;
  private readonly subCategoriesEndpoint = `${this.apiUrl}/subcategories`;

  private buildPaginationParams(limit: number, page: number): HttpParams {
    return new HttpParams().set('limit', String(limit)).set('page', String(page));
  }

  getCategory(categoryId: string): Observable<ICategoryResponse> {
    return this.http.get<ICategoryResponse>(`${this.categoriesEndpoint}/${categoryId}`);
  }

  getCategories(limit: number = 10, page: number = 1): Observable<ICategoriesResponse> {
    return this.http.get<ICategoriesResponse>(this.categoriesEndpoint, {
      params: this.buildPaginationParams(limit, page),
    });
  }

  getSubCategories(limit: number = 10, page: number = 1): Observable<ISubCategoriesResponse> {
    return this.http.get<ISubCategoriesResponse>(this.subCategoriesEndpoint, {
      params: this.buildPaginationParams(limit, page),
    });
  }

  getSubCategory(subCategoryId: string): Observable<ISingleSubCategoryResponse> {
    return this.http.get<ISingleSubCategoryResponse>(
      `${this.subCategoriesEndpoint}/${subCategoryId}`,
    );
  }

  getCategorySubCategories(
    categoryId: string,
    limit: number = 10,
    page: number = 1,
  ): Observable<ISubCategoriesResponse> {
    return this.http.get<ISubCategoriesResponse>(
      `${this.categoriesEndpoint}/${categoryId}/subcategories`,
      {
        params: this.buildPaginationParams(limit, page),
      },
    );
  }
}
