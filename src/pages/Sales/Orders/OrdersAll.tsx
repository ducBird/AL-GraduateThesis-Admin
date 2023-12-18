import {
  Button,
  DatePicker,
  Form,
  Select,
  Table,
  message,
  Modal,
  Tag,
} from "antd";
import numeral from "numeral";
import React, { useEffect } from "react";
import { axiosClient } from "../../../libraries/axiosClient";
import locale from "antd/lib/date-picker/locale/vi_VN";
import { IOrders } from "../../../interfaces/IOrders";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ExcelJS from "exceljs";
import { PieChart, Pie, Legend, Tooltip, Cell, Label } from "recharts";
import {
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckSquareFilled,
  ClockCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  RollbackOutlined,
  SelectOutlined,
} from "@ant-design/icons";
function OrdersAll() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [orders, setOrders] = React.useState<IOrders[]>([]);
  const [searchForm] = Form.useForm();
  const [oderValue, setOrderValue] = React.useState<string>("Tất cả đơn hàng");
  dayjs.extend(customParseFormat);
  // Ngày hiện tại
  const today = dayjs();
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const renderStatus = (result: any) => {
    return (
      <div>
        {result && result === "WAIT FOR CONFIRMATION" ? (
          <Tag icon={<ClockCircleFilled />} color="default">
            Chờ xác nhận
          </Tag>
        ) : result === "WAITING FOR PICKUP" ? (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Chờ lấy hàng
          </Tag>
        ) : result === "DELIVERING" ? (
          <Tag icon={<PlayCircleOutlined />} color="processing">
            Đang giao
          </Tag>
        ) : result === "DELIVERED" ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã giao
          </Tag>
        ) : result === "RECEIVED" ? (
          <Tag icon={<CheckSquareFilled />} color="#177245">
            Đã nhận
          </Tag>
        ) : result === "CANCELLED" ? (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Đã hủy
          </Tag>
        ) : result === "RETURNS" ? (
          <Tag icon={<RollbackOutlined />} color="volcano">
            Trả hàng
          </Tag>
        ) : result === "RETURNING" ? (
          <Tag icon={<LoginOutlined />} color="geekblue">
            Đang trả hàng
          </Tag>
        ) : result === "RETURNED" ? (
          <Tag icon={<SelectOutlined />} color="#000">
            Đã trả hàng
          </Tag>
        ) : (
          "Null"
        )}
      </div>
    );
  };
  const renderStatusForExcel = (result: any) => {
    return (
      result &&
      (result === "WAIT FOR CONFIRMATION"
        ? "Chờ xác nhận"
        : result === "WAITING FOR PICKUP"
        ? "Chờ lấy hàng"
        : result === "DELIVERING"
        ? "Đang giao"
        : result === "DELIVERED"
        ? "Đã giao"
        : result === "CANCELLED"
        ? "Đã hủy"
        : result === "RETURNS"
        ? "Trả hàng"
        : result === "RETURNING"
        ? "Đang trả hàng"
        : result === "RETURNED"
        ? "Đã trả"
        : "Null")
    );
  };

  // Thêm hàm renderPaymentStatusForExcel để xử lý trạng thái thanh toán khi xuất ra Excel
  const renderPaymentStatusForExcel = (result: any) => {
    return result !== undefined && result !== null && result !== ""
      ? result
        ? "Đã thanh toán"
        : "Chưa thanh toán"
      : "Null";
  };

  // Sử dụng filter để lọc ra các hóa đơn đã thanh toán (payment_status === true)
  const paidOrders = orders.filter((order) => order?.payment_status === true);
  // Sử dụng filter để lọc ra các hóa đơn có (payment_information === VNPAY)
  const paymentVnpay = orders.filter(
    (order) => order?.payment_information === "VNPAY"
  );
  // Sử dụng filter để lọc ra các hóa đơn có (payment_information === paypal)
  const paymentPaypal = orders.filter(
    (order) => order?.payment_information === "PAYPAL"
  );
  // Sử dụng filter để lọc ra các hóa đơn có (payment_information === paypal)
  const paymentMoMo = orders.filter(
    (order) => order?.payment_information === "MOMO"
  );
  // Sử dụng filter để lọc ra các hóa đơn có (payment_information === CASH)
  const paymentCod = orders.filter(
    (order) => order?.payment_information === "CASH"
  );
  // Tính tổng từ các đơn hàng
  const total = orders.reduce(
    (total, order) => total + order?.total_money_order,
    0
  );
  //tổng thu
  const totalRevenue = paidOrders.reduce(
    (total, order) => total + order.total_money_order,
    0
  );
  // Orders
  const columns = [
    {
      title: "Mã Đơn hàng",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: any) => {
        return <p>{customer?.full_name}</p>;
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text: number) => {
        return <p>{text}</p>;
      },
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "payment_information",
      key: "payment_information",
    },
    {
      title: "trạng thái thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (text: boolean) => {
        return (
          <p style={{ textAlign: "center" }}>
            {text ? (
              <CheckCircleFilled style={{ color: "green" }} />
            ) : (
              <CloseCircleFilled style={{ color: "red" }} />
            )}
          </p>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        return renderStatus(text);
      },
    },
    {
      title: "Nhân viên",
      dataIndex: "employee",
      key: "employee",
      render: (employee: any) => {
        return <strong>{employee?.full_name}</strong>;
      },
    },
    {
      title: "Ngày tạo hóa đơn",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: any) => {
        return <p>{text}</p>;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_money_order",
      key: "total_money_order",
      render: (text: number) => {
        return <strong>{numeral(text).format("0,0$")}</strong>;
      },
    },
  ];

  useEffect(() => {
    axiosClient.get("/orders").then((response) => {
      setOrders(response.data);
    });
  }, []);
  const onFinish = (values: any) => {
    axiosClient
      .post("/orders/query-order-fromday-today", values)
      .then((response) => {
        message.success("Thành công");
        setOrders(response.data);
        setLoading(false);
      })
      .catch((err) => {
        message.error("Đã xảy ra lỗi, vui lòng kiểm tra lại!");
        setLoading(false);
      });
  };

  const onFinishFailed = (errors: any) => {
    console.log("🐣", errors);
  };

  // xuất file Excel
  let orderCounter = 1; // Biến số để theo dõi số thứ tự
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // Thêm tiêu đề cột
    columns.forEach((column, index) => {
      worksheet.getCell(`${String.fromCharCode(65 + index)}1`).value =
        column.title;
    });

    // Thêm dữ liệu
    orders.forEach((order, rowIndex) => {
      columns.forEach((column, colIndex) => {
        const dataIndex = column.dataIndex as keyof IOrders;
        let cellValue = order[dataIndex];

        // Chuyển đổi dữ liệu nếu cần
        if (dataIndex === "customer") {
          cellValue = cellValue?.full_name;
        }
        if (dataIndex === "employee") {
          cellValue = cellValue?.full_name;
        }
        // Xử lý trạng thái và thanh toán khi xuất ra Excel
        if (dataIndex === "status") {
          cellValue = renderStatusForExcel(cellValue);
        }
        if (dataIndex === "payment_status") {
          cellValue = renderPaymentStatusForExcel(cellValue);
        }
        // Xuất giá trị vào ô Excel
        worksheet.getCell(
          `${String.fromCharCode(65 + colIndex)}${rowIndex + 2}`
        ).value = cellValue;
      });
      // Thêm số thứ tự vào đơn hàng
      worksheet.getCell(`A${rowIndex + 2}`).value = orderCounter++;
    });
    // Thêm ô tính tổng
    worksheet.getCell(`${String.fromCharCode(65 + columns.length)}1`).value =
      "TỔNG";

    const totalMoneyOrderSum = orders.reduce(
      (total, order) => total + order.total_money_order,
      0
    );

    // Xuất giá trị tổng vào ô Excel với định dạng tiền tệ VNĐ
    worksheet.getCell(
      `${String.fromCharCode(65 + columns.length)}${orders.length + 2}`
    ).value = numeral(totalMoneyOrderSum).format("0,0");
    // Tạo một tên tệp động bằng cách sử dụng timestamp
    const timestamp = new Date().getTime();
    const filename = `orders_${timestamp}.xlsx`;
    // Xuất file Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const totalExpense = total - totalRevenue;

  const revenuePercentage = totalRevenue;
  const expensePercentage = totalExpense;
  const datas = [
    {
      name: "Tổng thu",
      value: revenuePercentage,
    },
    {
      name: "Tổng chi",
      value: expensePercentage,
    },
  ];
  const COLORS = ["#177245", "#FF0000"];

  return (
    <div>
      <h1
        style={{ textAlign: "center", marginBottom: "50px", fontSize: "25px" }}
      >
        THỐNG KÊ TẤT CẢ ĐƠN HÀNG
      </h1>
      <div style={{ marginLeft: "32%" }}>
        <PieChart width={400} height={400}>
          <Pie
            data={datas}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={170}
            fill="#8884d8"
            labelLine={false}
          >
            {datas.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              numeral(value).format("0,0").replace(/,/g, ".") + " vnđ"
            }
          />
          <Legend />
        </PieChart>
        <div style={{ marginLeft: "17%", fontSize: "15px" }}>
          <p>
            Tổng:{" "}
            <span style={{ color: "blue" }}>
              {numeral(total).format("0,0").replace(/,/g, ".")} vnđ
            </span>
          </p>
          <p>
            Tổng thu:{" "}
            <span style={{ color: "green" }}>
              {numeral(totalRevenue).format("0,0").replace(/,/g, ".")} vnđ
            </span>
          </p>
          <p>
            Tổng chi:{" "}
            <span style={{ color: "red" }}>
              {numeral(total - totalRevenue)
                .format("0,0")
                .replace(/,/g, ".")}{" "}
              vnđ
            </span>
          </p>
        </div>
      </div>
      <div style={{ marginTop: "40px", marginLeft: "17%" }}>
        <Form
          form={searchForm}
          name="search-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ status: "" }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="on"
        >
          <Form.Item
            label="Từ ngày"
            name="fromDate"
            rules={[
              {
                required: true,
                message: "Hãy chọn từ ngày!",
              },
            ]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              locale={locale}
              disabledDate={(current) =>
                current && current > today.endOf("day")
              }
            />
          </Form.Item>
          <Form.Item
            label="Đến ngày"
            name="toDate"
            rules={[
              {
                required: true,
                message: "Hãy chọn đến ngày!",
              },
            ]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              locale={locale}
              disabledDate={(current) =>
                current && current > today.endOf("day")
              }
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              {loading ? "Đang xử lý ..." : "Tìm kiếm"}
            </Button>
            <Button
              style={{
                marginLeft: "10px",
                backgroundColor: "green",
                color: "white",
              }}
              onClick={exportToExcel}
              disabled={orders.length === 0}
            >
              Xuất Excel
            </Button>
          </Form.Item>
        </Form>
      </div>
      {/* <div
          style={{
            border: "1px solid gray",
            height: "300px",
            borderRadius: "10px",
            backgroundColor: "white",
          }}
        ></div> */}
      <div style={{ margin: "10px 0", display: "flex" }}>
        <div style={{ flex: 1 }}>
          <Button
            type="primary"
            onClick={showModal}
            disabled={orders.length === 0}
          >
            Xem thống kê
          </Button>
        </div>
        <div style={{ fontSize: "18px", fontWeight: 500 }}>
          <p>{oderValue}</p>
        </div>
      </div>
      <Table rowKey="_id" dataSource={orders} columns={columns} />

      <Modal open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <div
          style={{
            fontSize: "30px",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Thống kê
        </div>
        <div
          style={{
            fontWeight: 500,
            fontSize: "18px",
          }}
        >
          <p>
            Tổng số hóa đơn:{" "}
            <span style={{ color: "green" }}>{orders.length}</span>
          </p>
          <p>
            Hóa đơn đã thanh toán:{" "}
            <span style={{ color: "green" }}>{paidOrders.length}</span>
          </p>
          <p>
            Hóa đơn chưa thanh toán:{" "}
            <span style={{ color: "red" }}>
              {orders.length - paidOrders.length}
            </span>
          </p>
          <p>
            Thanh toán vnpay: <span>{paymentVnpay.length}</span>
          </p>
          <p>
            Thanh toán paypal: <span>{paymentPaypal.length}</span>
          </p>
          <p>
            Thanh toán momo: <span>{paymentMoMo.length}</span>
          </p>
          <p>
            Thanh toán khi nhận hàng: <span>{paymentCod.length}</span>
          </p>
          <p>
            Tổng:{" "}
            <span style={{ color: "blue" }}>
              {numeral(total).format("0,0").replace(/,/g, ".")} vnđ
            </span>
          </p>
          <p>
            Tổng thu:{" "}
            <span style={{ color: "green" }}>
              {numeral(totalRevenue).format("0,0").replace(/,/g, ".")} vnđ
            </span>
          </p>
          <p>
            Tổng chi:{" "}
            <span style={{ color: "red" }}>
              {numeral(total - totalRevenue)
                .format("0,0")
                .replace(/,/g, ".")}{" "}
              vnđ
            </span>
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default OrdersAll;
