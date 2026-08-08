export interface IShippingAddress {
  details: string;
  phone: string;
  city: string;
}

// مختلفة عن ICartProduct بتاعة السلة الحية — الـ order snapshot بيرجع category
// كـ object فيه name (مؤكد من console log حقيقي)، مش ID كـ string زي الـ cart endpoint
export interface IOrderCartItem {
  count: number;
  _id: string;
  product: {
    _id: string;
    title: string;
    imageCover: string;
    category: { _id: string; name: string };
    brand: string;
    ratingsAverage: number;
    price: number;
  };
  price: number;
}

export interface IOrder {
  _id: string;
  id: string;
  user: string;
  cartItems: IOrderCartItem[];
  taxPrice: number;
  shippingAddress: IShippingAddress;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: string;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCashOrderRequest {
  shippingAddress: IShippingAddress;
}

// نفس شكل ICartResponse على نفس الـ backend: { status, data: {...} }
export interface ICreateCashOrderResponse {
  status: string;
  data: IOrder;
}

export interface ICheckoutSessionResponse {
  status: string;
  session: {
    id: string;
    url: string;
  };
}
