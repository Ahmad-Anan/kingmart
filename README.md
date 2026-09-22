# KingMart

> A luxury e-commerce storefront built with Angular 22 — zoneless, SSR-enabled, and fully bilingual (Arabic/English with RTL).

**Live demo:** [kingmart.vercel.app](https://kingmart.vercel.app)

---

## Overview

KingMart is a full-featured e-commerce front-end consuming the [Route Academy E-Commerce API](https://ecommerce.routemisr.com/api/). It was built as a portfolio project to demonstrate production-grade Angular architecture: signals-first state management, zoneless change detection, and a design system built around a "quiet luxury" visual language — deep royal backgrounds, sparing gold accents, and serif display typography.

The goal wasn't just to consume an API and render lists — it was to build the app the way a senior Angular team would in 2026: `OnPush` everywhere, no memory leaks, optimized images, non-blocking navigation, and a codebase an interviewer could open and trust.

## Features

- **Catalog & browsing** — home, categories, sub-categories, brands, shop with filtering and pagination
- **Product details** — image gallery, reviews with star ratings, related products
- **Cart & wishlist** — signal-based state, optimistic UI updates, quantity stepper (custom-built after a PrimeNG `InputNumber` bug)
- **Checkout** — address management, Stripe payment integration, order history
- **Auth** — register/login/forgot-password flows, SSR-safe route guards with return-URL redirect after login
- **Reviews** — create/edit/delete own reviews, star breakdown
- **i18n** — full Arabic/English translation with RTL layout support
- **Dark mode** — single source of truth across Tailwind, PrimeNG theming, and app state

## Architecture highlights

| Area | Approach |
|---|---|
| Change detection | Zoneless (`provideZonelessChangeDetection`) + `OnPush` on every component |
| State | Signals (`signal`/`computed`) and `rxResource` for HTTP-bound state — no `BehaviorSubject` fields |
| Routing | Fully lazy-loaded via `loadComponent`, no `NgModule`s anywhere |
| Rendering | SSR with client hydration |
| Subscriptions | `takeUntilDestroyed()` on every manual `.subscribe()` — no leaks |
| Images | `NgOptimizedImage` throughout, with `priority` on LCP candidates |
| Breadcrumbs | Resolved via `rxResource` inside the service, not route resolvers — navigation never blocks on an API response |
| Styling | Tailwind CSS v4 + PrimeNG (Nora preset), custom royal/gold theme |

## Tech stack

**Angular 22** · **TypeScript** · **Tailwind CSS v4** · **PrimeNG 22** · **RxJS** · **Express (SSR)** · **Vitest**

## Getting started

```bash
npm install
npm start          # dev server at http://localhost:4200
```

```bash
npm run build       # production build to dist/
npm test            # unit tests (Vitest)
```

To run the SSR build locally:

```bash
npm run build
node dist/E-Commerce22/server/server.mjs
```

## Project structure

```
src/app/
├── core/          # singletons: services, interceptors, guards, models, resolvers
├── features/       # one folder per routed feature (home, shop, cart, checkout, ...)
├── layouts/        # navbar, footer — app shell, not routed
└── shared/          # reusable non-feature pieces (breadcrumb, pipes)
```

## Author

Built by **Ahmed** — [GitHub](https://github.com/Ahmad-Anan) · [LinkedIn](https://linkedin.com/in/ahmed-anan-285364273) · [Portfolio](https://portfolio-one-navy-65.vercel.app)

---

<div dir="rtl">

# كينج مارت

> واجهة متجر إلكتروني فاخر مبنية بـ Angular 22 — zoneless، مدعومة بـ SSR، وثنائية اللغة بالكامل (عربي/إنجليزي مع دعم RTL).

**رابط المشروع المباشر:** [kingmart.vercel.app](https://kingmart.vercel.app)

---

## نظرة عامة

كينج مارت واجهة متجر إلكتروني متكاملة بتستهلك [Route Academy E-Commerce API](https://ecommerce.routemisr.com/api/). اتعمل كمشروع بورتفوليو لإظهار بنية Angular احترافية: إدارة حالة قائمة على الـ signals، change detection من نوع zoneless، ونظام تصميم مبني على فلسفة "الفخامة الهادئة" — خلفيات رويال غامقة، لمسات ذهبية محدودة، وخطوط serif فخمة.

الهدف مكانش مجرد استهلاك API وعرض قوائم — الهدف كان بناء المشروع بالطريقة اللي فريق Angular محترف هيبنيه بيها في 2026: `OnPush` على كل مكان، من غير أي memory leaks، صور محسّنة، تنقل غير معطّل، وكود أي إنترفيور يقدر يفتحه ويثق فيه.

## المميزات

- **تصفح الكتالوج** — الصفحة الرئيسية، الفئات، الفئات الفرعية، الماركات، صفحة المتجر مع فلترة وترقيم صفحات
- **تفاصيل المنتج** — معرض صور، تقييمات بنجوم، منتجات مشابهة
- **العربة وقائمة الأمنيات** — حالة قائمة على signals، تحديثات فورية في الواجهة، عداد كمية مخصوص (اتعمل بعد ما اكتشفنا باج في `InputNumber` بتاع PrimeNG)
- **الدفع** — إدارة عناوين، تكامل مع Stripe، سجل الطلبات
- **تسجيل الدخول** — تسجيل، دخول، نسيان كلمة السر، حماية راوتس متوافقة مع SSR مع إعادة توجيه بعد تسجيل الدخول
- **التقييمات** — إضافة/تعديل/حذف تقييمك الخاص، توزيع النجوم
- **دعم لغتين** — ترجمة كاملة عربي/إنجليزي مع دعم RTL
- **الوضع الليلي** — مصدر واحد للحقيقة عبر Tailwind وPrimeNG وحالة التطبيق

## أبرز قرارات البنية

| المجال | الأسلوب |
|---|---|
| Change detection | Zoneless (`provideZonelessChangeDetection`) + `OnPush` على كل كومبوننت |
| الحالة | Signals (`signal`/`computed`) و`rxResource` للحالة المرتبطة بالـ HTTP — من غير `BehaviorSubject` |
| التوجيه | كله lazy-loaded عن طريق `loadComponent`، من غير أي `NgModule` |
| العرض | SSR مع client hydration |
| الاشتراكات | `takeUntilDestroyed()` على كل `.subscribe()` يدوي — من غير تسريبات |
| الصور | `NgOptimizedImage` في كل مكان، مع `priority` على صور الـ LCP |
| الـ Breadcrumbs | بتتحل عن طريق `rxResource` جوه الـ service، مش route resolvers — التنقل مايتوقفش أبدًا على رد الـ API |
| التنسيق | Tailwind CSS v4 + PrimeNG (preset اسمه Nora)، ثيم رويال/ذهبي مخصوص |

## التقنيات المستخدمة

**Angular 22** · **TypeScript** · **Tailwind CSS v4** · **PrimeNG 22** · **RxJS** · **Express (SSR)** · **Vitest**

## طريقة التشغيل

```bash
npm install
npm start          # سيرفر التطوير على http://localhost:4200
```

```bash
npm run build       # بناء نسخة الإنتاج في dist/
npm test            # تشغيل الاختبارات (Vitest)
```

لتشغيل نسخة الـ SSR محليًا:

```bash
npm run build
node dist/E-Commerce22/server/server.mjs
```

## هيكل المشروع

```
src/app/
├── core/          # singletons: services, interceptors, guards, models, resolvers
├── features/       # مجلد لكل feature موجّه (home, shop, cart, checkout, ...)
├── layouts/        # navbar, footer — إطار التطبيق، مش موجّه
└── shared/          # أجزاء قابلة لإعادة الاستخدام (breadcrumb, pipes)
```

## المطوّر

تم البناء بواسطة **أحمد** — [GitHub](https://github.com/Ahmad-Anan) · [LinkedIn](https://linkedin.com/in/ahmed-anan-285364273) · [Portfolio](https://portfolio-one-navy-65.vercel.app)

</div>
