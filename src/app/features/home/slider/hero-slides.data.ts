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
    eyebrow: 'Menswear',
    title: 'Cut with precision. Worn with quiet confidence.',
    subtitle: 'Structured tailoring for the discerning man.',
  },
  {
    id: 'slide-3',
    image: `${IMG_BASE}/3.png`,
    imageAlt: 'Emerald green evening gown in a grand hall',
    focalPosition: '85% 55%', // الفستان أقصى اليمين تقريباً
    eyebrow: 'Evening Wear',
    title: 'A single shade, endless presence.',
    subtitle: 'Statement gowns for defining moments.',
  },
  {
    id: 'slide-4',
    image: `${IMG_BASE}/4.png`,
    imageAlt: 'Brown leather oxford shoes on a wooden floor',
    focalPosition: '70% 65%', // الحذاء يمين-وسط، أسفل الصورة شوية
    eyebrow: 'Footwear',
    title: 'Built on craft. Finished by hand.',
    subtitle: 'Classic leather oxfords for every step.',
  },
  {
    id: 'slide-5',
    image: `${IMG_BASE}/5.png`,
    imageAlt: 'Black patent heels on a marble pedestal',
    focalPosition: '85% 65%', // أقصى اليمين تقريباً
    eyebrow: 'Footwear',
    title: 'Poise, one step at a time.',
    subtitle: 'Refined heels for the evening ahead.',
  },
  {
    id: 'slide-6',
    image: `${IMG_BASE}/6.png`,
    imageAlt: 'Diamond necklace displayed in a glass showcase',
    focalPosition: '80% 45%', // العلبة الزجاجية أقصى اليمين
    eyebrow: 'Fine Jewelry',
    title: 'Rare stones. Quiet brilliance.',
    subtitle: 'Pieces designed to be kept, not just worn.',
  },
  {
    id: 'slide-7',
    image: `${IMG_BASE}/7.png`,
    imageAlt: 'Luxury wristwatch and cufflinks in a display case',
    focalPosition: '75% 55%', // الساعة يمين-وسط
    eyebrow: 'Timepieces',
    title: 'Precision, worn on the wrist.',
    subtitle: 'Swiss mechanics meet timeless design.',
  },
  {
    id: 'slide-8',
    image: `${IMG_BASE}/8.png`,
    imageAlt: 'Private home cinema with leather recliners',
    focalPosition: '65% 60%', // المشهد ممتد لكن ثقله يمين-وسط
    eyebrow: 'Home & Living',
    title: 'A room built entirely around you.',
    subtitle: 'Private comfort, elevated design.',
  },
  {
    id: 'slide-9',
    image: `${IMG_BASE}/9.png`,
    imageAlt: 'Modern desk setup with laptop and monitor',
    focalPosition: '70% 55%', // الشاشة والابتوب يمين
    eyebrow: 'Workspace',
    title: 'Focus, framed by good design.',
    subtitle: 'Tools for a considered way of working.',
  },
  {
    id: 'slide-10',
    image: `${IMG_BASE}/10.png`,
    imageAlt: 'Smartphone and wireless earbuds on a wooden desk',
    focalPosition: '65% 60%', // الموبايل والسماعات يمين-وسط
    eyebrow: 'Everyday Carry',
    title: 'Small details. Considerable difference.',
    subtitle: 'Essentials chosen with intent.',
  },
];
