import { IOrderDetail } from "./IOrderdetail";

export interface IOrders {
  _id?: object;
  first_name?: string;
  last_name?: string;
  phoneNumber?: string;
  status?: string;
  shipping_address?: string;
  payment_status?: boolean;
  payment_information?: string;
  order_details?: IOrderDetail[] | undefined;
  total_money_order: number;
  createdAt: string;
}
