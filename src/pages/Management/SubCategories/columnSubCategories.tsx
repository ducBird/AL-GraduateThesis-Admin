import { ColumnsType } from "antd/es/table";
import { ISubCategory } from "../../../interfaces/SubCategory";

export const columnSubCategories: ColumnsType<ISubCategory> = [
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Danh mục",
    dataIndex: "category",
    key: "category",
    render: (text, record) => {
      return <strong>{record?.category?.name}</strong>;
    },
  },
];
