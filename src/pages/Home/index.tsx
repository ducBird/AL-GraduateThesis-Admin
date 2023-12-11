import { useState, useEffect } from "react";
import { DatePicker, message } from "antd";
import style from "./home.module.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { axiosClient } from "../../libraries/axiosClient";
import { IOrders } from "../../interfaces/IOrders";
import numeral from "numeral";
import ChartAllOrders from "../../components/Chart/ChartAllOrders";
import ChartOrderPaymentStatusTrue from "../../components/Chart/ChartOrderPaymentStatusTrue";
import ChartOrderPaymentStatusFalse from "../../components/Chart/ChartOrderPaymentStatusFalse";

export default function HomePage() {
  dayjs.extend(customParseFormat);
  // Ngày hiện tại
  const today = dayjs();

  // Ngày 7 ngày trước
  const sevenDaysAgo = today.subtract(7, "days");
  const dateFormat = "YYYY-MM-DD";
  const [startDate, setStartDate] = useState<any>(
    sevenDaysAgo.format(dateFormat)
  );
  const [endDate, setEndDate] = useState<any>(today.format(dateFormat));
  const [orders, setOrders] = useState<IOrders[]>([]);
  // console.log("stateDate: ", startDate);
  // console.log("endDate: ", endDate);

  useEffect(() => {
    axiosClient
      .post("/orders/query-order-fromday-today", {
        fromDate: startDate,
        toDate: endDate,
      })
      .then((response) => {
        setOrders(response.data);
      });
  }, [startDate, endDate]);
  console.log("orders", orders);

  const handleStartDateChange = (date: any, dateString: any) => {
    // Xử lý khi ngày bắt đầu thay đổi
    const changeStartDate = today.subtract(2, "months");
    // Kiểm tra nếu khoảng cách giữa startDate và endDate vượt quá 2 tháng
    if (dayjs(dateString).add(2, "months").isBefore(today)) {
      message.error(
        "Khoảng thời gian cho phép xuất dữ liệu giao dịch tối đa là 2 tháng"
      );
      setStartDate(changeStartDate.format(dateFormat));
    } else {
      setStartDate(dateString);
    }
  };

  const handleEndDateChange = (date: any, dateString: any) => {
    // Xử lý khi ngày kết thúc thay đổi
    // console.log("thay đổi ngày kết thúc: ", dateString);
    setEndDate(dateString);
  };

  // Tính tổng các đơn hàng
  let totalAllOrder = 0;
  if (orders && orders.length > 0) {
    totalAllOrder = orders.reduce((total, item) => {
      return total + item?.total_money_order;
    }, 0);
  }
  let totalOrderPaymentStatusTrue = 0;
  if (orders && orders.length > 0) {
    totalOrderPaymentStatusTrue = orders.reduce((total, item) => {
      if (item.payment_status === true) {
        return total + item?.total_money_order;
      }
      return total; // Trả về total nếu không có sự thay đổi
    }, 0);
  }

  const filterOrdersByPayment = (orders: IOrders[], paymentType: string) =>
    orders.filter((order) => order?.payment_information === paymentType);

  const calculateTotalByPayment = (paymentType: string) => {
    const filteredOrders = filterOrdersByPayment(orders, paymentType);
    return filteredOrders.reduce(
      (total, item) => total + item?.total_money_order,
      0
    );
  };

  const PaymentInfo = ({ label, total }: any) => (
    <div style={{ textAlign: "center" }}>
      <p>{numeral(total).format("0,0").replace(/,/g, ".")} VNĐ</p>
      <p>{`Giao dịch bằng ${label}`}</p>
    </div>
  );

  const renderPaymentInfo = (paymentType: string, label: string) => {
    const total = calculateTotalByPayment(paymentType);
    return <PaymentInfo key={paymentType} label={label} total={total} />;
  };
  const paymentTypes = [
    { type: "VNPAY", label: "VNPAY" },
    { type: "PAYPAL", label: "PAYPAL" },
    { type: "MOMO", label: "MOMO" },
    { type: "CASH", label: "CASH" },
  ];
  return (
    <div className="home">
      <div className={`${style.home_header}`}>
        {paymentTypes.map((payment) =>
          renderPaymentInfo(payment.type, payment.label)
        )}
        <div style={{ textAlign: "center" }}>
          <p>{numeral(totalAllOrder).format("0,0").replace(/,/g, ".")} VNĐ</p>
          <p>Tổng</p>
        </div>
      </div>
      <div className="top_chart" style={{ marginTop: "10px", display: "flex" }}>
        <p style={{ fontSize: "20px", flex: 1 }}>Màn hình chính</p>
        <div style={{ marginTop: "20px" }}>
          <DatePicker
            value={dayjs(startDate)}
            onChange={handleStartDateChange}
            disabledDate={(current) => current && current > today.endOf("day")}
          />
        </div>
        <p
          style={{ fontSize: "20px", marginLeft: "20px", marginRight: "20px" }}
        >
          Đến
        </p>
        <div style={{ marginTop: "20px" }}>
          <DatePicker
            value={dayjs(endDate)}
            onChange={handleEndDateChange}
            disabledDate={(current) => current && current > today.endOf("day")}
          />
        </div>
      </div>
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid gray",
          borderRadius: "5px",
          padding: "10px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            borderBottom: "1px solid gray",
            marginBottom: "50px",
            display: "flex",
          }}
        >
          <p style={{ flex: 1 }}>Tổng tiền giao dịch</p>
          <p>{numeral(totalAllOrder).format("0,0").replace(/,/g, ".")} vnđ</p>
        </div>
        <div>
          <ChartAllOrders
            orders={orders}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
        }}
      >
        {/* Giao dịch đã thanh toán */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid gray",
            borderRadius: "5px",
            padding: "10px",
            marginTop: "20px",
            width: "49%",
            marginRight: "15px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              borderBottom: "1px solid gray",
              marginBottom: "10px",
              display: "flex",
            }}
          >
            <p style={{ flex: 1 }}>Giao dịch đã thanh toán</p>
            <p>
              {numeral(totalOrderPaymentStatusTrue)
                .format("0,0")
                .replace(/,/g, ".")}{" "}
              vnđ
            </p>
          </div>
          <div>
            <ChartOrderPaymentStatusTrue
              orders={orders}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>

        {/* Giao dịch chưa thanh toán */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid gray",
            borderRadius: "5px",
            padding: "10px",
            marginTop: "20px",
            width: "49%",
            marginLeft: "15px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              borderBottom: "1px solid gray",
              marginBottom: "10px",
              display: "flex",
            }}
          >
            <p style={{ flex: 1 }}>Giao dịch chưa thanh toán</p>
            <p>
              {numeral(totalAllOrder - totalOrderPaymentStatusTrue)
                .format("0,0")
                .replace(/,/g, ".")}{" "}
              vnđ
            </p>
          </div>
          <div>
            <ChartOrderPaymentStatusFalse
              orders={orders}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
