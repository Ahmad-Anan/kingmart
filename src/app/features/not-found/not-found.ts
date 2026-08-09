import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { TranslationKey } from '../../core/i18n/en';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

interface IQuickLink {
  icon: string;
  labelKey: TranslationKey;
  route: string;
}

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonModule, TranslatePipe],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  protected readonly quickLinks: readonly IQuickLink[] = [
    { icon: 'pi pi-home', labelKey: 'notFound.home', route: '/home' },
    { icon: 'pi pi-shopping-bag', labelKey: 'notFound.shop', route: '/shop' },
    { icon: 'pi pi-th-large', labelKey: 'notFound.categories', route: '/categories' },
    { icon: 'pi pi-tags', labelKey: 'notFound.brands', route: '/brands' },
    { icon: 'pi pi-shopping-cart', labelKey: 'notFound.cart', route: '/cart' },
  ];
}
