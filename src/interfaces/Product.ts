import { ICategory } from "./Category";
import { ISubCategory } from "./SubCategory";
import { ISupplier } from "./Supplier";

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
  supplier?: ISupplier;
  variants?: [object];
  is_delete?: boolean;
  date_of_manufacture?: Date;
  expiration_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
