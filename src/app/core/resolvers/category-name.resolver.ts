import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';

import { CategoryService } from '../services/category/category';

/**
 * بيجيب اسم الفئة الحقيقي من الـ API قبل ما الصفحة تترندر،
 * وبيحطه في route.data['categoryName'] عشان الـ BreadcrumbService يقدر يقراه.
 */
export const categoryNameResolver: ResolveFn<string> = (route) => {
  const categoryService = inject(CategoryService);
  const categoryId = route.paramMap.get('categoryId') ?? '';

  return categoryService.getCategory(categoryId).pipe(map((res) => res.data.name));
};
