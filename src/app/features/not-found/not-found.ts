import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

interface IQuickLink {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  protected readonly quickLinks: readonly IQuickLink[] = [
    { icon: 'pi pi-home', label: 'Home', route: '/home' },
    { icon: 'pi pi-shopping-bag', label: 'Shop', route: '/shop' },
    { icon: 'pi pi-th-large', label: 'Categories', route: '/categories' },
    { icon: 'pi pi-tags', label: 'Brands', route: '/brands' },
    { icon: 'pi pi-shopping-cart', label: 'Cart', route: '/cart' },
  ];
}
