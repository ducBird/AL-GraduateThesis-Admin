import { ColumnsType } from "antd/es/table";
import { ISupplier } from "../../../interfaces/Supplier";

export const columnEmployees: ColumnsType<ISupplier> = [
  {
    title: "Name",
    dataIndex: "full_name",
    key: "full_name",
  },
  {
    title: "",
    dataIndex: "avatar",
    key: "avatar",
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
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Phone",
    dataIndex: "phone_number",
    key: "phone_number",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Năm sinh",
    dataIndex: "birth_day",
    key: "birth_day",
  },
];
