export interface IVouchers {
  _id: object;
  name: string;
  price: number;
  discountPercentage: number;
  maxDiscountAmount: number;
  minimumOrderAmount: number;
  condition: string;
  startDate: Date;
  expirationDate: Date;
  isActive: boolean;
  isFreeShipping: boolean;
}
