import { ComponentFixture, TestBed } from '@angular/core/testing';
import { flushPendingRequests } from '../../../testing/flush-pending-requests';

import { Reviews } from './reviews';

describe('Reviews', () => {
  let component: Reviews;
  let fixture: ComponentFixture<Reviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reviews],
    }).compileComponents();

    fixture = TestBed.createComponent(Reviews);
    fixture.componentRef.setInput('productId', 'product-1');
    component = fixture.componentInstance;
    await flushPendingRequests(fixture);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
