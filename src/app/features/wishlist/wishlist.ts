// wishlist.ts
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IProduct } from '../../core/models/product';
import { Cart as CartService } from '../../core/services/cart/cart';
import { WishlistService } from '../../core/services/wishlist/wishlist';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-wishlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressSpinnerModule, RouterLink, TranslatePipe],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

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
    this.wishlistService
      .getLoggedUserWishlist()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false),
      });
  }

  removeProduct(productId: string): void {
    if (this.removingProductId()) return;
    this.removingProductId.set(productId);
    this.wishlistService
      .removeProductFromWishlist(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.removingProductId.set(null),
        error: () => this.removingProductId.set(null),
      });
  }

  addToCart(productId: string): void {
    if (this.addingToCartId()) return;
    this.addingToCartId.set(productId);
    this.cartService
      .addProductToCart(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.addingToCartId.set(null),
        error: () => this.addingToCartId.set(null),
      });
  }

  trackByProductId(_index: number, item: IProduct): string {
    return item._id;
  }
}
