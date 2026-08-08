// cart.ts
import { afterNextRender, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ICartProduct } from '../../core/models/cart';
import { Cart as CartService } from '../../core/services/cart/cart';

@Component({
  selector: 'app-cart',
  imports: [ButtonModule, ProgressSpinnerModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private readonly cartService = inject(CartService);

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
    this.cartService.getLoggedUserCart().subscribe({
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
    this.cartService.updateCartProductQuantity(productId, count).subscribe({
      next: () => this.updatingProductId.set(null),
      error: () => this.updatingProductId.set(null),
    });
  }

  removeProduct(productId: string): void {
    this.updatingProductId.set(productId);
    this.cartService.removeProductFromCart(productId).subscribe({
      next: () => this.updatingProductId.set(null),
      error: () => this.updatingProductId.set(null),
    });
  }

  clearCart(): void {
    this.cartService.clearUserCart().subscribe();
  }

  trackByProductId(_index: number, item: ICartProduct): string {
    return item._id;
  }
}
