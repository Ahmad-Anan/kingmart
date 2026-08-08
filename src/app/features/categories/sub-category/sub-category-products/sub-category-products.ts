import { Component, computed, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { IProduct } from '../../../../core/models/product';
import { CategoryService } from '../../../../core/services/category/category';
import { ProductsService } from '../../../../core/services/products/product';

@Component({
  selector: 'app-sub-category-products',
  standalone: true,
  imports: [],
  templateUrl: './sub-category-products.html',
  styleUrl: './sub-category-products.css',
})
export class SubCategoryProducts {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly categoryService = inject(CategoryService);

  private readonly productsService = inject(ProductsService);

  private readonly paramMap = toSignal(this.route.paramMap);

  // Route:
  // /categories/:categoryId/:subCategoryId/:slug

  readonly categoryId = computed(() => this.paramMap()?.get('categoryId') ?? '');

  readonly subCategoryId = computed(() => this.paramMap()?.get('subCategoryId') ?? '');

  readonly slug = computed(() => this.paramMap()?.get('slug') ?? '');

  // =====================
  // Category
  // =====================

  private readonly categoryResource = rxResource({
    params: () =>
      this.categoryId()
        ? {
            id: this.categoryId(),
          }
        : undefined,

    stream: ({ params }) => this.categoryService.getCategory(params.id),
  });

  readonly category = computed(() => this.categoryResource.value()?.data);

  readonly categoryName = computed(() => this.category()?.name ?? '');

  // =====================
  // Sub Category
  // =====================

  private readonly subCategoryResource = rxResource({
    params: () =>
      this.subCategoryId()
        ? {
            id: this.subCategoryId(),
          }
        : undefined,

    stream: ({ params }) => this.categoryService.getSubCategory(params.id),
  });

  readonly subCategory = computed(() => this.subCategoryResource.value()?.data);

  readonly subCategoryName = computed(() => this.subCategory()?.name ?? '');

  // =====================
  // Products
  // =====================
  // مهم: لازم الـ params تتبني من categoryId و subCategoryId الحقيقيين
  // الجايين من الـ route، مش من قيم ثابتة، عشان كل فئة/فئة فرعية
  // تجيب منتجاتها الصح، مش نفس المنتجات كل مرة.

  private readonly productsResource = rxResource({
    params: () => {
      const categoryId = this.categoryId();
      const subCategoryId = this.subCategoryId();

      return subCategoryId
        ? {
            categoryId,
            subCategoryId,
          }
        : undefined;
    },

    stream: ({ params }) =>
      this.productsService.getProducts({
        'subcategory[in]': params.subCategoryId,
      }),
  });

  constructor() {
    effect(() => {
      // Debug فقط - ينفع تشيله بعد التأكد إن كل حاجة شغالة
      console.log('CATEGORY ID', this.categoryId());
      console.log('SUBCATEGORY ID', this.subCategoryId());
    });
  }

  readonly products = computed(() => this.productsResource.value()?.data ?? []);

  readonly totalProducts = computed(() => this.productsResource.value()?.results ?? 0);

  readonly isLoading = computed(() => this.productsResource.isLoading());

  readonly hasError = computed(() => !!this.productsResource.error());

  // =====================
  // Navigation
  // =====================

  goToProduct(product: IProduct): void {
    this.router.navigate(['/product-details', product._id, product.slug]);
  }

  backToSubCategories(): void {
    this.router.navigate(['/categories', this.categoryId()]);
  }

  // =====================
  // Helpers
  // =====================

  hasDiscount(product: IProduct): boolean {
    return !!(product.priceAfterDiscount && product.priceAfterDiscount < product.price);
  }

  calculateDiscountPercent(price: number, discount?: number): number | null {
    if (!discount || discount >= price) {
      return null;
    }

    return Math.round(((price - discount) / price) * 100);
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    image.src = 'assets/images/placeholder.png';
  }

  getRating(product: IProduct): number {
    return product.ratingsAverage ?? 0;
  }

  getProductPrice(product: IProduct): number {
    return product.priceAfterDiscount ?? product.price;
  }
}
