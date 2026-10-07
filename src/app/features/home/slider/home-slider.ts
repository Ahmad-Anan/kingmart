import { IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { IHeroSlide } from '../../../core/models/hero-slide';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';
import { HERO_SLIDES } from './hero-slides.data';
import { SLIDER_SIZES, SLIDER_SRCSET, sliderImageLoader } from './slider-image';

interface SwiperElementWithInstance extends HTMLElement {
  initialize: () => void;
  swiper?: {
    realIndex: number;
    slideNext: () => void;
    slidePrev: () => void;
    autoplay?: { start: () => void; stop: () => void };
  };
}

@Component({
  selector: 'app-home-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, TranslatePipe],
  providers: [{ provide: IMAGE_LOADER, useValue: sliderImageLoader }],
  templateUrl: './home-slider.html',
  styleUrl: './home-slider.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeSlider {
  @ViewChild('heroSwiper', { static: true })
  private readonly swiperRef!: ElementRef<SwiperElementWithInstance>;

  private readonly destroyRef = inject(DestroyRef);

  protected readonly slides: readonly IHeroSlide[] = HERO_SLIDES;
  protected readonly srcset = SLIDER_SRCSET;
  protected readonly sizes = SLIDER_SIZES;

  // الشرايح اللي صورتها اترندرت — بنبدأ بالأولى بس (الـ LCP) وبنضيف الشريحة الحالية وجيرانها
  // مع كل حركة، فالصورة الجاية بتكون نزلت قبل ما الـ fade يبدأ
  protected readonly warmed = signal<ReadonlySet<number>>(new Set([0]));

  private destroyed = false;
  private autoplayTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // بنسجل الـ cleanup هنا بشكل متزامن: لو سجلناه جوه الـ .then() والمستخدم ساب الصفحة
    // قبل ما الـ chunk يخلص تحميل، Angular بيرمي NG0911 والـ timer بيفضل شغال
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      clearTimeout(this.autoplayTimer);
    });

    afterNextRender(() => {
      import('swiper/element/bundle').then(({ register }) => {
        if (this.destroyed) return;

        register();

        const swiperEl = this.swiperRef.nativeElement;

        Object.assign(swiperEl, {
          slidesPerView: 1,
          loop: true,
          speed: 850,
          effect: 'fade',
          fadeEffect: { crossFade: true },
          autoplay: {
            enabled: false,
            delay: 5500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
          keyboard: { enabled: true },
          a11y: { enabled: true },
          grabCursor: true,
          on: {
            // Swiper بيطلق slideChange على الشريحة 0 وقت الـ init — بنتجاهله عشان جيران الأولى
            // ميتحملوش وقت الـ LCP (الـ timer تحت بيجهزهم بعد ما الصفحة تهدى)
            slideChange: (swiper: { realIndex: number }) => {
              if (swiper.realIndex !== 0) this.warmAround(swiper.realIndex);
            },
          },
        });

        swiperEl.initialize();

        this.autoplayTimer = setTimeout(() => {
          // بعد ما الصفحة تكون اتحملت: نجهز الجيران (التالية للـ autoplay، والسابقة لزرار الرجوع)
          this.warmAround(swiperEl.swiper?.realIndex ?? 0);
          swiperEl.swiper?.autoplay?.start();
        }, 2000);
      });
    });
  }

  private warmAround(index: number): void {
    const count = this.slides.length;
    const wanted = [index, (index + 1) % count, (index - 1 + count) % count];
    if (wanted.every((i) => this.warmed().has(i))) return;
    this.warmed.update((set) => new Set([...set, ...wanted]));
  }

  protected slidePrev(): void {
    this.swiperRef.nativeElement.swiper?.slidePrev();
  }

  protected slideNext(): void {
    this.swiperRef.nativeElement.swiper?.slideNext();
  }
}
