import { effect, inject, Service, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs';

import { TranslationKey } from '../../core/i18n/en';
import { LanguageService } from '../../core/services/language/language';

// String breadcrumb data is a translation key (static label, e.g. "Collections");
// function breadcrumb data reads real API data from a resolver (category/sub-category
// name) and is displayed as-is, never translated.
type BreadcrumbData = TranslationKey | ((data: Record<string, unknown>) => string);

@Service()
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  /**
   * مسار التتبع الحالي، بيتحدث تلقائيًا مع كل تنقل (Navigation) في التطبيق.
   */
  readonly items = signal<MenuItem[]>([]);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.items.set(this.buildTrail());
      });

    // إعادة بناء المسار كمان لما اللغة تتغيّر، عشان اللابلز الثابتة (زي "Collections")
    // تتحدث فورًا من غير ما المستخدم يحتاج يعمل navigation تاني
    effect(() => {
      this.languageService.locale();
      this.items.set(this.buildTrail());
    });
  }

  private buildTrail(): MenuItem[] {
    const trail: MenuItem[] = [];
    const root = this.router.routerState.snapshot.root;

    this.collect(root, [], trail);

    // آخر عنصر في المسار هو الصفحة الحالية، مش المفروض يكون قابل للضغط
    if (trail.length > 0) {
      delete trail[trail.length - 1].routerLink;
    }

    return trail;
  }

  private collect(route: ActivatedRouteSnapshot, parentUrl: string[], trail: MenuItem[]): void {
    const segments = route.url.map((segment) => segment.path);
    const url = segments.length ? [...parentUrl, ...segments] : parentUrl;

    const breadcrumbData = route.data['breadcrumb'] as BreadcrumbData | undefined;

    if (breadcrumbData) {
      const label =
        typeof breadcrumbData === 'function'
          ? breadcrumbData(route.data)
          : this.languageService.translate(breadcrumbData);

      if (label) {
        trail.push({
          label,
          routerLink: ['/', ...url],
        });
      }
    }

    if (route.firstChild) {
      this.collect(route.firstChild, url, trail);
    }
  }
}
