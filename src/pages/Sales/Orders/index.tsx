import React, { useRef, useState } from "react";
import numeral from "numeral";
import moment from "moment";
import {
  Table,
  Button,
  Card,
  Modal,
  Descriptions,
  Divider,
  Form,
  message,
  Input,
  Select,
  Space,
  Popconfirm,
  DatePicker,
  Tag,
  InputRef,
} from "antd";
import {
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckSquareFilled,
  ClockCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  RollbackOutlined,
  SearchOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { axiosClient } from "../../../libraries/axiosClient";
import { IProduct } from "../../../interfaces/Product";
import { IEmployees } from "../../../interfaces/Employees";
import TextArea from "antd/es/input/TextArea";
import { FilterConfirmProps } from "antd/es/table/interface";
import type { ColumnType } from "antd/es/table";
import { IOrders } from "../../../interfaces/IOrders";
import Highlighter from "react-highlight-words";

export default function Orders() {
  const [editFormVisible, setEditFormVisible] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<{
    _id: string;
    status: string;
  } | null>(null);
  const [addProductsModalVisible, setAddProductsModalVisible] =
    React.useState(false);
  const [saleEmployees, setSaleEmployees] = React.useState<IEmployees[]>([]);
  const [shipperEmployees, setShipperEmployees] = React.useState<IEmployees[]>(
    []
  );
  const [selectedOrder, setSelectedOrder] = React.useState<{
    _id: string;
    status: string;
    full_name: string;
    phoneNumber: number;
    payment_information: string;
    payment_status: string;
    createdAt: any;
    shipped_date: any;
    shipping_address: string;
    employee: any;
    order_details: any;
  } | null>(null);
  const [refresh, setRefresh] = React.useState(0);
  const [createFormVisible, setCreateFormVisible] = React.useState(false);
  const [openModalOrderDetails, setOpenModalDetails] = React.useState(false);
  // const [loading, setLoading] = React.useState(false);
  //State search
  type DataIndex = keyof IOrders;
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  // Products
  const [products, setProducts] = React.useState<IProduct[]>([]);
  console.log(selectedOrder);

  React.useEffect(() => {
    axiosClient.get("/products").then((response) => {
      setProducts(response.data);
    });
  }, [refresh]);

  React.useEffect(() => {
    axiosClient.get("/orders").then((response) => {
      setOrders(response.data);
    });
  }, [refresh]);

  // React.useEffect(() => {
  //   if (selectedOrder) {
  //     axiosClient.get("/orders/" + selectedOrder._id).then((response) => {
  //       setSelectedOrder(response.data);
  //     });
  //   }
  // }, [selectedOrder]);

  React.useEffect(() => {
    const shippers: IEmployees[] = [];
    const sales: IEmployees[] = [];
    axiosClient
      .get("/employees", {
        headers: {
          access_token: `Bearer ${window.localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        response.data.map((employee: IEmployees) => {
          if (employee.roles === "shipper") {
            shippers.push(employee);
          } else if (employee.roles === "sales") {
            sales.push(employee);
          }
        });
        setShipperEmployees(shippers);
        setSaleEmployees(sales);
      });
  }, []);
  // console.log("selectedOrder", selectedOrder);

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
  // CHỜ XÁC NHẬN || WAIT FOR CONFIRMATION
  // CHỜ LẤY HÀNG || WAITING FOR PICKUP
  // ĐANG GIAO || DELIVERING
  // ĐÃ GIAO || DELIVERED
  // ĐÃ HỦY || CANCELLED
  // TRẢ HÀNG || RETURNS
  // ĐANG TRẢ HÀNG || RETURNING
  // ĐÃ TRẢ || RETURNED

  //Search
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };
  //search
  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<IOrders> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Nhập thông tin tìm kiếm`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Làm mới
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Lọc
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record: any) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const productColumns = [
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product.name",
      key: "product.name",
      render: (text, record) => {
        console.log("record", record);

        return (
          <strong>
            {record?.product?.name} {record?.variants_id !== null ? "-" : ""}{" "}
            {record?.variants?.title}
          </strong>
        );
      },
    },
    {
      title: "Giá",
      dataIndex: "product.total_money_order",
      key: "product.total_money_order",
      render: (text, record) => {
        const originalPrice =
          record?.variants_id !== null
            ? record?.variants?.price
            : record?.product?.price;

        const discountedPrice =
          (originalPrice * (100 - record?.product?.discount)) / 100;

        return (
          <div style={{ textAlign: "right" }}>
            <div>
              <span style={{ textDecoration: "line-through" }}>
                {numeral(originalPrice).format("0,0$")}
              </span>
            </div>
            <div>{numeral(discountedPrice).format("0,0$")}</div>
          </div>
        );
      },
    },
    {
      title: "Giảm giá",
      dataIndex: "product.discount",
      key: "product.discount",
      render: (text, record) => {
        return (
          <div style={{ textAlign: "right" }}>
            {numeral(record?.product?.discount).format("0,0")}%
          </div>
        );
      },
    },
    // {
    //   title: "",
    //   key: "actions",
    //   render: (text, record) => {
    //     return (
    //       <Button
    //         onClick={async () => {
    //           if (selectedOrder !== null) {
    //             const currentProduct = record;
    //             const response = await axiosClient.get(
    //               "orders/" + selectedOrder._id
    //             );
    //             const currentOrder = response.data;
    //             const { orderDetails } = currentOrder;
    //             const remainOrderDetails = orderDetails.filter((x: any) => {
    //               return (
    //                 x.productId.toString() !==
    //                 currentProduct.productId.toString()
    //               );
    //             });
    //             await axiosClient.patch("orders/" + selectedOrder._id, {
    //               orderDetails: remainOrderDetails,
    //             });
    //           }

    //           setAddProductsModalVisible(false);
    //           message.success("Xóa thành công");
    //           setRefresh((f) => f + 1);
    //         }}
    //       >
    //         Xóa
    //       </Button>
    //     );
    //   },
    // },
  ];

  // Orders
  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "full_name",
      key: "full_name",
      ...getColumnSearchProps("full_name"),
      render: (text: string) => {
        return <p>{text}</p>;
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      ...getColumnSearchProps("phoneNumber"),
      render: (text: number) => {
        return <p>{text}</p>;
      },
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "payment_information",
      key: "payment_information",
      ...getColumnSearchProps("payment_information"),
    },
    {
      title: "Vận chuyển",
      dataIndex: "status",
      key: "status",
      filters: [
        {
          text: "Chờ xác nhận",
          value: "WAIT FOR CONFIRMATION",
        },
        {
          text: "Chờ lấy hàng",
          value: "WAITING FOR PICKUP",
        },
        {
          text: "Đang giao",
          value: "DELIVERING",
        },
        {
          text: "Đã giao",
          value: "DELIVERED",
        },
      ],
      onFilter: (value: string, record: any) =>
        record.status.indexOf(value) === 0,
      render: (text: string) => {
        return renderStatus(text);
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      filters: [
        {
          text: "Đã thanh toán",
          value: true,
        },
        {
          text: "Chưa thanh toán",
          value: false,
        },
      ],
      onFilter: (value: boolean, record: any) =>
        record.payment_status === value,
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
      title: "Nhân viên",
      dataIndex: "employee",
      key: "employee",
      render: (text, record) => {
        return <strong>{record.employee?.full_name}</strong>;
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
    // {
    //   title: "",
    //   key: "actions",
    //   render: (record: any) => {
    //     return (
    //       <Button
    //         onClick={() => {
    //           setSelectedOrder(record);
    //           setOpenModalDetails(true);
    //         }}
    //       >
    //         Xem
    //       </Button>
    //     );
    //   },
    // },
    // delete, update
    {
      title: "",
      key: "actions",
      width: "1%",
      render: (record: any) => {
        return (
          <Space>
            {/* Update */}
            <Button
              type="dashed"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedRecord(record);
                console.log("selectes", record);
                updateForm.setFieldsValue(record);
                setEditFormVisible(true);
              }}
            />
            {/* delete */}
            {/* <Popconfirm
              title="Bạn có muốn hủy đơn hàng không?"
              onConfirm={() => {
                //delete
                const id = record._id;
                axiosClient
                  .delete("/orders/" + id)
                  .then((response) => {
                    message.success("Hủy đơn hàng thành công!");
                    setRefresh((f) => f + 1);
                  })
                  .catch((err) => {
                    message.error("Hủy đơn hàng thất bại!");
                  });
                console.log("delete", record);
              }}
              okText="Có"
              cancelText="Không"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm> */}
          </Space>
        );
      },
    },
  ];

  const [orders, setOrders] = React.useState([]);

  // create form
  const [createForm] = Form.useForm();
  // update form
  const [updateForm] = Form.useForm();
  // search form
  const [searchForm] = Form.useForm();

  // tạo mới form
  const onFinish = (values: any) => {
    axiosClient
      .post("/orders", values)
      .then((response) => {
        message.success("Thêm Hóa Đơn thành công!");
        createForm.resetFields();
        setRefresh((f) => f + 1);
      })
      .catch((err: any) => {
        message.error("Thêm Hóa Đơn thất bại!");
        // console.log({ message: message.err });
      });
    console.log("👌👌👌", values);
  };
  const onFinishFailed = (errors: any) => {
    console.log("💣💣💣 ", errors);
  };

  // update form
  // xử lý cập nhật thông tin
  const onUpdateFinish = (values: any) => {
    axiosClient
      .patch("/orders/" + selectedRecord?._id, values)
      .then(() => {
        message.success("Cập nhật thành công ❤");
        updateForm.resetFields();
        // load lại form
        setRefresh((f) => f + 1);
        // đóng
        setEditFormVisible(false);
        console.log(values);
      })
      .catch((err) => {
        message.error("Cập nhật thất bại 😥");
      });
    console.log("❤", values);
  };
  const onUpdateFinishFailed = (errors: any) => {
    console.log("💣", errors);
  };

  // validate
  // validate phone number
  const phoneValidator = (value: any, callback: any) => {
    const phoneNumberPattern =
      /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
    if (value && !phoneNumberPattern.test(value)) {
      callback("Số điện thoại không hợp lệ");
    } else {
      callback();
    }
  };

  // validate ngày hóa đơn
  const dateOfValidator = (value: any, callback: any) => {
    const dateFormat = "YYYY/MM/DD"; // Định dạng ngày tháng
    const currentDate = moment(); // Lấy ngày hiện tại
    const dateOfCreatedDate = moment(value, dateFormat); // Chuyển đổi giá trị nhập vào thành kiểu moment

    // Kiểm tra tính hợp lệ của ngày sinh
    if (currentDate.diff(dateOfCreatedDate, "days") < 0) {
      callback("Ngày hóa đơn phải nhỏ hơn ngày hiện tại");
    } else {
      callback();
    }
  };
  return (
    <div>
      <h1 className="text-center p-2 mb-5 text-xl">📑 Quản Lý Đơn Hàng 📑</h1>

      {/* Modal thêm mới sản phẩm */}
      <Button
        className="bg-blue-500 text-white font-bold mb-5 mt-5"
        onClick={() => {
          setCreateFormVisible(true);
        }}
      >
        Thêm mới đơn hàng
      </Button>
      <div
        style={{
          margin: "20px 0",
          color: "green",
          fontWeight: "bold",
          fontSize: "15px",
        }}
      >
        <p>
          Tổng số đơn hàng: <span>{orders.length}</span>
        </p>
      </div>
      <Modal
        centered
        open={createFormVisible}
        title="Thêm mới thông tin đơn hàng"
        onOk={() => {
          createForm.submit();
          //setCreateFormVisible(false);
        }}
        onCancel={() => {
          setCreateFormVisible(false);
        }}
        okText="Lưu"
        cancelText="Đóng"
      >
        <Form
          form={createForm}
          name="create-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <div className="w-[100%]">
            {/* Status */}
            <Form.Item
              hasFeedback
              className=""
              label="Trạng thái đơn hàng"
              name="status"
              rules={[
                { required: true, message: "Không thể để trống" },
                {
                  validator: (_, value) => {
                    if (
                      [
                        "WAIT FOR CONFIRMATION",
                        "WAITING FOR PICKUP",
                        "DELIVERING",
                        "DELIVERED",
                        "RECEIVED",
                        "CANCELLED",
                        "RETURNS",
                        "RETURNING",
                        "RETURNED",
                      ].includes(value)
                    ) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject("Trạng thái không hợp lệ!");
                    }
                  },
                },
              ]}
            >
              <Select
                defaultValue={[
                  {
                    value: "RECEIVED",
                    label: "Đã nhận",
                  },
                ]}
                options={[
                  {
                    value: "WAIT FOR CONFIRMATION",
                    label: "Chờ xác nhận",
                  },
                  {
                    value: "RECEIVED",
                    label: "Đã nhận",
                  },
                ]}
              />
            </Form.Item>

            {/* Description */}
            <Form.Item
              hasFeedback
              className=""
              label="Mô tả"
              name="description"
            >
              <Input />
            </Form.Item>

            {/* shipping_address */}
            <Form.Item
              hasFeedback
              label="Địa chỉ"
              name="shipping_address"
              rules={[{ required: true, message: "Không thể để trống" }]}
            >
              <TextArea rows={3} />
            </Form.Item>

            {/* Payment Type */}
            <Form.Item
              hasFeedback
              className=""
              label="Hình thức thanh toán"
              name="payment_information"
              rules={[{ required: true, message: "Không thể để trống" }]}
            >
              <Select
                options={[
                  {
                    value: "CASH",
                    label: "CASH",
                  },
                  {
                    value: "MOMO",
                    label: "MOMO",
                  },
                  {
                    value: "PAYPAL",
                    label: "PAYPAL",
                  },
                  {
                    value: "VNPAY",
                    label: "VNPAY",
                  },
                ]}
              />
            </Form.Item>

            {/* Customer */}
            <Form.Item
              className=""
              label="Khách hàng"
              name="full_name"
              rules={[{ required: true, message: "Không thể để trống" }]}
            >
              <Input />
            </Form.Item>
            {/* PhoneNumber */}
            <Form.Item
              className=""
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  message: "Số điện thoại không được để trống!",
                },
                { min: 10, message: "Số điện thoại dưới 10 chữ số!" },
                { max: 10, message: "Số điện thoại không quá 10 chữ số!" },
              ]}
            >
              <Input />
            </Form.Item>
            {/* Employee */}
            <Form.Item
              className=""
              label="Nhân viên"
              name="employee_id"
              rules={[{ required: true, message: "Không thể để trống" }]}
            >
              <Select
                options={
                  saleEmployees &&
                  saleEmployees.map((employee) => {
                    return {
                      value: employee._id,
                      label: employee.full_name,
                    };
                  })
                }
              />
            </Form.Item>
          </div>
        </Form>
        <Button
          onClick={() => {
            setAddProductsModalVisible(true);
            setRefresh((f) => f + 1);
          }}
        >
          Thêm sản phẩm
        </Button>

        <Modal
          centered
          title="Danh sách sản phẩm"
          open={addProductsModalVisible}
          onCancel={() => {
            setAddProductsModalVisible(false);
          }}
          onOk={() => {
            setRefresh((f) => f + 1);
          }}
        >
          {products &&
            products.map((product) => {
              return (
                <Card key={product?._id}>
                  <strong style={{ marginRight: "10px" }}>
                    {product?.name}
                  </strong>
                  <Button
                    onClick={async () => {
                      const response = await axiosClient.get(
                        "orders/" + selectedOrder?._id
                      );
                      const currentOrder = response.data;
                      const { order_details } = currentOrder;
                      const found = order_details.find(
                        (x: any) => x.product_id === product._id
                      );
                      if (found) {
                        found.quantity++;
                      } else {
                        order_details.push({
                          product_id: product._id,
                          quantity: 1,
                        });
                      }

                      await axiosClient.patch("orders/" + selectedOrder._id, {
                        order_details,
                      });

                      setAddProductsModalVisible(false);
                      // RELOAD //
                      setRefresh((f) => f + 1);
                    }}
                  >
                    Add
                  </Button>
                </Card>
              );
            })}
        </Modal>
      </Modal>

      <Modal
        width={"60%"}
        centered
        title="Chi tiết đơn hàng"
        open={openModalOrderDetails}
        onCancel={() => {
          setOpenModalDetails(false);
        }}
      >
        {selectedOrder && (
          <div>
            <Descriptions
              bordered
              column={1}
              labelStyle={{ fontWeight: "700" }}
            >
              <Descriptions.Item label="Vận chuyển">
                {renderStatus(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức thanh toán">
                {selectedOrder.payment_information}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {selectedOrder.payment_status ? (
                  <CheckCircleFilled style={{ color: "green" }} />
                ) : (
                  <CloseCircleFilled style={{ color: "red" }} />
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo hóa đơn">
                {selectedOrder.createdAt}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giao">
                {selectedOrder.shipped_date}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                {selectedOrder.shipping_address}
              </Descriptions.Item>
              <Descriptions.Item label="Nhân viên">
                {selectedOrder.employee?.full_name}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Table
              rowKey="_id"
              dataSource={selectedOrder.order_details}
              columns={productColumns}
            />
          </div>
        )}
      </Modal>

      {/* update form */}
      <Modal
        centered
        open={editFormVisible}
        title="Cập nhật thông tin"
        onOk={() => {
          updateForm.submit();
        }}
        onCancel={() => {
          setEditFormVisible(false);
        }}
        okText="Lưu thông tin"
        cancelText="Đóng"
        okButtonProps={{
          disabled:
            selectedRecord?.status !== "WAIT FOR CONFIRMATION" &&
            selectedRecord?.employee_id
              ? true
              : false,
          style: {
            display:
              selectedRecord?.status !== "WAIT FOR CONFIRMATION" &&
              selectedRecord?.employee_id
                ? "none"
                : "",
          },
        }}
      >
        <Form
          form={updateForm}
          name="update-form"
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onUpdateFinish}
          onFinishFailed={onUpdateFinishFailed}
          autoComplete="off"
        >
          <div className="w-[80%]">
            {/* Created Date */}
            <Form.Item
              hasFeedback
              label="Ngày tạo"
              name="createdAt"
              rules={[
                { required: true, message: "Không thể để trống" },
                // {
                //   validator: dateOfValidator,
                // },
                // { type: "date", message: "Ngày không hợp lệ" },
              ]}
            >
              <Input disabled />
            </Form.Item>

            {/* Shipped Date */}
            {/* <Form.Item
              hasFeedback
              className=""
              label="Ngày giao"
              name="shipped_date"
            >
              <Input />
            </Form.Item> */}

            {/* Status */}
            <Form.Item
              hasFeedback
              className=""
              label="Trạng thái đơn hàng"
              name="status"
              rules={[
                { required: true, message: "Không thể để trống" },
                {
                  validator: (_, value) => {
                    if (
                      [
                        "WAIT FOR CONFIRMATION",
                        "WAITING FOR PICKUP",
                        "DELIVERING",
                        "DELIVERED",
                        "CANCELLED",
                        "RETURNS",
                        "RETURNING",
                        "RETURNED",
                      ].includes(value)
                    ) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject("Trạng thái không hợp lệ!");
                    }
                  },
                },
              ]}
            >
              <Select
                disabled={
                  selectedRecord &&
                  selectedRecord.status === "WAIT FOR CONFIRMATION"
                    ? false
                    : true
                }
                options={[
                  {
                    value: "WAIT FOR CONFIRMATION",
                    label: "Chờ xác nhận",
                  },
                  {
                    value: "WAITING FOR PICKUP",
                    label: "Chờ lấy hàng",
                  },
                ]}
              />
            </Form.Item>

            {/* Description */}
            <Form.Item
              hasFeedback
              className=""
              label="Mô tả"
              name="description"
            >
              <Input />
            </Form.Item>

            {/* shipping_address */}
            <Form.Item
              hasFeedback
              className=""
              label="Địa chỉ"
              name="shipping_address"
              rules={[{ required: true, message: "Không thể để trống" }]}
            >
              <TextArea rows={3} />
            </Form.Item>

            {/* Payment Type */}
            <Form.Item
              hasFeedback
              className=""
              label="Hình thức thanh toán"
              name="payment_information"
              rules={[{ required: true, message: "Không thể để trống" }]}
            >
              <Select
                disabled
                options={[
                  {
                    value: "CASH",
                    label: "CASH",
                  },
                  {
                    value: "MOMO",
                    label: "MOMO",
                  },
                  {
                    value: "PAYPAL",
                    label: "PAYPAL",
                  },
                  {
                    value: "VNPAY",
                    label: "VNPAY",
                  },
                ]}
              />
            </Form.Item>

            {/* Customer */}
            <Form.Item
              className=""
              label="Khách hàng"
              name="full_name"
              rules={[{ required: true, message: "Không thể để trống" }]}
            >
              <Input />
            </Form.Item>
            {/* PhoneNumber */}
            <Form.Item
              className=""
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Không thể để trống" },
                // {
                //   validator: phoneValidator,
                // },
              ]}
            >
              <Input />
            </Form.Item>
            {/* Employee */}
            <Form.Item
              label="Nhân viên"
              name="employee_id"
              rules={[{ required: true, message: "Không thể để trống" }]}
            >
              <Select
                disabled={selectedRecord?.employee_id}
                options={
                  shipperEmployees &&
                  shipperEmployees.map((employee) => {
                    return {
                      value: employee._id,
                      label: employee.full_name,
                    };
                  })
                }
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Table rowKey="_id" dataSource={orders} columns={columns} />
    </div>
  );
}
