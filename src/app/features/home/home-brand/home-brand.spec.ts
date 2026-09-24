import { ComponentFixture, TestBed } from '@angular/core/testing';
import { flushPendingRequests } from '../../../../testing/flush-pending-requests';

import { HomeBrands } from './home-brand';

describe('HomeBrands', () => {
  let component: HomeBrands;
  let fixture: ComponentFixture<HomeBrands>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBrands],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeBrands);
    component = fixture.componentInstance;
    await flushPendingRequests(fixture);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
