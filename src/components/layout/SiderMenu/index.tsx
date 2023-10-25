import {
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineShopping,
  AiOutlineDatabase,
  AiOutlineDiff,
} from "react-icons/ai";
import {
  MdOutlineSupportAgent,
  MdOutlinePeopleAlt,
  MdOutlineArticle,
  MdOutlineManageAccounts,
  MdOutlineCategory,
} from "react-icons/md";
import { FaWarehouse } from "react-icons/fa";
import { FaShippingFast } from "react-icons/fa";
import { RiLuggageDepositLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { Menu } from "antd";

export default function SiderMenu() {
  const navigate = useNavigate();
  const itemsSider = [
    { label: "Trang Chủ", key: "home", icon: <AiOutlineHome /> }, // remember to pass the key prop
    {
      label: "Quản Trị",
      key: "management",
      icon: <MdOutlineManageAccounts />,
      children: [
        {
          label: "Danh mục",
          key: "management-categories",
          icon: <MdOutlineCategory />,
        },
        {
          label: "Danh mục con",
          key: "management-subCategories",
          icon: <AiOutlineDiff />,
        },
        {
          label: "Sản phẩm",
          key: "management-products",
          icon: <AiOutlineShopping />,
        },
        {
          label: "Khách hàng",
          key: "management-customers",
          icon: <MdOutlinePeopleAlt />,
        },
        {
          label: "Nhân viên",
          key: "management-employees",
          icon: <MdOutlineSupportAgent />,
        },
        { label: "Đơn hàng", key: "sales-orders", icon: <MdOutlineArticle /> },

        {
          label: "Tích lũy tiền",
          key: "management-accumulated",
          icon: <RiLuggageDepositLine />,
        },
        // {
        //   label: "Nhà cung cấp",
        //   key: "management-suppliers",
        //   icon: <RiLuggageDepositLine />,
        // },
      ],
    },
    {
      label: "Quản Lý Bán Hàng",
      key: "sales",
      icon: <AiOutlineDatabase />,
      children: [
        {
          label: "Thống kê",
          key: "orders",
          icon: <MdOutlineArticle />,
          children: [
            {
              label: "Theo trạng thái đơn hàng",
              key: "orders-status",
            },
            {
              label: "Theo hình thức thanh toán",
              key: "orders-payment",
            },
            {
              label: "Theo số điện thoại",
              key: "orders-number",
            },
            {
              label: "Theo ngày cần tìm",
              key: "orders-day",
            },
          ],
        },
      ],
    },
    {
      label: "Quản lý vận chuyển",
      key: "shipping",
      icon: <FaShippingFast />,
      children: [
        { label: "Chưa vận chuyển", key: "orders-notshipped" },
        {
          label: "Đang vận chuyển",
          key: "orders-shipping",
        },
        {
          label: "Đã vận chuyển",
          key: "orders-shipped",
        },
      ],
    },
    // {
    //   label: "Quản lý kho",
    //   key: "warehouse",
    //   icon: <FaWarehouse />,
    //   children: [
    //     {
    //       label: "Đơn hàng đang đợi vận chuyển",
    //       key: "warehouse-shipping",
    //     },
    //   ],
    // },
    { label: "Cài Đặt", key: "settings", icon: <AiOutlineSetting /> }, // which is required
  ];
  const itemsSiderShipper = [
    {
      label: "Quản lý vận chuyển",
      key: "shipping",
      icon: <FaShippingFast />,
      children: [
        { label: "Chưa vận chuyển", key: "orders-notshipped" },
        {
          label: "Đang vận chuyển",
          key: "orders-shipping",
        },
        {
          label: "Đã vận chuyển",
          key: "orders-shipped",
        },
      ],
    },
  ];
  const itemsSiderWarehouse = [
    {
      label: "Quản lý kho",
      key: "warehouse",
      icon: <FaWarehouse />,
      children: [
        {
          label: "Đơn hàng vận chuyển",
          key: "warehouse-shipping",
        },
      ],
    },
  ];
  return (
    <div>
      <Menu
        items={itemsSider}
        mode="inline"
        onClick={({ item, key }) => {
          navigate("/" + key.split("-").join("/")); //
        }}
      />
    </div>
  );
}
