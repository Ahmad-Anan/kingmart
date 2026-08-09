import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IBrand } from '../../core/models/brand';
import { BrandsService } from '../../core/services/Brands/brands';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-brands',
  imports: [TranslatePipe],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
})
export class Brands {
  private readonly brandsService = inject(BrandsService);
  private readonly router = inject(Router);

  readonly brandsResource = rxResource({
    stream: () => this.brandsService.getAllBrands({ limit: 40 }),
  });

  readonly brands = computed(() => this.brandsResource.value()?.data ?? []);

  onBrandClick(brand: IBrand): void {
    this.router.navigate(['/shop'], { queryParams: { brand: brand._id } });
  }
}
