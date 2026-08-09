import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IBrand } from '../../../core/models/brand';
import { BrandsService } from '../../../core/services/Brands/brands';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';

const RELEVANT_BRAND_NAMES: readonly string[] = [];

@Component({
  selector: 'app-home-brands',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home-brand.html',
  styleUrl: './home-brand.css',
})
export class HomeBrands {
  private readonly brandsService = inject(BrandsService);

  protected readonly brandsResource = rxResource({
    stream: () => this.brandsService.getAllBrands({ limit: 30 }),
  });

  protected readonly filteredBrands = computed<IBrand[]>(() => {
    const brands = this.brandsResource.value()?.data ?? [];

    if (RELEVANT_BRAND_NAMES.length === 0) {
      return brands;
    }

    return brands.filter((brand) =>
      RELEVANT_BRAND_NAMES.some((name) => brand.name.toLowerCase().includes(name.toLowerCase())),
    );
  });
}
