export interface IAddress {
  _id: string;
  name: string;
  details: string;
  phone: string;
  city: string;
}

export interface IAddAddressRequest {
  name: string;
  details: string;
  phone: string;
  city: string;
}

export interface IAddressesResponse {
  status: string;
  results: number;
  data: IAddress[];
}

// POST/DELETE بيرجعوا نفس شكل الـ GET (مصفوفة العناوين الحالية كاملة)، مطابق
// لسلوك /wishlist المؤكد على نفس الـ backend ده
export interface IAddressMutationResponse {
  status: string;
  message: string;
  data: IAddress[];
}

export interface ISingleAddressResponse {
  status: string;
  data: IAddress;
}
