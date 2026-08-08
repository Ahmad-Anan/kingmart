import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { map, of, switchMap } from 'rxjs';
import { ProductsService } from '../../core/services/products/product';
import { Cart as CartService } from '../../core/services/cart/cart';
import { WishlistService } from '../../core/services/wishlist/wishlist';
import { Breadcrumb } from '../../shared/breadcrumb/breadcrumb';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [DecimalPipe, RouterLink, Breadcrumb],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly route = inject(ActivatedRoute);

  readonly productId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') || '')));

  // تفاعل المعرض والألوان والكمية
  readonly selectedImage = signal<string>('');
  readonly selectedColor = signal<string>('');
  readonly quantity = signal<number>(1);

  readonly productResource = rxResource({
    params: () => this.productId(),
    stream: ({ params: id }) => {
      if (!id) {
        throw new Error('Product ID is missing');
      }
      return this.productsService.getProductById(id);
    },
  });

  // بناء مسارات الـ Breadcrumb ديناميكياً - المسار الكامل:
  // Collections > الفئة > الفئة الفرعية > اسم المنتج
  readonly breadcrumbItems = computed<MenuItem[]>(() => {
    const res = this.productResource.value();
    const product = res?.data;

    if (!product) {
      return [{ label: 'Collections', routerLink: ['/categories'] }, { label: 'Product Details' }];
    }

    const items: MenuItem[] = [{ label: 'Collections', routerLink: ['/categories'] }];

    if (product.category) {
      items.push({
        label: product.category.name,
        routerLink: ['/categories', product.category._id],
      });
    }

    // بناخد أول فئة فرعية بتاعة المنتج (ممكن ينتمي لأكتر من واحدة، بس المسار
    // بيحتاج واحدة بس عشان يبني رابط منطقي لصفحة المنتجات اللي جاي منها)
    const firstSubCategory = product.subcategory?.[0];

    if (firstSubCategory) {
      const parentCategoryId = product.category?._id ?? firstSubCategory.category;

      items.push({
        label: firstSubCategory.name,
        routerLink: ['/categories', parentCategoryId, firstSubCategory._id, firstSubCategory.slug],
      });
    }

    items.push({ label: product.title });

    return items;
  });

  setMainImage(img: string) {
    this.selectedImage.set(img);
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
  }

  // لو المنتج ده أصلاً بند في السلة المشتركة (cartData من CartService)، بنعتبره
  // مصدر الحقيقة الوحيد للكمية — الـ local `quantity` signal بتاعنا يبقى مستخدم بس
  // قبل أول إضافة للسلة
  readonly cartItem = computed(() =>
    this.cartService
      .cartData()
      ?.data.products.find((item) => item.product._id === this.productId()),
  );
  readonly isInCart = computed(() => !!this.cartItem());
  readonly displayedQuantity = computed(() => this.cartItem()?.count ?? this.quantity());

  readonly isUpdatingQuantity = signal(false);

  increment(maxStock: number): void {
    if (this.isUpdatingQuantity() || this.displayedQuantity() >= maxStock) return;

    const next = this.displayedQuantity() + 1;
    const item = this.cartItem();

    if (item) {
      this.setCartQuantity(item.product._id, next);
    } else {
      this.quantity.set(next);
    }
  }

  decrement(): void {
    if (this.isUpdatingQuantity() || this.displayedQuantity() <= 1) return;

    const next = this.displayedQuantity() - 1;
    const item = this.cartItem();

    if (item) {
      this.setCartQuantity(item.product._id, next);
    } else {
      this.quantity.set(next);
    }
  }

  private setCartQuantity(productId: string, count: number): void {
    this.isUpdatingQuantity.set(true);
    this.cartService.updateCartProductQuantity(productId, count).subscribe({
      next: () => this.isUpdatingQuantity.set(false),
      error: () => this.isUpdatingQuantity.set(false),
    });
  }

  readonly isAddingToCart = signal(false);

  addToCart(): void {
    const productId = this.productId();
    if (!productId || this.isAddingToCart() || this.isInCart()) return;

    const selectedQuantity = this.quantity();

    this.isAddingToCart.set(true);
    this.cartService
      .addProductToCart(productId)
      .pipe(
        // الـ add endpoint بيحط قطعة واحدة بس، فلو المستخدم مختار كمية أكبر
        // بنعدّلها بعدين بنفس الـ productId
        switchMap((res) =>
          selectedQuantity > 1
            ? this.cartService.updateCartProductQuantity(productId, selectedQuantity)
            : of(res),
        ),
      )
      .subscribe({
        next: () => this.isAddingToCart.set(false),
        error: () => this.isAddingToCart.set(false),
      });
  }

  readonly isTogglingWishlist = signal(false);

  isWishlisted(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  toggleWishlist(): void {
    const productId = this.productId();
    if (!productId || this.isTogglingWishlist()) return;

    this.isTogglingWishlist.set(true);
    const request = this.wishlistService.isInWishlist(productId)
      ? this.wishlistService.removeProductFromWishlist(productId)
      : this.wishlistService.addProductToWishlist(productId);

    request.subscribe({
      next: () => this.isTogglingWishlist.set(false),
      error: () => this.isTogglingWishlist.set(false),
    });
  }
}
