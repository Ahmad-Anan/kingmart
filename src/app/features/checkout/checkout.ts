// checkout.ts
import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { IOrder } from '../../core/models/order';
import { AddressService } from '../../core/services/address/address';
import { Cart as CartService } from '../../core/services/cart/cart';
import { LanguageService } from '../../core/services/language/language';
import { OrderService } from '../../core/services/order/order';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonModule, MessageModule, ProgressSpinnerModule, TranslatePipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private readonly cartService = inject(CartService);
  private readonly addressService = inject(AddressService);
  private readonly orderService = inject(OrderService);
  private readonly languageService = inject(LanguageService);

  readonly cartData = this.cartService.cartData;
  readonly addresses = this.addressService.addresses;

  readonly isLoading = signal(true);
  readonly selectedAddressId = signal<string | null>(null);
  readonly paymentMethod = signal<'cash' | 'card'>('cash');
  readonly isPlacingOrder = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly placedOrder = signal<IOrder | null>(null);

  readonly selectedAddress = computed(() =>
    this.addresses().find((address) => address._id === this.selectedAddressId()),
  );

  constructor() {
    afterNextRender(() => {
      this.loadCheckoutData();
    });
  }

  private loadCheckoutData(): void {
    this.isLoading.set(true);
    forkJoin({
      cart: this.cartService.getLoggedUserCart(),
      addresses: this.addressService.getLoggedUserAddresses(),
    }).subscribe({
      next: ({ addresses }) => {
        if (addresses.data.length > 0) {
          this.selectedAddressId.set(addresses.data[0]._id);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId.set(addressId);
  }

  selectPaymentMethod(method: 'cash' | 'card'): void {
    this.paymentMethod.set(method);
  }

  placeOrder(): void {
    const cartId = this.cartData()?.cartId;
    const address = this.selectedAddress();
    if (!cartId || !address || this.isPlacingOrder()) return;

    const shippingAddress = {
      details: address.details,
      phone: address.phone,
      city: address.city,
    };

    this.serverError.set(null);
    this.isPlacingOrder.set(true);

    if (this.paymentMethod() === 'card') {
      const successUrl = `${window.location.origin}/checkout/success`;

      this.orderService.createCheckoutSession(cartId, { shippingAddress }, successUrl).subscribe({
        next: (res) => {
          // مفيش إلغاء لـ isPlacingOrder هنا عمدًا — المستخدم بيتحول فورًا لصفحة Stripe،
          // فمفيش داعي نرجع الزرار شغال قبل ما يسيب الصفحة أصلاً
          window.location.href = res.session.url;
        },
        error: (err) => {
          this.isPlacingOrder.set(false);
          this.serverError.set(this.resolveErrorMessage(err));
        },
      });
      return;
    }

    this.orderService.createCashOrder(cartId, { shippingAddress }).subscribe({
      next: (res) => {
        this.isPlacingOrder.set(false);
        this.placedOrder.set(res.data);
        this.cartService.clearUserCart().subscribe();
      },
      error: (err) => {
        this.isPlacingOrder.set(false);
        this.serverError.set(this.resolveErrorMessage(err));
      },
    });
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string') {
      return err.error.message;
    }
    return this.languageService.translate('checkout.genericError');
  }
}
