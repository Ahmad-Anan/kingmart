import { Component, computed, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';

import { ISubCategory } from '../../../core/models/category';
import { CategoryService } from '../../../core/services/category/category';
import { ProductsService } from '../../../core/services/products/product';
import { TranslationKey } from '../../../core/i18n/en';
import { LanguageService } from '../../../core/services/language/language';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-sub-category',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './sub-category.html',
  styleUrl: './sub-category.css',
})
export class SubCategory {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly productsService = inject(ProductsService);
  private readonly languageService = inject(LanguageService);
  private readonly title = inject(Title);

  private readonly categoryUi = {
    computer: {
      icon: 'pi pi-desktop',
      badgeKey: 'subCategory.categoryUi.technologyBadge',
      descriptionKey: 'subCategory.categoryUi.technologyDescription',
    },
    electronics: {
      icon: 'pi pi-desktop',
      badgeKey: 'subCategory.categoryUi.technologyBadge',
      descriptionKey: 'subCategory.categoryUi.technologyDescription',
    },
    mobile: {
      icon: 'pi pi-mobile',
      badgeKey: 'subCategory.categoryUi.mobileBadge',
      descriptionKey: 'subCategory.categoryUi.mobileDescription',
    },
    phone: {
      icon: 'pi pi-mobile',
      badgeKey: 'subCategory.categoryUi.mobileBadge',
      descriptionKey: 'subCategory.categoryUi.mobileDescription',
    },
    clothing: {
      icon: 'pi pi-user',
      badgeKey: 'subCategory.categoryUi.fashionBadge',
      descriptionKey: 'subCategory.categoryUi.fashionDescription',
    },
    fashion: {
      icon: 'pi pi-user',
      badgeKey: 'subCategory.categoryUi.fashionBadge',
      descriptionKey: 'subCategory.categoryUi.fashionDescription',
    },
    bag: {
      icon: 'pi pi-shopping-bag',
      badgeKey: 'subCategory.categoryUi.accessoriesBadge',
      descriptionKey: 'subCategory.categoryUi.accessoriesDescription',
    },
    shoe: {
      icon: 'pi pi-shopping-cart',
      badgeKey: 'subCategory.categoryUi.footwearBadge',
      descriptionKey: 'subCategory.categoryUi.footwearDescription',
    },
    watch: {
      icon: 'pi pi-clock',
      badgeKey: 'subCategory.categoryUi.luxuryBadge',
      descriptionKey: 'subCategory.categoryUi.luxuryDescription',
    },
    beauty: {
      icon: 'pi pi-star',
      badgeKey: 'subCategory.categoryUi.beautyBadge',
      descriptionKey: 'subCategory.categoryUi.beautyDescription',
    },
    cosmetic: {
      icon: 'pi pi-star',
      badgeKey: 'subCategory.categoryUi.beautyBadge',
      descriptionKey: 'subCategory.categoryUi.beautyDescription',
    },
  } as const satisfies Record<string, { icon: string; badgeKey: TranslationKey; descriptionKey: TranslationKey }>;

  private readonly defaultCategoryUi = {
    icon: 'pi pi-tag',
    badgeKey: 'subCategory.categoryUi.defaultBadge' as TranslationKey,
  };

  private readonly paramMap = toSignal(this.route.paramMap);

  readonly categoryId = computed(() => this.paramMap()?.get('categoryId') ?? '');

  private readonly categoryResource = rxResource({
    params: () => {
      const id = this.categoryId();
      return id ? { id } : undefined;
    },
    stream: ({ params }) => this.categoryService.getCategory(params.id),
  });

  // ملاحظة مهمة:
  // إندبوينت /categories/:id/subcategories في الـ API العام
  // بيرجع نفس القايمة بغض النظر عن categoryId (باغ في الـ backend نفسه، تم
  // التأكد منه فعليًا: طلبين لفئتين مختلفتين رجعوا بنفس الـ subcategories).
  // الحل: نجيب كل الـ subcategories مرة واحدة، ونفلترهم إحنا محليًا
  // باستخدام حقل category الموجود فعليًا وبشكل صحيح داخل كل عنصر.
  private readonly allSubCategoriesResource = rxResource({
    stream: () => this.categoryService.getSubCategories(100, 1),
  });

  readonly category = computed(() => this.categoryResource.value()?.data);

  readonly categoryName = computed(() => this.category()?.name ?? '');

  /**
   * القايمة الأساسية: كل الـ Sub-Categories التابعة فعليًا لهذه الفئة
   * (قبل أي ترتيب حسب توفر المنتجات)
   */
  private readonly baseSubCategories = computed(() => {
    const categoryId = this.categoryId();
    const all = this.allSubCategoriesResource.value()?.data ?? [];

    return all.filter((sub) => sub.category === categoryId);
  });

  /**
   * لكل subcategory، نسأل الـ API عن عدد المنتجات فقط (limit: 1)
   * عشان نعرف نرتبها: اللي فيها منتجات الأول، واللي فاضية في الآخر.
   */
  private readonly subCategoriesAvailabilityResource = rxResource({
    params: () => {
      const subs = this.baseSubCategories();
      return subs.length ? { subs } : undefined;
    },
    stream: ({ params }) =>
      forkJoin(
        params.subs.map((sub) =>
          this.productsService
            .getProducts({ 'subcategory[in]': sub._id, limit: 1 })
            .pipe(map((res) => ({ sub, hasProducts: (res.results ?? 0) > 0 }))),
        ),
      ),
  });

  /**
   * القايمة النهائية المعروضة في الـ Template: مرتبة بحيث
   * الفئات الفرعية اللي فيها منتجات تظهر أولاً
   */
  readonly subCategories = computed(() => {
    const availability = this.subCategoriesAvailabilityResource.value();

    if (!availability) {
      return this.baseSubCategories();
    }

    return [...availability]
      .sort((a, b) => Number(b.hasProducts) - Number(a.hasProducts))
      .map((item) => item.sub);
  });

  readonly isLoading = computed(
    () =>
      this.allSubCategoriesResource.isLoading() ||
      this.subCategoriesAvailabilityResource.isLoading(),
  );

  readonly hasError = computed(
    () =>
      this.allSubCategoriesResource.error() !== undefined ||
      this.subCategoriesAvailabilityResource.error() !== undefined,
  );

  constructor() {
    effect(() => {
      const name = this.categoryName();

      this.title.setTitle(name ? `${name} | KingMart` : 'Collections | KingMart');
    });
  }

  getCategoryUi(name: string): { icon: string; badge: string; description: string } {
    const value = name.toLowerCase();
    const match = Object.entries(this.categoryUi).find(([keyword]) => value.includes(keyword))?.[1];

    if (match) {
      return {
        icon: match.icon,
        badge: this.languageService.translate(match.badgeKey),
        description: this.languageService.translate(match.descriptionKey),
      };
    }

    return {
      icon: this.defaultCategoryUi.icon,
      badge: this.languageService.translate(this.defaultCategoryUi.badgeKey),
      description: this.languageService.translate('subCategory.categoryUi.defaultDescription', {
        name,
      }),
    };
  }

  goToSubCategory(subCategory: ISubCategory): void {
    this.router.navigate(['/categories', this.categoryId(), subCategory._id, subCategory.slug]);
  }
}
