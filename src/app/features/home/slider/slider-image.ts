import { ImageLoaderConfig } from '@angular/common';

// المقاسات اللي بيولدها scripts/optimize-slider-images.mjs — لازم يفضلوا متطابقين
export const SLIDER_WIDTHS = [640, 960, 1280, 1376] as const;
const MAX_WIDTH = SLIDER_WIDTHS[SLIDER_WIDTHS.length - 1];

export const SLIDER_SRCSET = SLIDER_WIDTHS.map((w) => `${w}w`).join(', ');

// الهيرو full-bleed و object-cover بارتفاع 340–560px والصور نسبتها ~1.83:1.
// في الموبايل الصورة محكومة بالارتفاع فبتتعرض بعرض ~620–700px أوسع من الشاشة نفسها،
// فلو قلنا 100vw المتصفح هيختار نسخة أصغر من اللازم وتطلع مغبشة
export const SLIDER_SIZES = '(max-width: 639px) 700px, (max-width: 899px) 880px, 100vw';

// `src` في بيانات السلايدر هو المسار من غير امتداد ولا مقاس (مثلاً assets/images/img-slider/0)
export function sliderImageLoader({ src, width }: ImageLoaderConfig): string {
  return `${src}-${width ?? MAX_WIDTH}.webp`;
}
