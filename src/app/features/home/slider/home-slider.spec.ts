import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeSlider } from './home-slider';

describe('HomeSlider', () => {
  let component: HomeSlider;
  let fixture: ComponentFixture<HomeSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeSlider],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeSlider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
