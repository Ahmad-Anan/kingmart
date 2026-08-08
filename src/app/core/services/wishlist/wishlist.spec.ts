import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IProduct } from '../../models/product';
import { IWishlistIdsResponse, IWishlistResponse } from '../../models/wishlist';
import { WishlistService } from './wishlist';

function fakeProduct(id: string): IProduct {
  return {
    _id: id,
    id,
    title: `Product ${id}`,
    slug: `product-${id}`,
    description: 'desc',
    price: 100,
    quantity: 10,
    sold: 1,
    ratingsAverage: 4,
    ratingsQuantity: 1,
    imageCover: 'cover.jpg',
    images: ['cover.jpg'],
    category: {
      _id: 'cat1',
      name: 'Category',
      slug: 'category',
      image: 'cat.jpg',
      createdAt: '',
      updatedAt: '',
    },
    subcategory: [],
    brand: {
      _id: 'brand1',
      name: 'Brand',
      slug: 'brand',
      image: 'brand.jpg',
      createdAt: '',
      updatedAt: '',
    },
    createdAt: '',
    updatedAt: '',
  };
}

describe('WishlistService', () => {
  let service: WishlistService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WishlistService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('removes the deleted product from wishlistData immediately, without a fresh GET', () => {
    // 1. حمّل السلة بمنتجين، زي ما بيحصل لما اليوزر يفتح /wishlist
    service.getLoggedUserWishlist().subscribe();
    const getReq = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/wishlist'));
    getReq.flush({
      status: 'success',
      count: 2,
      data: [fakeProduct('p1'), fakeProduct('p2')],
    } satisfies IWishlistResponse);

    expect(service.wishlistData()?.data.map((p) => p._id)).toEqual(['p1', 'p2']);
    expect(service.isInWishlist('p1')).toBe(true);

    // 2. احذف p1 — الـ DELETE response بيرجع IDs بس (نفس شكل الـ API الحقيقي المؤكد)
    service.removeProductFromWishlist('p1').subscribe();
    const deleteReq = httpMock.expectOne(
      (req) => req.method === 'DELETE' && req.url.endsWith('/wishlist/p1'),
    );
    deleteReq.flush({
      status: 'success',
      message: 'Product removed successfully from your wishlist',
      data: ['p2'],
    } satisfies IWishlistIdsResponse);

    // 3. من غير أي GET تاني، wishlistData المفروض يبقى فيها p2 بس
    expect(service.wishlistData()?.count).toBe(1);
    expect(service.wishlistData()?.data.map((p) => p._id)).toEqual(['p2']);
    expect(service.isInWishlist('p1')).toBe(false);
    expect(service.isInWishlist('p2')).toBe(true);
  });
});
