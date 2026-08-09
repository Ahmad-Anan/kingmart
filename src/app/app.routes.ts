import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { categoryNameResolver } from './core/resolvers/category-name.resolver';
import { subCategoryNameResolver } from './core/resolvers/sub-category-name.resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },

  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop').then((m) => m.Shop),
  data: { hideBreadcrumb: true } // أو { showPageTitle: false }
  },

  {
    path: 'product-details/:id/:slug',
    loadComponent: () =>
      import('./features/product-details/product-details').then((m) => m.ProductDetails),
  },

  {
    path: 'categories',
    data: { breadcrumb: 'categories.eyebrow' },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
      },
      {
        path: ':categoryId',
        resolve: { categoryName: categoryNameResolver },
        data: {
          breadcrumb: (data: Record<string, unknown>) => data['categoryName'] as string,
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/categories/sub-category/sub-category').then((m) => m.SubCategory),
          },
          {
            path: ':subCategoryId/:slug',
            resolve: { subCategoryName: subCategoryNameResolver },
            data: {
              breadcrumb: (data: Record<string, unknown>) => data['subCategoryName'] as string,
            },
            loadComponent: () =>
              import('./features/categories/sub-category/sub-category-products/sub-category-products').then(
                (m) => m.SubCategoryProducts,
              ),
          },
        ],
      },
    ],
  },

  {
    path: 'brands',
    loadComponent: () => import('./features/brands/brands').then((m) => m.Brands),
  data: { hideBreadcrumb: true } // أو { showPageTitle: false }
  },

  {
    path: 'brands/:id',
    loadComponent: () =>
      import('./features/brands/details-brand/details-brand').then((m) => m.DetailsBrand),
  },

  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart').then((m) => m.Cart),

  data: { hideBreadcrumb: true } // أو { showPageTitle: false }
  },

  {
    path: 'wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./features/wishlist/wishlist').then((m) => m.Wishlist),
    data: { hideBreadcrumb: true },
  },

  {
    path: 'addresses',
    canActivate: [authGuard],
    loadComponent: () => import('./features/addresses/addresses').then((m) => m.Addresses),
    data: { hideBreadcrumb: true },
  },

  {
    path: 'checkout',
    canActivate: [authGuard],
    data: { hideBreadcrumb: true },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/checkout/checkout').then((m) => m.Checkout),
      },
      {
        path: 'success',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/checkout/checkout-success/checkout-success').then(
                (m) => m.CheckoutSuccess,
              ),
          },
          {
            // الـ backend بيتجاهل الـ url اللي بنبعته للـ checkout-session وبيعمل
            // redirect دايمًا لـ {url}/allorders بعد نجاح الدفع (مؤكد عن طريق Network tab)
            path: 'allorders',
            loadComponent: () =>
              import('./features/checkout/checkout-success/checkout-success').then(
                (m) => m.CheckoutSuccess,
              ),
          },
        ],
      },
    ],
  },

  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/orders').then((m) => m.Orders),
    data: { hideBreadcrumb: true },
  },

  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'forget-password',
    loadComponent: () =>
      import('./features/auth/forget-password/forget-password').then((m) => m.ForgetPassword),
  },

  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
