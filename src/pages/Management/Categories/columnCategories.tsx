import type { ColumnType, ColumnsType } from "antd/es/table";
import { ICategory } from "../../../interfaces/Category";
export const columnCategories: ColumnsType<ICategory> = [
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
  },
  {
    dataIndex: "image_url",
    key: "image_url",
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
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "Ngày sửa",
    dataIndex: "updatedAt",
    key: "updatedAt",
  },
];
