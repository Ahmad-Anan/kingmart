import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeBrand } from './home-brand';

describe('HomeBrand', () => {
  let component: HomeBrand;
  let fixture: ComponentFixture<HomeBrand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBrand],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeBrand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
