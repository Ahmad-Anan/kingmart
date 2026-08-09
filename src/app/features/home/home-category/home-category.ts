import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category/category';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-home-categories',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home-category.html',
  styleUrl: './home-category.css',
})
export class HomeCategories {
  private readonly categoryService = inject(CategoryService);

  protected readonly categoriesResource = rxResource({
    stream: () => this.categoryService.getCategories(8, 1),
  });

  protected readonly skeletonPlaceholders = Array.from({ length: 6 });
}
