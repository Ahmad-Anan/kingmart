import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { IProductsResponse } from '../../core/models/product';
import { ProductsService } from '../../core/services/products/product';
import { Cart as CartService } from '../../core/services/cart/cart';
import { WishlistService } from '../../core/services/wishlist/wishlist';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-shop',
  imports: [RouterLink, PaginatorModule, TranslatePipe],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  // بتتربط تلقائياً بالـ query params من الرابط، من غير ActivatedRoute خالص
  readonly brand = input<string>();
  readonly category = input<string>();
  readonly subcategory = input<string>();
  readonly sort = input<string>();
  readonly keyword = input<string>();

  protected readonly rowsPerPage = 12;
  protected readonly page = signal(1);

  constructor() {
    // أي تغيير في الفلاتر (brand/category/subcategory/sort/keyword) يرجّع الصفحة لـ 1
    // — لو سبناها زي ما هي ممكن اليوزر يقف على صفحة 5 مثلاً وبعدها يفلتر فيرجع نتيجة فاضية
    effect(() => {
      this.brand();
      this.category();
      this.subcategory();
      this.sort();
      this.keyword();
      this.page.set(1);
    });
  }

  protected readonly productsResource = rxResource<
    IProductsResponse,
    Record<string, string | number | undefined>
  >({
    params: () => ({
      brand: this.brand(),
      category: this.category(),
      subcategory: this.subcategory(),
      sort: this.sort(),
      keyword: this.keyword(),
      page: this.page(),
      limit: this.rowsPerPage,
    }),
    stream: ({ params }) => this.productsService.getProducts(params),
  });

  // الـ API مبترجعش عدد إجمالي مباشر، بس بترجع عدد الصفحات — بنحسب upper-bound منه
  // (ممكن يزيد شوية عن الحقيقي في آخر صفحة مش كاملة، تفصيلة بصرية بسيطة مش مؤثرة)
  protected readonly totalRecords = computed(
    () => (this.productsResource.value()?.metadata.numberOfPages ?? 0) * this.rowsPerPage,
  );

  protected readonly showingFrom = computed(() =>
    this.totalRecords() === 0 ? 0 : (this.page() - 1) * this.rowsPerPage + 1,
  );

  protected readonly showingTo = computed(() =>
    Math.min(this.page() * this.rowsPerPage, this.totalRecords()),
  );

  protected onPageChange(event: PaginatorState): void {
    this.page.set((event.page ?? 0) + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // بنقسّم على أي whitespace (مسافة/تاب/سطر جديد) عشان نضمن ماناخدش نص كلمة مقطوعة
  protected shortDescription(description: string): string {
    const words = description.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 3) return words.join(' ');
    return `${words.slice(0, 3).join(' ')}...`;
  }

  protected readonly addingProductId = signal<string | null>(null);

  protected addToCart(event: Event, productId: string): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.addingProductId()) return;

    this.addingProductId.set(productId);
    this.cartService.addProductToCart(productId).subscribe({
      next: () => this.addingProductId.set(null),
      error: () => this.addingProductId.set(null),
    });
  }

  protected readonly togglingWishlistId = signal<string | null>(null);

  protected isWishlisted(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  protected toggleWishlist(event: Event, productId: string): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.togglingWishlistId()) return;

    this.togglingWishlistId.set(productId);
    const request = this.wishlistService.isInWishlist(productId)
      ? this.wishlistService.removeProductFromWishlist(productId)
      : this.wishlistService.addProductToWishlist(productId);

    request.subscribe({
      next: () => this.togglingWishlistId.set(null),
      error: () => this.togglingWishlistId.set(null),
    });
  }
}
