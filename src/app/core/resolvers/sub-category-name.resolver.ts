import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';

import { CategoryService } from '../services/category/category';

/**
 * بيجيب اسم الفئة الفرعية الحقيقي من الـ API قبل ما الصفحة تترندر،
 * وبيحطه في route.data['subCategoryName'] عشان الـ BreadcrumbService يقدر يقراه.
 */
export const subCategoryNameResolver: ResolveFn<string> = (route) => {
  const categoryService = inject(CategoryService);
  const subCategoryId = route.paramMap.get('subCategoryId') ?? '';

  return categoryService.getSubCategory(subCategoryId).pipe(map((res) => res.data.name));
};
