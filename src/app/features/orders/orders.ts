// orders.ts
import { DatePipe, NgOptimizedImage } from '@angular/common';
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

import { IOrder } from '../../core/models/order';
import { AuthService } from '../../core/services/auth/auth';
import { OrderService } from '../../core/services/order/order';
import { PricePipe } from '../../shared/pipes/price-pipe';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    NgOptimizedImage,
    RouterLink,
    ProgressSpinnerModule,
    PricePipe,
    TranslatePipe,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<IOrder[]>([]);
  readonly isLoading = signal(true);

  constructor() {
    afterNextRender(() => {
      this.loadOrders();
    });
  }

  private loadOrders(): void {
    const userId = this.authService.currentUser()?._id;
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.orderService
      .getUserOrders(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => {
          // مش بنعتمد على ترتيب الـ API (غير موثّق) — بنفرض الأحدث أولاً بنفسنا دايمًا
          const sorted = [...orders].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          this.orders.set(sorted);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  trackByOrderId(_index: number, order: IOrder): string {
    return order._id;
  }

  shortOrderRef(id: string): string {
    return `#${id.slice(-6).toUpperCase()}`;
  }
}
