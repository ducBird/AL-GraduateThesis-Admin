import React, { useEffect, useState } from "react";
import { IVouchers } from "../../../interfaces/Vouchers";
import { ColumnsType } from "antd/es/table";
import {
  Button,
  Form,
  Popconfirm,
  Space,
  message,
  Table,
  Modal,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Upload,
} from "antd";
import moment from "moment";
import {
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { axiosClient } from "../../../libraries/axiosClient";
import style from "./vouchers.module.css";
import CustomForm from "../../../components/common/CustomForm";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import { API_URL } from "../../../constants/URLS";

function Vouchers() {
  const [vouchers, setVouchers] = useState<IVouchers[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<IVouchers>({});
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [editFormDelete, setEditFormDelete] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  // File
  const [file, setFile] = useState<any>();
  // Form
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  console.log("selectedRecord", selectedRecord);
  useEffect(() => {
    axiosClient
      .get("/vouchers")
      .then((response) => {
        setVouchers(response.data);
      })
      .catch((err) => {
        message.error(err.response.data);
        console.log(err);
      });
  }, [refresh]);

  // columns vouchers
  const columns: ColumnsType<IVouchers> = [
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      key: "image_url",
      render: (text) => {
        return (
          <div style={{ textAlign: "center" }}>
            {text && (
              <img
                style={{ maxWidth: 150, width: "30%", minWidth: 70 }}
                src={`${text}`}
                alt="image_voucher"
              />
            )}
          </div>
        );
      },
    },
    { title: "Tên vouchers", dataIndex: "name", key: "name" },
    { title: "Giá", dataIndex: "price", key: "price" },
    {
      title: "Phần trăm",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (text) => {
        return <div>{text} %</div>;
      },
    },
    {
      title: "Giá giảm tối đa",
      dataIndex: "maxDiscountAmount",
      key: "maxDiscountAmount",
      render: (text) => {
        return <div>{text} %</div>;
      },
    },
    {
      title: "Giá đơn hàng tối thiểu",
      dataIndex: "minimumOrderAmount",
      key: "minimumOrderAmount",
      render: (text) => {
        return <div>{text} %</div>;
      },
    },
    // {
    //   title: "Điều kiện",
    //   dataIndex: "condition",
    //   key: "condition",
    // },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "expirationDate",
      key: "expirationDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (text, record) => {
        console.log(text); // Giá trị của trường isActive
        if (text) {
          return <span style={{ color: "green" }}>Đang hoạt động</span>;
        } else {
          return <span style={{ color: "red" }}>Không hoạt động</span>;
        }
      },
    },

    {
      title: "",
      key: "actions",
      render: (record) => {
        return (
          <div>
            <Space>
              {/* Button Edit */}
              <Button
                onClick={() => {
                  const startDate = new Date(record.startDate);
                  const expirationDate = new Date(record.expirationDate);
                  // console.log("startDate", startDate);
                  // console.log("expirationDate", expirationDate);
                  // console.log("createdAt", record.createdAt);
                  // console.log("updatedAt", record.updatedAt);
                  const formatedStartDate = moment(startDate).format(
                    "YYYY/MM/DD HH:mm:ss"
                  );
                  const formatedExpirationDate = moment(expirationDate).format(
                    "YYYY/MM/DD HH:mm:ss"
                  );
                  // console.log("startDate format", formatedStartDate);
                  // console.log("expirationDate format", formatedExpirationDate);
                  const formattedCreatedAt = moment(
                    record.createdAt,
                    "YYYY-MM-DD HH:mm:ss"
                  );
                  const formattedUpdatedAt = moment(
                    record.updatedAt,
                    "YYYY-MM-DD HH:mm:ss"
                  );
                  const updatedRecord = {
                    ...record,
                    startDate: formatedStartDate,
                    expirationDate: formatedExpirationDate,
                    createdAt: formattedCreatedAt,
                    updatedAt: formattedUpdatedAt,
                  };
                  setSelectedRecord(updatedRecord);
                  updateForm.setFieldsValue(updatedRecord);
                  setEditFormVisible(true);
                }}
                icon={<EditOutlined />}
              ></Button>
              {/* Button Delete */}
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                title="Bạn có chắc chắn muốn xóa?"
                onConfirm={() => {
                  const id = record._id;
                  axiosClient
                    .delete("/vouchers/" + id)
                    .then(() => {
                      message.success("Xóa thành công!");
                      setRefresh((f) => f + 1);
                    })
                    .catch((err: any) => {
                      console.log(err);
                      message.error("Xóa thất bại!");
                      message.error(err.response.data);
                    });
                }}
                okText="Có"
                cancelText="Không"
              >
                <Button danger icon={<DeleteOutlined />}></Button>
              </Popconfirm>
            </Space>
          </div>
        );
      },
    },
  ];

  // voucher field
  const voucherField = [
    {
      name: "isActive",
      label: "Trạng thái hoạt động",
      rules: [
        {
          required: true,
          message: "Trạng thái hoạt động không được để trống!",
        },
      ],
      initialValue: false,
      component: (
        <Switch
          style={{ width: "60px" }}
          checked={
            editFormVisible && selectedRecord.isActive
              ? selectedRecord.isActive
              : isActive
          }
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          onChange={() => {
            setIsActive(
              editFormVisible && selectedRecord.isActive === true
                ? !selectedRecord.isActive
                : !isActive
            );
          }}
        />
      ),
    },
    {
      name: "isFreeShipping",
      label: "Loại vouchers",
      rules: [
        {
          required: true,
          message: "Miễn phí vận chuyển không được để trống!",
        },
      ],
      initialValue: false,
      component: (
        <Switch
          style={{ width: "150px" }}
          checked={
            editFormVisible ? selectedRecord.isFreeShipping : isFreeShipping
          }
          checkedChildren="Voucher free ship"
          unCheckedChildren="Voucher giảm giá"
          onChange={() => {
            setIsFreeShipping(!isFreeShipping);
          }}
          disabled={editFormVisible}
        />
      ),
    },
    {
      name: "name",
      label: "Tên voucher",
      rules: [
        {
          required: true,
          message: "Tên không được để trống!",
        },
      ],
      component: <Input />,
    },
    {
      name: "price",
      label: "Giá",
      initialValue: undefined,
      noStyle:
        selectedRecord.isFreeShipping === true && editFormVisible
          ? false
          : isFreeShipping
          ? false
          : true,
      rules: [
        {
          required:
            selectedRecord.isFreeShipping === true && editFormVisible
              ? true
              : isFreeShipping
              ? true
              : false,
          message:
            selectedRecord.isFreeShipping === true && editFormVisible
              ? "Giá giảm không được để trống!"
              : isFreeShipping
              ? "Giá giảm không được để trống!"
              : "",
        },
      ],
      component: (
        <InputNumber
          style={{
            display:
              selectedRecord.isFreeShipping === true && editFormVisible
                ? ""
                : isFreeShipping
                ? ""
                : "none",
            width: "200px",
          }}
        />
      ),
    },
    {
      name: "discountPercentage",
      label: "Phần trăm giảm",
      initialValue: undefined,
      noStyle:
        selectedRecord.isFreeShipping === true && editFormVisible
          ? true
          : isFreeShipping
          ? true
          : false,
      rules: [
        {
          required:
            selectedRecord.isFreeShipping === true && editFormVisible
              ? false
              : !isFreeShipping
              ? true
              : false,
          message: !isFreeShipping ? "Phần trăm giảm không được để trống!" : "",
        },
      ],
      component: (
        <InputNumber
          style={{
            display:
              selectedRecord.isFreeShipping === true
                ? "none"
                : !isFreeShipping
                ? ""
                : "none",
            width: "200px",
          }}
        />
      ),
    },
    {
      name: "maxDiscountAmount",
      label: "Giá giảm tối đa",
      initialValue: undefined,
      noStyle:
        selectedRecord.isFreeShipping === true && editFormVisible
          ? true
          : isFreeShipping
          ? true
          : false,
      rules: [
        {
          required:
            selectedRecord.isFreeShipping === true && editFormVisible
              ? false
              : !isFreeShipping
              ? true
              : false,
          message: !isFreeShipping
            ? "Giá giảm tối đa không được để trống!"
            : "",
        },
      ],
      component: (
        <InputNumber
          style={{
            display:
              selectedRecord.isFreeShipping === true
                ? "none"
                : !isFreeShipping
                ? ""
                : "none",
            width: "200px",
          }}
        />
      ),
    },
    {
      name: "minimumOrderAmount",
      label: "Giá đơn hàng tối thiểu",
      rules: [
        {
          required: true,
          message: "Giá giảm tối đa không được để trống!",
        },
      ],
      component: <InputNumber style={{ width: "200px" }} />,
    },
    {
      name: "condition",
      label: "Điều kiện",
      component: <TextArea rows={3} />,
    },
    {
      name: "startDate",
      label: "Ngày bắt đầu",
      rules: [
        {
          required: true,
          message: "Ngày bắt đầu không được để trống!",
        },
      ],
      // component: <DatePicker format={"YYYY/MM/DD-HH:mm:ss"} />,
      component: <Input />,
    },
    {
      name: "expirationDate",
      label: "Ngày kết thúc",
      rules: [
        {
          required: true,
          message: "Ngày kết thúc không được để trống!",
        },
      ],
      // component: <DatePicker format={"YYYY/MM/DD-HH:mm:ss"} />,
      component: <Input />,
    },
    {
      name: "file",
      label: "Hình ảnh",
      component: (
        <Upload
          showUploadList={true}
          beforeUpload={(file) => {
            setFile(file);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
        </Upload>
      ),
    },
  ];

  // create
  const onFinish = (values: any) => {
    axiosClient
      .post("/vouchers", values)
      .then((response) => {
        if (values.file !== undefined) {
          //UPLOAD FILE
          const { _id } = response.data;
          const formData = new FormData();
          formData.append("file", file);
          axios
            .post(`${API_URL}/upload/vouchers/${_id}`, formData)
            .then((response) => {
              message.success("Tải lên hình ảnh thành công!");
            })
            .catch((err) => {
              message.error("Tải lên hình ảnh thất bại!");
              message.error(err.response.data);
              console.log(err);
            });
        }
        createForm.resetFields();
        setRefresh((f) => f + 1);
        message.success("Thêm mới thành công!");
      })
      .catch((err) => {
        message.error("Thêm thất bại!");
      });
    console.log("👌👌👌", values);
  };
  const onFinishFailed = (errors: any) => {
    console.log("💣💣💣 ", errors);
  };

  // update
  const onUpdateFinish = (values: any) => {
    axiosClient
      .patch("/vouchers/" + selectedRecord._id, values)
      .then((response) => {
        if (values.file !== undefined) {
          //UPLOAD FILE
          const { _id } = response.data;
          const formData = new FormData();
          formData.append("file", file);
          axios
            .post(`${API_URL}/upload/vouchers/${_id}`, formData)
            .then((response) => {
              message.success("Tải lên hình ảnh thành công!");
              // createForm.resetFields();
            })
            .catch((err) => {
              message.error("Tải lên hình ảnh thất bại!");
              console.log(err);
            });
        }
        updateForm.resetFields();
        setEditFormVisible(false);
        setRefresh((f) => f + 1);
        message.success("Cập nhật thành công!");
      })
      .catch((err) => {
        message.error("Cập nhật thất bại!");
        message.error(err.response.data);
        console.log(err);
      });
  };
  const onUpdateFinishFailed = (errors: object) => {
    console.log("💣💣💣 ", errors);
  };
  return (
    <div>
      <h1>Danh sách vouchers</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "10px 0",
        }}
      >
        <Button
          className={`${style.custom_button}`}
          onClick={() => {
            setCreateFormVisible(true);
          }}
        >
          Thêm vouchers
        </Button>
      </div>
      {/* Cteate Form */}
      <Modal
        centered
        open={createFormVisible}
        title="Thêm mới danh mục"
        onOk={() => {
          createForm.submit();
        }}
        onCancel={() => {
          setCreateFormVisible(false);
        }}
        okText="Lưu"
        cancelText="Đóng"
      >
        <CustomForm
          form={createForm}
          formName={"create-form"}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          fields={voucherField}
        />
      </Modal>

      {/* Update Form */}
      <Modal
        centered
        title="Chỉnh sửa vouchers"
        open={editFormVisible}
        onOk={() => {
          updateForm.submit();
        }}
        onCancel={() => {
          setEditFormVisible(false);
          setSelectedRecord({});
        }}
        okText="Lưu"
        cancelText="Đóng"
      >
        <CustomForm
          form={updateForm}
          formName={"update-form"}
          onFinish={onUpdateFinish}
          onFinishFailed={onUpdateFinishFailed}
          fields={voucherField}
        />
      </Modal>
      <Table rowKey={"_id"} dataSource={vouchers} columns={columns} />
    </div>
  );
}

export default Vouchers;
