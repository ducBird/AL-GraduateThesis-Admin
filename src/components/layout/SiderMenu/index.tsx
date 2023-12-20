import React, { useEffect, useState } from "react";
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
import { Badge, Menu } from "antd";
import { useUser } from "../../../hooks/useUser";
import { axiosClient } from "../../../libraries/axiosClient";

export default function SiderMenu() {
  const { users } = useUser((state) => state) as any;
  const navigate = useNavigate();
  const [dataOrders, setDataOrders] = useState(0);
  useEffect(() => {
    axiosClient
      .get("/orders")
      .then((response) => {
        const unapprovedOrder = response.data.filter(
          (data: any) => data.employee_id === null
        );
        setDataOrders(unapprovedOrder.length);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
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
          label: (
            <span>
              Đơn hàng <Badge count={dataOrders}></Badge>
            </span>
          ),
          key: "sales-orders",
          icon: <MdOutlineArticle />,
        },

        {
          label: "Tích lũy tiền",
          key: "management-accumulated",
          icon: <RiLuggageDepositLine />,
        },
        {
          label: "Vouchers",
          key: "management-vouchers",
          icon: <AiOutlineShopping />,
        },
      ],
    },
    {
      label: "Quản Lý Bán Hàng",
      key: "sales",
      icon: <AiOutlineDatabase />,
      children: [
        {
          label: "Thống kê",
          key: "sales-statistics",
          icon: <MdOutlineArticle />,
          children: [
            {
              label: "Đơn hàng",
              key: "sales-statistics-orders",
              icon: <MdOutlineArticle />,
              children: [
                {
                  label: "Tất cả đơn hàng",
                  key: "sales-statistics-orders-all",
                },
                {
                  label: "Theo trạng thái",
                  key: "sales-orders-by-status",
                },
                {
                  label: "Theo hình thức thanh toán",
                  key: "sales-orders-by-payment_information",
                },
                {
                  label: "Theo trạng thái thanh toán",
                  key: "sales-orders-by-payment_status",
                },
                // {
                //   label: "Theo số điện thoại",
                //   key: "sales-statistics-orders-number",
                // },
              ],
            },
            // {
            //   label: "Sản phẩm",
            //   key: "sales-statistics-products",
            //   icon: <AiOutlineShopping />,
            // },
            // {
            //   label: "Khách hàng",
            //   key: "sales-statistics-customers",
            //   icon: <MdOutlinePeopleAlt />,
            // },
          ],
        },
      ],
    },
    { label: "Cài Đặt", key: "settings", icon: <AiOutlineSetting /> }, // which is required
  ];
  const itemsSiderShipper = [
    {
      label: "Quản lý vận chuyển",
      key: "shipping",
      icon: <FaShippingFast />,
      children: [
        { label: "Đơn mua", key: "shipping-purchase" },
        // {
        //   label: "Đơn trả",
        //   key: "shipping-return",
        // },
      ],
    },
  ];
  const itemsSiderAdmin = [
    { label: "Trang Chủ", key: "home", icon: <AiOutlineHome /> }, // remember to pass the key prop
    {
      label: "Quản Trị",
      key: "management",
      icon: <MdOutlineManageAccounts />,
      children: [
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
      ],
    },
    { label: "Cài Đặt", key: "settings", icon: <AiOutlineSetting /> }, // which is required
  ];
  return (
    <div>
      <Menu
        items={
          users.user.roles === "admin"
            ? itemsSiderAdmin
            : users.user.roles === "sales"
            ? itemsSider
            : itemsSiderShipper
        }
        mode="inline"
        onClick={({ item, key }) => {
          navigate("/" + key.split("-").join("/")); //
        }}
      />
    </div>
  );
}
