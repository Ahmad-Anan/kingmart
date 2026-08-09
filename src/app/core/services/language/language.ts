import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, effect, inject, PLATFORM_ID, Service, signal } from '@angular/core';

import { ar } from '../../i18n/ar';
import { en, TranslationKey } from '../../i18n/en';

export type Locale = 'en' | 'ar';

const LOCALE_KEY = 'app-locale';

@Service()
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly locale = signal<Locale>(this.getInitialLocale());

  constructor() {
    effect(() => {
      this.applyLocale(this.locale());
    });
  }

  toggleLocale(): void {
    this.locale.update((prev) => (prev === 'en' ? 'ar' : 'en'));
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
  }

  translate(key: TranslationKey, params?: Record<string, string | number>): string {
    const dictionary = this.locale() === 'ar' ? ar : en;

    const raw = key
      .split('.')
      .reduce<unknown>(
        (acc, segment) =>
          acc && typeof acc === 'object' && segment in acc
            ? (acc as Record<string, unknown>)[segment]
            : undefined,
        dictionary,
      );

    let text = typeof raw === 'string' ? raw : key;

    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        text = text.replaceAll(`{${paramKey}}`, String(value));
      }
    }

    return text;
  }

  private applyLocale(locale: Locale): void {
    if (!this.isBrowser) return;

    const html = this.document.documentElement;
    html.lang = locale;
    html.dir = locale === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LOCALE_KEY, locale);
  }

  private getInitialLocale(): Locale {
    if (!this.isBrowser) return 'en';

    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === 'en' || saved === 'ar') return saved;

    return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
  }
}
