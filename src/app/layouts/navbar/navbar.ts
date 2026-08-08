import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { Popover, PopoverModule } from 'primeng/popover';

import { Theme } from '../../core/services/theme/theme';
import { AuthService } from '../../core/services/auth/auth';
import { Cart as CartService } from '../../core/services/cart/cart';
import { WishlistService } from '../../core/services/wishlist/wishlist';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, DrawerModule, PopoverModule],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  private readonly themeService = inject(Theme);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);

  readonly isDarkMode = this.themeService.isDarkMode;

  readonly currentUser = this.authService.currentUser;
  readonly isLoggedIn = this.authService.isLoggedIn;

  private readonly _isMobileMenuOpen = signal<boolean>(false);
  readonly isMobileMenuOpen = this._isMobileMenuOpen.asReadonly();

  // Single source of truth جاي من CartService/WishlistService — بيتحدث تلقائيًا مع أي إضافة/حذف من أي مكان في التطبيق
  readonly cartCount = this.cartService.cartCount;
  readonly wishlistCount = this.wishlistService.wishlistCount;

  readonly userMenu = viewChild<Popover>('userMenuPopover');

  constructor() {
    // بنجيب السلة والـ wishlist مرة واحدة عند تحميل الأبليكيشن لو المستخدم مسجل دخول أصلاً،
    // عشان الـ badges تبان صح من أول لحظة مش لحد ما يضيف حاجة أو يفتح الصفحات دي
    afterNextRender(() => {
      if (this.authService.isLoggedIn()) {
        this.cartService.getLoggedUserCart().subscribe();
        this.wishlistService.getLoggedUserWishlist().subscribe();
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this._isMobileMenuOpen.update((prev) => !prev);
  }

  closeMobileMenu(): void {
    this._isMobileMenuOpen.set(false);
  }

  async signOut(): Promise<void> {
    this.userMenu()?.hide();
    this.closeMobileMenu();
    this.authService.logout();
    await this.router.navigateByUrl('/home');
  }
}