// checkout-success.ts
import { afterNextRender, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { IOrder } from '../../../core/models/order';
import { AuthService } from '../../../core/services/auth/auth';
import { OrderService } from '../../../core/services/order/order';

const RECENT_ORDER_WINDOW_MS = 10 * 60 * 1000;

@Component({
  selector: 'app-checkout-success',
  imports: [ProgressSpinnerModule],
  templateUrl: './checkout-success.html',
  styleUrl: './checkout-success.css',
})
export class CheckoutSuccess {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  // مفيش API endpoint بيتحقق من حالة دفع Stripe فعليًا، فمش بنقفل السلة أو ندّعي
  // النجاح على طول — بنشوف بس هل ظهر order جديد في آخر 10 دقايق (best effort)
  readonly isChecking = signal(true);
  readonly recentOrder = signal<IOrder | null>(null);

  constructor() {
    afterNextRender(() => {
      this.checkForRecentOrder();
    });
  }

  private checkForRecentOrder(): void {
    const userId = this.authService.currentUser()?._id;
    if (!userId) {
      this.isChecking.set(false);
      return;
    }

    this.orderService.getUserOrders(userId).subscribe({
      next: (orders) => {
        const cutoff = Date.now() - RECENT_ORDER_WINDOW_MS;
        const latest = [...orders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];

        if (latest && new Date(latest.createdAt).getTime() >= cutoff) {
          this.recentOrder.set(latest);
        }
        this.isChecking.set(false);
      },
      error: () => this.isChecking.set(false),
    });
  }

  // بنستخدم navigateByUrl بـ string صريح بدل [routerLink] هنا كـ extra safety —
  // الـ string بيتفسّر absolute دايمًا زي ما المتصفح بيتعامل مع أي URL، من غير أي
  // اعتماد على الـ ActivatedRoute الحالي خالص
  goTo(path: '/orders' | '/cart'): void {
    this.router.navigateByUrl(path);
  }
}
