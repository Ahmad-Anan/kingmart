import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

/*
  اسم الكلاس ده لازم يفضل مطابق تمامًا لقيمتين تانيين في المشروع:
  1. darkModeSelector: '.my-app-dark' في providePrimeNG (app.config.ts)
  2. @custom-variant dark (&:where(.my-app-dark, .my-app-dark *)); في styles.css
  لو غيرت أي واحدة من التلاتة لازم تغير الباقي معاها.
*/
const DARK_MODE_CLASS = 'my-app-dark';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const isDark = this.isDarkMode();
      this.applyTheme(isDark);
    });
  }

  // 🟢 هنا يتم إضافة التحديث الجديد للـ View Transitions
  toggleTheme(): void {
    if (!this.isBrowser) return;

    // فحص دعم المتصفح للـ View Transitions API (مثل Chrome, Edge, Safari الحديثة)
    if ('startViewTransition' in this.document) {
      (this.document as any).startViewTransition(() => {
        this.isDarkMode.update((prev) => !prev);
      });
    } else {
      // fallback للمتصفحات القديمة
      this.isDarkMode.update((prev) => !prev);
    }
  }

  private applyTheme(isDark: boolean): void {
    if (!this.isBrowser) return;

    const htmlElement = this.document.documentElement;

    if (isDark) {
      htmlElement.classList.add(DARK_MODE_CLASS);
      localStorage.setItem('app-theme', 'dark');
    } else {
      htmlElement.classList.remove(DARK_MODE_CLASS);
      localStorage.setItem('app-theme', 'light');
    }
  }

  private getInitialTheme(): boolean {
    if (!this.isBrowser) return false;

    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
