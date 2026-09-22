import { effect, inject, Service, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter, map } from 'rxjs';

import { TranslationKey } from '../../core/i18n/en';
import { CategoryService } from '../../core/services/category/category';
import { LanguageService } from '../../core/services/language/language';

// String breadcrumb data is a translation key (static label, e.g. "Collections");
// { dynamic } breadcrumb data means the label comes from a live API fetch keyed by
// the categoryId/subCategoryId route param — fetched by this service itself (non-blocking,
// unlike the old route resolvers which held up navigation until the API responded).
type BreadcrumbData = TranslationKey | { readonly dynamic: 'category' | 'subCategory' };

interface BreadcrumbMenuItem extends MenuItem {
  /** true بينما اسم الفئة/الفئة الفرعية لسه بيتحمل من الـ API */
  pending?: boolean;
}

@Service()
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private readonly categoryService = inject(CategoryService);

  /**
   * مسار التتبع الحالي، بيتحدث تلقائيًا مع كل تنقل (Navigation) في التطبيق.
   */
  readonly items = signal<BreadcrumbMenuItem[]>([]);

  private readonly categoryId = signal<string | null>(null);
  private readonly subCategoryId = signal<string | null>(null);

  private readonly categoryNameResource = rxResource({
    params: () => (this.categoryId() ? { id: this.categoryId()! } : undefined),
    stream: ({ params }) =>
      this.categoryService.getCategory(params.id).pipe(map((res) => res.data.name)),
  });

  private readonly subCategoryNameResource = rxResource({
    params: () => (this.subCategoryId() ? { id: this.subCategoryId()! } : undefined),
    stream: ({ params }) =>
      this.categoryService.getSubCategory(params.id).pipe(map((res) => res.data.name)),
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.syncIdsFromRoute();
        this.items.set(this.buildTrail());
      });

    // إعادة بناء المسار كمان لما اللغة تتغيّر، عشان اللابلز الثابتة (زي "Collections")
    // تتحدث فورًا من غير ما المستخدم يحتاج يعمل navigation تاني
    effect(() => {
      this.languageService.locale();
      this.items.set(this.buildTrail());
    });

    // وكمان لما اسم الفئة/الفئة الفرعية يوصل من الـ API (أو يفشل) — بيحوّل نفس
    // الـ breadcrumb item من حالة التحميل (skeleton) للاسم الحقيقي، من غير أي navigation جديد
    effect(() => {
      this.categoryNameResource.value();
      this.categoryNameResource.error();
      this.subCategoryNameResource.value();
      this.subCategoryNameResource.error();
      this.items.set(this.buildTrail());
    });
  }

  /**
   * بيمشي على شجرة الـ route الحالية (من الجذر لحد الورقة) ويجمع
   * categoryId/subCategoryId من أي segment بيحتوي عليهم، بغض النظر عن
   * إعدادات الـ params inheritance — كل segment بيشيل بارامترات نفسه بس.
   */
  private syncIdsFromRoute(): void {
    let categoryId: string | null = null;
    let subCategoryId: string | null = null;
    let node: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;

    while (node) {
      categoryId = node.paramMap.get('categoryId') ?? categoryId;
      subCategoryId = node.paramMap.get('subCategoryId') ?? subCategoryId;
      node = node.firstChild;
    }

    this.categoryId.set(categoryId);
    this.subCategoryId.set(subCategoryId);
  }

  private buildTrail(): BreadcrumbMenuItem[] {
    const trail: BreadcrumbMenuItem[] = [];
    const root = this.router.routerState.snapshot.root;

    this.collect(root, [], trail);

    // آخر عنصر في المسار هو الصفحة الحالية، مش المفروض يكون قابل للضغط
    if (trail.length > 0) {
      delete trail[trail.length - 1].routerLink;
    }

    return trail;
  }

  private collect(
    route: ActivatedRouteSnapshot,
    parentUrl: string[],
    trail: BreadcrumbMenuItem[],
  ): void {
    const segments = route.url.map((segment) => segment.path);
    const url = segments.length ? [...parentUrl, ...segments] : parentUrl;

    // بنقرأ من route.routeConfig.data (إعدادات الـ segment نفسه) مش من route.data
    // المدموج — Angular بيورّث الـ data للـ children تلقائيًا (بعكس الـ params)،
    // فلو استخدمنا route.data كان هيتكرر نفس العنصر في الـ breadcrumb لأي child
    // route فاضي (زي path: '') تحت segment بيحدد breadcrumb
    const breadcrumbData = route.routeConfig?.data?.['breadcrumb'] as BreadcrumbData | undefined;

    if (breadcrumbData) {
      const item = this.resolveItem(breadcrumbData, url);

      if (item) {
        trail.push(item);
      }
    }

    if (route.firstChild) {
      this.collect(route.firstChild, url, trail);
    }
  }

  private resolveItem(data: BreadcrumbData, url: string[]): BreadcrumbMenuItem | null {
    if (typeof data === 'string') {
      const label = this.languageService.translate(data);
      return label ? { label, routerLink: ['/', ...url] } : null;
    }

    const resource =
      data.dynamic === 'category' ? this.categoryNameResource : this.subCategoryNameResource;

    // فشل الطلب: بنفضل نسيب الـ breadcrumb item ده من غير ما نضيفه، أحسن من
    // ما نعرض اسم غلط أو فاضي دايم
    if (resource.error()) {
      return null;
    }

    const name = resource.value();

    if (name) {
      return { label: name, routerLink: ['/', ...url] };
    }

    // لسه بيحمل: بنعرض skeleton صغير مكان الاسم بدل ما نسيب الـ breadcrumb فاضي
    return { label: '', pending: true, routerLink: ['/', ...url] };
  }
}
