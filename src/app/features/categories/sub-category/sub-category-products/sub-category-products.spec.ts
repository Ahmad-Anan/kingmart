import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubCategoryProducts } from './sub-category-products';

describe('SubCategoryProducts', () => {
  let component: SubCategoryProducts;
  let fixture: ComponentFixture<SubCategoryProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubCategoryProducts],
    }).compileComponents();

    fixture = TestBed.createComponent(SubCategoryProducts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
