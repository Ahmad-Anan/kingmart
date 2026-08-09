import { inject, Pipe, PipeTransform } from '@angular/core';

import { TranslationKey } from '../../core/i18n/en';
import { LanguageService } from '../../core/services/language/language';

@Pipe({
  name: 't',
  // Impure on purpose: a pure pipe caches its result by argument identity and
  // never re-runs when LanguageService's locale signal changes elsewhere, so the
  // UI would silently freeze on the first-loaded language until a full reload.
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(
    key: TranslationKey | null | undefined,
    params?: Record<string, string | number>,
  ): string {
    if (!key) return '';
    return this.languageService.translate(key, params);
  }
}
