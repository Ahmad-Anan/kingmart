import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  EMPTY_LIST_RESPONSE,
  flushPendingRequests,
} from '../../../../testing/flush-pending-requests';

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

describe('HomeBrands pause toggle', () => {
  let fixture: ComponentFixture<HomeBrands>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBrands],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeBrands);
    // محتاجين براند واحد على الأقل عشان الشريط والزرار يظهروا
    await flushPendingRequests(fixture, {
      ...EMPTY_LIST_RESPONSE,
      results: 1,
      data: [{ _id: 'b1', name: 'Canon', slug: 'canon', image: 'https://example.com/canon.png' }],
    });
    await fixture.whenStable();
  });

  it('pauses and resumes the marquee', async () => {
    const host: HTMLElement = fixture.nativeElement;
    const button = host.querySelector<HTMLButtonElement>('.brands-toggle')!;
    const track = host.querySelector('.brands-marquee-track')!;

    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBeTruthy();
    expect(track.classList.contains('is-paused')).toBe(false);

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(track.classList.contains('is-paused')).toBe(true);

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(track.classList.contains('is-paused')).toBe(false);
  });
});
