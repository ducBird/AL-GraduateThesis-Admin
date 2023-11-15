import { IProduct } from "./Product";

export interface IOrderDetail {
  product_id: string;
  quantity: number;
  product: IProduct[];
}
