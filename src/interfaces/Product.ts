import { ICategory } from "./Category";
import { ISubCategory } from "./SubCategory";
export interface Attribute {
  _id: object;
  attribute_name: string;
  values: string[];
}

export interface IProduct {
  _id?: object;
  name?: string;
  discount?: number;
  product_image?: string;
  description?: string;
  sort_order?: number;
  category?: ICategory;
  categoryName?: string;
  subCategory?: string;
  sub_category?: ISubCategory;
  is_delete?: boolean;
  date_of_manufacture?: Date;
  expiration_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  variants?: [object];
  attributes?: [object];
}
