import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ICategory } from '../../core/models/category';
import { CategoryService } from '../../core/services/category/category';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  /**
   * يمكن تغييره مستقبلاً بسهولة
   */
  private readonly pageSize = 30;

  /**
   * جاهز لإضافة Pagination أو Infinite Scroll مستقبلاً
   */
  readonly currentPage = linkedSignal(() => 1);

  /**
   * Resource
   */
  private readonly categoriesResource = rxResource({
    defaultValue: {
      results: 0,
      metadata: {
        currentPage: 1,
        numberOfPages: 0,
        limit: this.pageSize,
      },
      data: [],
    },

    stream: ({}) => this.categoryService.getCategories(this.pageSize, this.currentPage()),
  });

  /**
   * Signals
   */
  readonly categories = computed(() => this.categoriesResource.value().data);

  readonly isLoading = computed(() => this.categoriesResource.isLoading());

  readonly hasError = computed(() => this.categoriesResource.error() !== undefined);

  constructor() {
    this.title.setTitle('Collections | KingMart');
  }

  /**
   * Navigation
   * متوافق مع:
   * categories/:categoryId
   */
  goToCategory(category: ICategory): void {
    this.router.navigate(['/categories', category._id]);
  }
}
