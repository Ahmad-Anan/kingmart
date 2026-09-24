import { ComponentFixture, TestBed } from '@angular/core/testing';
import { flushPendingRequests } from '../../../../testing/flush-pending-requests';

import { SubCategory } from './sub-category';

describe('SubCategory', () => {
  let component: SubCategory;
  let fixture: ComponentFixture<SubCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(SubCategory);
    component = fixture.componentInstance;
    await flushPendingRequests(fixture);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
