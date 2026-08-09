import { IHeroSlide } from '../../../core/models/hero-slide';

const IMG_BASE = 'assets/images/img-slider';

export const HERO_SLIDES: readonly IHeroSlide[] = [
  {
    id: 'slide-0',
    image: `${IMG_BASE}/0.png`,
    imageAlt: 'A couple in elegant evening wear inside a luxury venue',
    focalPosition: '50% 35%', // الزوجين في المنتصف، الرأس أعلى شوية من نص الصورة
  },
  {
    id: 'slide-1',
    image: `${IMG_BASE}/1.png`,
    imageAlt: 'Formal tuxedo and evening gown displayed in a marble hall',
    focalPosition: '65% 45%', // موزعين شمال ويمين، مركز الثقل أقرب لليمين شوية
  },
  {
    id: 'slide-2',
    image: `${IMG_BASE}/2.png`,
    imageAlt: 'Tailored black suit on a wooden valet stand',
    focalPosition: '75% 40%', // البدلة أقصى اليمين، الشمال فاضي بالكامل
    eyebrowKey: 'home.slider.slide2.eyebrow',
    titleKey: 'home.slider.slide2.title',
    subtitleKey: 'home.slider.slide2.subtitle',
  },
  {
    id: 'slide-3',
    image: `${IMG_BASE}/3.png`,
    imageAlt: 'Emerald green evening gown in a grand hall',
    focalPosition: '85% 55%', // الفستان أقصى اليمين تقريباً
    eyebrowKey: 'home.slider.slide3.eyebrow',
    titleKey: 'home.slider.slide3.title',
    subtitleKey: 'home.slider.slide3.subtitle',
  },
  {
    id: 'slide-4',
    image: `${IMG_BASE}/4.png`,
    imageAlt: 'Brown leather oxford shoes on a wooden floor',
    focalPosition: '70% 65%', // الحذاء يمين-وسط، أسفل الصورة شوية
    eyebrowKey: 'home.slider.slide4.eyebrow',
    titleKey: 'home.slider.slide4.title',
    subtitleKey: 'home.slider.slide4.subtitle',
  },
  {
    id: 'slide-5',
    image: `${IMG_BASE}/5.png`,
    imageAlt: 'Black patent heels on a marble pedestal',
    focalPosition: '85% 65%', // أقصى اليمين تقريباً
    eyebrowKey: 'home.slider.slide5.eyebrow',
    titleKey: 'home.slider.slide5.title',
    subtitleKey: 'home.slider.slide5.subtitle',
  },
  {
    id: 'slide-6',
    image: `${IMG_BASE}/6.png`,
    imageAlt: 'Diamond necklace displayed in a glass showcase',
    focalPosition: '80% 45%', // العلبة الزجاجية أقصى اليمين
    eyebrowKey: 'home.slider.slide6.eyebrow',
    titleKey: 'home.slider.slide6.title',
    subtitleKey: 'home.slider.slide6.subtitle',
  },
  {
    id: 'slide-7',
    image: `${IMG_BASE}/7.png`,
    imageAlt: 'Luxury wristwatch and cufflinks in a display case',
    focalPosition: '75% 55%', // الساعة يمين-وسط
    eyebrowKey: 'home.slider.slide7.eyebrow',
    titleKey: 'home.slider.slide7.title',
    subtitleKey: 'home.slider.slide7.subtitle',
  },
  {
    id: 'slide-8',
    image: `${IMG_BASE}/8.png`,
    imageAlt: 'Private home cinema with leather recliners',
    focalPosition: '65% 60%', // المشهد ممتد لكن ثقله يمين-وسط
    eyebrowKey: 'home.slider.slide8.eyebrow',
    titleKey: 'home.slider.slide8.title',
    subtitleKey: 'home.slider.slide8.subtitle',
  },
  {
    id: 'slide-9',
    image: `${IMG_BASE}/9.png`,
    imageAlt: 'Modern desk setup with laptop and monitor',
    focalPosition: '70% 55%', // الشاشة والابتوب يمين
    eyebrowKey: 'home.slider.slide9.eyebrow',
    titleKey: 'home.slider.slide9.title',
    subtitleKey: 'home.slider.slide9.subtitle',
  },
  {
    id: 'slide-10',
    image: `${IMG_BASE}/10.png`,
    imageAlt: 'Smartphone and wireless earbuds on a wooden desk',
    focalPosition: '65% 60%', // الموبايل والسماعات يمين-وسط
    eyebrowKey: 'home.slider.slide10.eyebrow',
    titleKey: 'home.slider.slide10.title',
    subtitleKey: 'home.slider.slide10.subtitle',
  },
];
