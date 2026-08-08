// wishlist.ts
import { afterNextRender, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IProduct } from '../../core/models/product';
import { Cart as CartService } from '../../core/services/cart/cart';
import { WishlistService } from '../../core/services/wishlist/wishlist';

@Component({
  selector: 'app-wishlist',
  imports: [ProgressSpinnerModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  readonly wishlistData = this.wishlistService.wishlistData;
  readonly isLoading = signal(true);
  readonly removingProductId = signal<string | null>(null);
  readonly addingToCartId = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      this.loadWishlist();
    });
  }

  private loadWishlist(): void {
    this.isLoading.set(true);
    this.wishlistService.getLoggedUserWishlist().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false),
    });
  }

  removeProduct(productId: string): void {
    if (this.removingProductId()) return;
    this.removingProductId.set(productId);
    this.wishlistService.removeProductFromWishlist(productId).subscribe({
      next: () => this.removingProductId.set(null),
      error: () => this.removingProductId.set(null),
    });
  }

  addToCart(productId: string): void {
    if (this.addingToCartId()) return;
    this.addingToCartId.set(productId);
    this.cartService.addProductToCart(productId).subscribe({
      next: () => this.addingToCartId.set(null),
      error: () => this.addingToCartId.set(null),
    });
  }

  trackByProductId(_index: number, item: IProduct): string {
    return item._id;
  }
}
