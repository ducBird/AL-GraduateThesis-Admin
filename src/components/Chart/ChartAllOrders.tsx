import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { IOrders } from "../../interfaces/IOrders";
import dayjs from "dayjs";
import moment from "moment";
interface Props {
  orders: IOrders[];
  startDate: string;
  endDate: string;
}
const ChartAllOrders = (props: Props) => {
  const { orders, startDate, endDate } = props;

  // Hàm tạo danh sách các ngày trong khoảng thời gian
  const createDateRange = (startDate: string, endDate: string): string[] => {
    const dateRange: string[] = [];
    const currentDate = new Date(startDate);
    const endDateTime = new Date(endDate).getTime();

    while (currentDate.getTime() <= endDateTime) {
      dateRange.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateRange;
  };
  // Tạo danh sách các ngày trong khoảng thời gian
  const dateRange = createDateRange(startDate, endDate);

  // Tính tổng theo ngày
  const dailyTotal: Record<string, number> = dateRange.reduce((acc, date) => {
    const orderTotal = orders
      .filter(
        (order) =>
          new Date(order.createdAt).toISOString().split("T")[0] === date
      )
      .reduce((total, order) => total + order.total_money_order, 0);

    acc[date] = orderTotal;
    return acc;
  }, {} as Record<string, number>);
  // Hàm định dạng ngày
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}-${month}`;
  };
  // Chuyển đổi thành dạng mảng để sử dụng trong biểu đồ
  const chartData = Object.keys(dailyTotal).map((date) => ({
    name: formatDate(date),
    "Tổng tiền": dailyTotal[date],
  }));
  return (
    <div style={{ textAlign: "center" }}>
      <ResponsiveContainer className="chart mt-10" height={250}>
        <LineChart
          width={600}
          height={300}
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Tổng tiền"
            stroke="#261dc1"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p style={{ fontSize: "22px" }}>
        Biểu đồ đường biểu diễn tổng tiền thanh toán
      </p>
    </div>
  );
};

export default ChartAllOrders;
