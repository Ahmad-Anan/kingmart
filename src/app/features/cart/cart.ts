// cart.ts
import { NgOptimizedImage } from '@angular/common';
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
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ICartProduct } from '../../core/models/cart';
import { Cart as CartService } from '../../core/services/cart/cart';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, NgOptimizedImage, ProgressSpinnerModule, RouterLink, TranslatePipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cartData = this.cartService.cartData;
  readonly isLoading = signal(true);
  readonly updatingProductId = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      this.loadCart();
    });
  }

  private loadCart(): void {
    this.isLoading.set(true);
    this.cartService
      .getLoggedUserCart()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false),
      });
  }

  increment(item: ICartProduct): void {
    this.setQuantity(item.product._id, item.count + 1);
  }

  decrement(item: ICartProduct): void {
    if (item.count <= 1) return;
    this.setQuantity(item.product._id, item.count - 1);
  }

  private setQuantity(productId: string, count: number): void {
    if (this.updatingProductId()) return; // avoid overlapping requests
    this.updatingProductId.set(productId);
    this.cartService
      .updateCartProductQuantity(productId, count)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.updatingProductId.set(null),
        error: () => this.updatingProductId.set(null),
      });
  }

  removeProduct(productId: string): void {
    this.updatingProductId.set(productId);
    this.cartService
      .removeProductFromCart(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.updatingProductId.set(null),
        error: () => this.updatingProductId.set(null),
      });
  }

  clearCart(): void {
    this.cartService.clearUserCart().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  trackByProductId(_index: number, item: ICartProduct): string {
    return item._id;
  }
}
