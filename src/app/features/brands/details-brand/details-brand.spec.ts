import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsBrand } from './details-brand';

describe('DetailsBrand', () => {
  let component: DetailsBrand;
  let fixture: ComponentFixture<DetailsBrand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsBrand],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsBrand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
