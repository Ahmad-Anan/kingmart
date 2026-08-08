import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { IProduct } from '../../../core/models/product';
import { BrandsService } from '../../../core/services/Brands/brands';
import { ProductsService } from '../../../core/services/products/product';

@Component({
  selector: 'app-details-brand',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-brand.html',
  styleUrl: './details-brand.css',
})
export class DetailsBrand {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly brandsService = inject(BrandsService);
  private readonly router = inject(Router);

  // 1. التقاط الـ ID تفاعلياً (subscribe) بدل الـ snapshot
  readonly brandId = toSignal(
    this.activatedRoute.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  // 2. جلب بيانات البراند نفسه من BrandsService
  readonly brandDetailsResource = rxResource({
    params: () => this.brandId(),
    stream: ({ params }) => (params ? this.brandsService.getBrandById(params) : of(null)),
  });

  readonly selectedBrandName = computed(() => {
    const response = this.brandDetailsResource.value();
    return response?.data?.name ?? 'Maison';
  });

  // 3. جلب منتجات البراند من ProductsService
  readonly brandProductsResource = rxResource({
    params: () => this.brandId(),
    stream: ({ params }) =>
      params ? this.productsService.getProducts({ brand: params }) : of(null),
  });

  readonly brandProducts = computed(() => {
    const res = this.brandProductsResource.value();
    return res?.data ?? [];
  });

  /**
   * عند الضغط على منتج، ننتقل لصفحة تفاصيله (محتاجين id و slug مع بعض حسب تعريف الـ Route)
   */
  onProductClick(product: IProduct): void {
    this.router.navigate(['/product-details', product._id, product.slug]);
  }
}
