export interface IImage {
  _id?: string;
  src?: string;
  position?: number;
}

export interface IOption {
  _id?: object;
  value?: string;
  add_valuation?: number;
  inventory_quantity?: number;
  images?: [IImage];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVariant {
  _id?: object;
  title?: string;
  price_adjustment?: number;
  position?: number;
  options: [IOption];
  product_id?: number;
  is_delete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
