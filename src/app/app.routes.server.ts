import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'product-details/:id/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'categories/:categoryId',
    renderMode: RenderMode.Server
  },
  {
    path: 'categories/:categoryId/:subCategoryId/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'brands/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
