import { Component, computed, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';

import { ISubCategory } from '../../../core/models/category';
import { CategoryService } from '../../../core/services/category/category';
import { ProductsService } from '../../../core/services/products/product';

@Component({
  selector: 'app-sub-category',
  standalone: true,
  imports: [],
  templateUrl: './sub-category.html',
  styleUrl: './sub-category.css',
})
export class SubCategory {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly productsService = inject(ProductsService);
  private readonly title = inject(Title);

  private readonly pageSize = 30;

  private readonly categoryUi = {
    computer: {
      icon: 'pi pi-desktop',
      badge: 'Technology',
      description: 'Explore the latest technology products and accessories.',
    },
    electronics: {
      icon: 'pi pi-desktop',
      badge: 'Technology',
      description: 'Explore the latest technology products and accessories.',
    },
    mobile: {
      icon: 'pi pi-mobile',
      badge: 'Mobile',
      description: 'Browse smartphones and premium mobile accessories.',
    },
    phone: {
      icon: 'pi pi-mobile',
      badge: 'Mobile',
      description: 'Browse smartphones and premium mobile accessories.',
    },
    clothing: {
      icon: 'pi pi-user',
      badge: 'Fashion',
      description: 'Discover premium fashion collections.',
    },
    fashion: {
      icon: 'pi pi-user',
      badge: 'Fashion',
      description: 'Discover premium fashion collections.',
    },
    bag: {
      icon: 'pi pi-shopping-bag',
      badge: 'Accessories',
      description: 'Browse elegant bags and luggage collections.',
    },
    shoe: {
      icon: 'pi pi-shopping-cart',
      badge: 'Footwear',
      description: 'Discover premium shoes for every occasion.',
    },
    watch: {
      icon: 'pi pi-clock',
      badge: 'Luxury',
      description: 'Discover premium watches and timeless designs.',
    },
    beauty: {
      icon: 'pi pi-star',
      badge: 'Beauty',
      description: 'Explore skincare and beauty essentials.',
    },
    cosmetic: {
      icon: 'pi pi-star',
      badge: 'Beauty',
      description: 'Explore skincare and beauty essentials.',
    },
  } as const;

  private readonly defaultCategoryUi = {
    icon: 'pi pi-tag',
    badge: 'Collection',
    description: 'Explore this collection.',
  } as const;

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

  getCategoryUi(name: string) {
    const value = name.toLowerCase();

    return (
      Object.entries(this.categoryUi).find(([keyword]) => value.includes(keyword))?.[1] ?? {
        ...this.defaultCategoryUi,
        description: `Explore ${name} collection.`,
      }
    );
  }

  goToSubCategory(subCategory: ISubCategory): void {
    this.router.navigate(['/categories', this.categoryId(), subCategory._id, subCategory.slug]);
  }
}
