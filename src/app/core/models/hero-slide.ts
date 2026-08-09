import { TranslationKey } from '../i18n/en';

export interface IHeroSlide {
  id: string;
  image: string;
  imageAlt: string;
  focalPosition: string; // قيمة CSS object-position، مخصصة لكل صورة حسب مكان المنتج فيها
  // دول translation keys (مش نص إنجليزي مباشر) — بيتترجموا في home-slider.html عبر الـ `t` pipe
  eyebrowKey?: TranslationKey;
  titleKey?: TranslationKey;
  subtitleKey?: TranslationKey;
}
