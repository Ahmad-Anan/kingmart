import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  // القيمة الابتدائية null تعني أن جميع القوائم مغلقة افتراضياً في الشاشات الصغيرة
  readonly openSection = signal<string | null>(null);

  // Signals محسوبة لمتابعة حالة كل قسم بشكل مباشر
  readonly isShopOpen = computed(() => this.openSection() === 'shop');
  readonly isAccountOpen = computed(() => this.openSection() === 'account');
  readonly isSupportOpen = computed(() => this.openSection() === 'support');

  /**
   * تبديل حالة الفتح والإغلاق للقوائم في الجوال
   */
  toggleSection(section: string): void {
    this.openSection.update((current) => (current === section ? null : section));
  }
}
