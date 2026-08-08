import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products/product';
import { Cart as CartService } from '../../../core/services/cart/cart';
import { WishlistService } from '../../../core/services/wishlist/wishlist';

@Component({
  selector: 'app-home-product',
  imports: [RouterLink],
  templateUrl: './home-product.html',
  styleUrl: './home-product.css',
})
export class HomeProduct {
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  private readonly queryParams = signal<Record<string, string | number | undefined>>({
    limit: 6,
    sort: '-sold',
  });

  protected readonly productsResource = rxResource({
    params: () => this.queryParams(),
    stream: ({ params }) => this.productsService.getProducts(params),
  });

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
}
