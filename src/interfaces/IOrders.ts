import { IOrderDetail } from "./IOrderdetail";

export interface IOrders {
  _id?: object;
  status?: string;
  shipping_information?: string;
  email?: string;
  payment_status?: boolean;
  payment_information?: string;
  order_details?: IOrderDetail[] | undefined;
}
