import { inject, Pipe, PipeTransform } from '@angular/core';

import { Locale, LanguageService } from '../../core/services/language/language';

// أسعار الـ Route API كلها بالجنيه المصري. الأرقام لاتيني في العربي كمان (-u-nu-latn)
// عشان تفضل متسقة مع باقي الأرقام في الموقع: "EGP 19,199" / "19,199 ج.م."
const FORMATTERS: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'EGP',
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }),
  ar: new Intl.NumberFormat('ar-EG-u-nu-latn', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }),
};

export function formatPrice(value: number, locale: Locale): string {
  return FORMATTERS[locale].format(value);
}

@Pipe({
  name: 'price',
  // Impure for the same reason as TranslatePipe: it must re-run when the locale signal changes.
  pure: false,
})
export class PricePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '';
    return formatPrice(value, this.languageService.locale());
  }
}
