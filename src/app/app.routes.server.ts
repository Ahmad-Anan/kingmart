import { RenderMode, ServerRoute } from '@angular/ssr';

// الـ routes اللي فيها params مش ممكن تتعمل prerender، وVercel بيعرض الـ static output بس
// (مفيش SSR function شغالة) — فبنخليها Client، وvercel.json بيعمل fallback لـ /index.csr.html
export const serverRoutes: ServerRoute[] = [
  {
    path: 'product-details/:id/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'categories/:categoryId',
    renderMode: RenderMode.Client
  },
  {
    path: 'categories/:categoryId/:subCategoryId/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'brands/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
