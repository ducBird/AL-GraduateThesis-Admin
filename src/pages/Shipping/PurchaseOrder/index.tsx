import React, { useState } from "react";
import numeral from "numeral";
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
  Upload,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusSquareOutlined,
  CloseSquareFilled,
  CheckSquareFilled,
  UploadOutlined,
  ClockCircleFilled,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
  LoginOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { axiosClient } from "../../../libraries/axiosClient";
import { useUser } from "../../../hooks/useUser";
import { IOrders } from "../../../interfaces/IOrders";
import axios from "axios";
import { API_URL } from "../../../constants/URLS";
import TextArea from "antd/es/input/TextArea";

export default function PurchaseOrder() {
  const [editFormVisible, setEditFormVisible] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const [employees, setEmployees] = React.useState([]);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [openModalOrderDetails, setOpenModalDetails] = React.useState(false);
  const [isOpenFormAccept, setIsOpenFormAccept] = React.useState(false);
  const [orders, setOrders] = React.useState([]);
  const [orderShipping, setOrderShipping] = React.useState<IOrders[]>([]);
  const [orderShipped, setOrderShipped] = React.useState<IOrders[]>([]);
  const [refresh, setRefresh] = React.useState(0);
  const [file, setFile] = useState<any>();
  const { users } = useUser((state) => state);

  // GET ORDER HAVE WAITING FOR PICKUP
  React.useEffect(() => {
    const orderUnresolved: IOrders[] = [];
    // if (selectedOrder) {
    //   axiosClient.get("orders/" + selectedOrder._id).then((response) => {
    //     setSelectedOrder(response.data);
    //   });
    // }
    if (users.user.roles === "admin") {
      axiosClient.get("/orders").then((response) => {
        response.data.map((order: any) => {
          if (order.status.includes("WAITING FOR PICKUP")) {
            orderUnresolved.push(order);
          }
        });
        setOrders(orderUnresolved);
      });
    } else {
      axiosClient.get("/orders").then((response) => {
        response.data.map((order: any) => {
          if (
            order.employee_id === users.user._id &&
            order.status.includes("WAITING FOR PICKUP")
          ) {
            orderUnresolved.push(order);
          }
        });
        setOrders(orderUnresolved);
      });
    }
  }, [refresh]);

  //GET ORDER HAVE DELIVERING
  React.useEffect(() => {
    const orderShipping: IOrders[] = [];
    if (users.user.roles === "admin") {
      axiosClient.get("/orders").then((response) => {
        response.data.map((order: any) => {
          if (order.status.includes("DELIVERING")) {
            orderShipping.push(order);
          }
        });
        setOrderShipping(orderShipping);
      });
    } else {
      axiosClient.get("/orders").then((response) => {
        response.data.map((order: any) => {
          if (
            order.employee_id === users.user._id &&
            order.status.includes("DELIVERING")
          ) {
            orderShipping.push(order);
          }
        });
        setOrderShipping(orderShipping);
      });
    }
  }, [refresh]);

  //GET ORDER HAVE DELIVERED
  React.useEffect(() => {
    const orderShipped: IOrders[] = [];
    if (users.user.roles === "admin") {
      axiosClient.get("/orders").then((response) => {
        response.data.map((order: any) => {
          if (order.status.includes("DELIVERED")) {
            orderShipped.push(order);
          }
        });
        setOrderShipped(orderShipped);
      });
    } else {
      axiosClient.get("/orders").then((response) => {
        response.data.map((order: any) => {
          if (
            order.employee_id === users.user._id &&
            order.status.includes("DELIVERED")
          ) {
            orderShipped.push(order);
          }
        });
        setOrderShipped(orderShipped);
      });
    }
  }, [refresh]);

  // get list employees
  React.useEffect(() => {
    axiosClient
      .get("/employees", {
        headers: {
          access_token: `Bearer ${window.localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        setEmployees(response.data);
      });
  }, []);
  // console.log(users.user.user);

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
        return <strong>{record?.product?.name}</strong>;
      },
    },
    {
      title: "Giá",
      dataIndex: "product.price",
      key: "product.price",
      render: (text, record) => {
        return (
          <div style={{ textAlign: "right" }}>
            {numeral(
              record?.product?.discount
                ? record?.product?.total
                : record?.product?.price
            ).format("0,0$")}
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
  ];

  // Orders have status == "COMFIRMED ORDER"
  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "full_name",
      key: "full_name",
      render: (text: string) => {
        return <p>{text}</p>;
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
      render: (text: string) => {
        return <p>{text}</p>;
      },
    },
    {
      title: "Vận chuyển",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        return renderStatus(text);
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (text: boolean) => {
        return (
          <p style={{ textAlign: "center" }}>
            {text ? (
              <CheckSquareFilled style={{ color: "green" }} />
            ) : (
              <CloseSquareFilled style={{ color: "red" }} />
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
    {
      title: "",
      key: "actions",
      render: (record: any) => {
        return (
          <Button
            onClick={() => {
              setSelectedOrder(record);
              setOpenModalDetails(true);
            }}
          >
            Xem
          </Button>
        );
      },
    },
    // delete, update
    {
      title: "",
      key: "actions",
      width: "1%",
      render: (record) => {
        return (
          <Space>
            {users.user.roles === "admin" ? (
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
            ) : (
              <Popconfirm
                title="Nhận đơn hàng và vận chuyển?"
                onConfirm={() => {
                  //delete
                  const id = record._id;
                  axiosClient
                    .patch("/orders/" + id, { status: "DELIVERING" })
                    .then((response) => {
                      message.success("Nhận đơn thành công!");
                      setRefresh((pre) => pre + 1);
                    })
                    .catch((err) => {
                      message.error("Nhận đơn thất bại!");
                    });
                  console.log("DELIVERING", record);
                }}
                onCancel={() => {}}
                okText="Có"
                cancelText="Không"
              >
                <Button>Nhận</Button>
              </Popconfirm>
            )}
            {/* delete */}
            {users.user.roles === "admin" ? (
              <Popconfirm
                title="Bạn muốn giao đơn hàng cho nhân viên khác không?"
                onConfirm={() => {
                  //Cancel order
                  const id = record._id;
                  axiosClient
                    .patch("/orders/" + id, {
                      employee_id: null,
                      status: "WAIT FOR CONFIRMATION",
                    })
                    .then((response) => {
                      message.success("Hủy đơn hàng thành công!");
                      setRefresh((pre) => pre + 1);
                    })
                    .catch((err) => {
                      message.error("Hủy đơn hàng thất bại!");
                    });
                  console.log("Cancel order", record);
                }}
                onCancel={() => {}}
                okText="Có"
                cancelText="Không"
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Bạn sẽ không nhận vận chuyển đơn hàng này?"
                onConfirm={() => {
                  //Cancel order
                  const id = record._id;
                  axiosClient
                    .patch("/orders/" + id, {
                      employee_id: null,
                      status: "WAIT FOR CONFIRMATION",
                    })
                    .then((response) => {
                      message.success("Hủy đơn hàng thành công!");
                      setRefresh((pre) => pre + 1);
                    })
                    .catch((err) => {
                      message.error("Hủy đơn hàng thất bại!");
                    });
                  console.log("Cancel order", record);
                }}
                onCancel={() => {}}
                okText="Có"
                cancelText="Không"
              >
                <Button danger>Hủy</Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  // Order have status == "DELIVERING"
  const shippingColumns = [
    {
      title: "Khách hàng",
      dataIndex: "full_name",
      key: "full_name",
      render: (text: string) => {
        return <p>{text}</p>;
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
      render: (text: string) => {
        return <p>{text}</p>;
      },
    },
    {
      title: "Vận chuyển",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        return renderStatus(text);
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (text: boolean) => {
        return (
          <p style={{ textAlign: "center" }}>
            {text ? (
              <CheckSquareFilled style={{ color: "green" }} />
            ) : (
              <CloseSquareFilled style={{ color: "red" }} />
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
    {
      title: "",
      key: "actions",
      render: (record: any) => {
        return (
          <Button
            onClick={() => {
              setOpenModalDetails(true);
              setSelectedOrder(record);
            }}
          >
            Xem
          </Button>
        );
      },
    },
    {
      title: "",
      key: "actions",
      width: "1%",
      render: (record) => {
        return (
          <Space>
            {users.user.roles === "admin" ? (
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
            ) : (
              <Button
                onClick={() => {
                  setSelectedRecord(record);
                  console.log("selectes", record);
                  setIsOpenFormAccept(true);
                }}
              >
                Xác Nhận
              </Button>
            )}
            {/* delete */}
            {users.user.roles === "admin" ? (
              <Popconfirm
                title="Bạn muốn giao đơn hàng cho nhân viên khác không?"
                onConfirm={() => {
                  //Cancel order
                  const id = record._id;
                  axiosClient
                    .patch("/orders/" + id, {
                      employee_id: null,
                      status: "WAIT FOR CONFIRMATION",
                    })
                    .then((response) => {
                      message.success("Hủy đơn hàng thành công!");
                      setRefresh((pre) => pre + 1);
                    })
                    .catch((err) => {
                      message.error("Hủy đơn hàng thất bại!");
                    });
                  console.log("Cancel order", record);
                }}
                onCancel={() => {}}
                okText="Có"
                cancelText="Không"
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            ) : (
              <></>
            )}
          </Space>
        );
      },
    },
  ];

  // Order have status == "DELIVERED"
  const shippedColumns = [
    {
      title: "Khách hàng",
      dataIndex: "full_name",
      key: "full_name",
      render: (text: string) => {
        return <p>{text}</p>;
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
      render: (text: string) => {
        return <p>{text}</p>;
      },
    },
    {
      title: "Vận chuyển",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        return renderStatus(text);
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (text: boolean) => {
        return (
          <p style={{ textAlign: "center" }}>
            {text ? (
              <CheckSquareFilled style={{ color: "green" }} />
            ) : (
              <CloseSquareFilled style={{ color: "red" }} />
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
    {
      title: "",
      key: "actions",
      render: (record: any) => {
        return (
          <Button
            onClick={() => {
              setOpenModalDetails(true);
              setSelectedOrder(record);
            }}
          >
            Xem
          </Button>
        );
      },
    },
    {
      title: "",
      key: "actions",
      width: "1%",
      render: (record) => {
        return (
          <Space>
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
          </Space>
        );
      },
    },
  ];

  // update form
  const [updateForm] = Form.useForm();
  const [acceptForm] = Form.useForm();

  // update form
  // xử lý cập nhật thông tin
  const onUpdateFinish = (values) => {
    axiosClient
      .patch("/orders/" + selectedRecord._id, values)
      .then((response) => {
        message.success("Cập nhật thành công ❤");
        updateForm.resetFields();
        // load lại form
        setRefresh((pre) => pre + 1);
        // đóng
        setEditFormVisible(false);
        console.log();
      })
      .catch((err) => {
        message.error("Cập nhật thất bại 😥");
      });
    console.log("❤", values);
  };
  const onUpdateFinishFailed = (errors) => {
    console.log("💣", errors);
  };

  // accept delivery progress ship form
  const onDeliverySuccess = (values) => {
    const { file } = values;
    axiosClient
      .patch("/orders/" + selectedRecord._id, {
        file,
        status: "DELIVERED",
        payment_status: true,
        shipped_date: Date.now(),
      })
      .then((response) => {
        const { _id } = response.data;
        const formData = new FormData();
        formData.append("file", file.file);
        // console.log(file.file);
        axios
          .post(`${API_URL}/upload/orders/${_id}`, formData)
          .then((response) => {
            console.log("ok");
            setRefresh((f) => f + 1);
            setIsOpenFormAccept(false);
            message.success("Xác nhận giao hàng thành công!");
          })
          .catch((err) => {
            message.error("Tải lên hình ảnh thất bại!");
          });
      })
      .catch((err) => {
        console.log(err);
        message.error("Cập nhật thất bại 😥");
      });
    console.log("❤", values);
  };
  const onDeliverySuccessFailed = (errors) => {
    console.log("💣", errors);
  };

  return (
    <div>
      <h1 className="p-2 mb-5 text-xl">📦 Đơn Hàng Chờ Vận Chuyển</h1>
      {/* Modal view detail order */}
      <Modal
        width={"60%"}
        centered
        title="Chi tiết đơn hàng"
        open={openModalOrderDetails}
        onOk={() => {
          setOpenModalDetails(false);
        }}
        onCancel={() => {
          setOpenModalDetails(false);
        }}
        okText="Tiếp tục"
        cancelText="Đóng"
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
                  <CheckSquareFilled style={{ color: "green" }} />
                ) : (
                  <CloseSquareFilled style={{ color: "red" }} />
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
      {/* Table view order have status == "COMFIRMED ORDER" */}
      <Table rowKey="_id" dataSource={orders} columns={columns} />
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
              className=""
              label="Ngày tạo"
              name="createdAt"
              rules={[{ required: false }]}
            >
              <Input disabled />
            </Form.Item>

            {/* Status */}
            <Form.Item
              hasFeedback
              className=""
              label="Vận chuyển"
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
                    value: "WAITING FOR PICKUP",
                    label: "Chờ lấy hàng",
                  },
                  {
                    value: "DELIVERING",
                    label: "Đang giao",
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

            {/* Shipping Address */}
            <Form.Item
              hasFeedback
              className=""
              label="Địa chỉ giao hàng"
              name="shipping_address"
              rules={[{ required: true, message: "Không thể để trống!" }]}
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
              rules={[{ required: true, message: "Không thể để trống!" }]}
            >
              <Input />
            </Form.Item>
            {/* PhoneNumber */}
            <Form.Item
              className=""
              label="Số điện thoại"
              name="phoneNumber"
              rules={[{ required: true, message: "Không thể để trống!" }]}
            >
              <Input />
            </Form.Item>
            {/* Employee */}
            <Form.Item
              label="Nhân viên"
              name="employee_id"
              rules={[{ required: true, message: "Please selected empoyees!" }]}
            >
              <Select
                disabled={selectedRecord?.employee_id}
                options={
                  employees &&
                  employees.map((employee) => {
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
      {/* Table view order have status == "COMFIRMED ORDER" */}
      <h3>🛵 Đơn Hàng Đang Vận Chuyển</h3>
      <Table
        rowKey="_id"
        dataSource={orderShipping}
        columns={shippingColumns}
      />
      {/* form accept DELIVERED */}
      <Modal
        open={isOpenFormAccept}
        title="Xác nhận đã giao hàng"
        onOk={() => {
          acceptForm.submit();
        }}
        onCancel={() => {
          setIsOpenFormAccept(false);
        }}
        okText="Lưu thông tin"
        cancelText="Đóng"
      >
        <Form
          form={acceptForm}
          name="accept-form"
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 16 }}
          onFinish={onDeliverySuccess}
          onFinishFailed={onDeliverySuccessFailed}
          autoComplete="off"
        >
          <div className="w-[80%]">
            <Form.Item
              label="Hình ảnh xác nhận"
              name="file"
              rules={[
                {
                  required: true,
                  message: "Hình ảnh xác nhận không được để trống!",
                },
              ]}
            >
              <Upload
                showUploadList={true}
                beforeUpload={(file) => {
                  setFile(file);
                  return false;
                }}
              >
                <Button>
                  <UploadOutlined size={20} />
                </Button>
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Modal>
      <h3>✅ Đơn Hàng Đã Vận Chuyển</h3>
      <Table rowKey="_id" dataSource={orderShipped} columns={shippedColumns} />
    </div>
  );
}
