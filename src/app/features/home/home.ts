import { Component } from '@angular/core';
import { HomeBrands } from './home-brand/home-brand';
import { HomeCategories } from './home-category/home-category';
import { HomeProduct } from './home-product/home-product';
import { HomeSlider } from './slider/home-slider';

@Component({
  selector: 'app-home',
  imports: [HomeSlider, HomeCategories, HomeProduct, HomeBrands],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
