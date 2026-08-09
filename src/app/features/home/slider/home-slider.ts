import {
  afterNextRender,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { IHeroSlide } from '../../../core/models/hero-slide';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';
import { HERO_SLIDES } from './hero-slides.data';

interface SwiperElementWithInstance extends HTMLElement {
  initialize: () => void;
  swiper?: {
    slideNext: () => void;
    slidePrev: () => void;
    autoplay?: { start: () => void; stop: () => void };
  };
}

@Component({
  selector: 'app-home-slider',
  imports: [TranslatePipe],
  templateUrl: './home-slider.html',
  styleUrl: './home-slider.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeSlider {
  @ViewChild('heroSwiper', { static: true })
  private readonly swiperRef!: ElementRef<SwiperElementWithInstance>;

  private readonly destroyRef = inject(DestroyRef);

  protected readonly slides: readonly IHeroSlide[] = HERO_SLIDES;

  constructor() {
    afterNextRender(() => {
      import('swiper/element/bundle').then(({ register }) => {
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
        });

        swiperEl.initialize();

        const autoplayTimer = setTimeout(() => {
          swiperEl.swiper?.autoplay?.start();
        }, 2000);

        this.destroyRef.onDestroy(() => clearTimeout(autoplayTimer));
      });
    });
  }

  protected slidePrev(): void {
    this.swiperRef.nativeElement.swiper?.slidePrev();
  }

  protected slideNext(): void {
    this.swiperRef.nativeElement.swiper?.slideNext();
  }
}
