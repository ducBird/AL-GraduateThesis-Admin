import { ColumnsType } from "antd/es/table";
import { IProduct } from "../../../interfaces/Product";

export const columnProducts: ColumnsType<IProduct> = [
  {
    title: "Danh mục",
    dataIndex: "category",
    key: "category",
    render: (text, record) => {
      return <strong>{record?.category?.name}</strong>;
    },
  },
  {
    title: "Danh mục con",
    dataIndex: "sub_category",
    key: "sub_category",
    render: (text, record) => {
      return <strong>{record?.sub_category?.name}</strong>;
    },
  },
  {
    dataIndex: "product_image",
    key: "product_image",
    width: "20%",
    render: (text) => {
      return (
        <div style={{ textAlign: "center" }}>
          {text && (
            <img
              style={{ maxWidth: 150, width: "30%", minWidth: 70 }}
              src={`${text}`}
              alt="image_category"
            />
          )}
        </div>
      );
    },
  },
  {
    title: "Tên sản phẩm",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Giảm giá",
    dataIndex: "discount",
    key: "discount",
    render: (text) => {
      return <div>{text}%</div>;
    },
  },
];
