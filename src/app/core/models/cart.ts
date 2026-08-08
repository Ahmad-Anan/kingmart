// cart.interface.ts

export interface IAddToCartResponse {
  status: string;
  message: string;
  numOfCartItems: number;
  cartId: string;
}

export interface ICartProduct {
  count: number;
  _id: string;
  product: {
    _id: string;
    title: string;
    imageCover: string;
    category: string;
    brand: string;
    ratingsAverage: number;
    price: number;
  };
  price: number;
}

export interface ICartResponse {
  status: string;
  numOfCartItems: number;
  cartId: string;
  data: {
    _id: string;
    cartOwner: string;
    products: ICartProduct[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    totalCartPrice: number;
  };
}
