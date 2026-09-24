import { ComponentFixture, TestBed } from '@angular/core/testing';
import { flushPendingRequests } from '../../../../testing/flush-pending-requests';

import { HomeCategories } from './home-category';

describe('HomeCategories', () => {
  let component: HomeCategories;
  let fixture: ComponentFixture<HomeCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeCategories);
    component = fixture.componentInstance;
    await flushPendingRequests(fixture);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
