import { useState, useEffect, useRef } from "react";
import { axiosClient } from "../../../libraries/axiosClient";
import { ICategory } from "../../../interfaces/Category";
import type { ColumnType, ColumnsType } from "antd/es/table";
import {
  Table,
  Button,
  Popconfirm,
  Form,
  Input,
  Modal,
  message,
  Upload,
  Space,
  DatePicker,
  InputRef,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import CustomForm from "../../../components/common/CustomForm";
import style from "./categories.module.css";
import moment from "moment";
import axios from "axios";
import { API_URL } from "../../../constants/URLS";
import { IAccumulated } from "../../../interfaces/Accumulated";
export default function Accumulated() {
  const [accumulated, setAccumulated] = useState<IAccumulated[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ICategory>({});
  const [createFormVisible, setCreateFormVisible] = useState(false);
  // File
  const [file, setFile] = useState<any>();
  // Form
  const [updateForm] = Form.useForm();
  useEffect(() => {
    axiosClient
      .get("/accumulateds")
      .then((response) => {
        setAccumulated(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [refresh]);

  const columns: ColumnsType<ICategory> = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phần trăm tích lũy",
      dataIndex: "percent",
      key: "percent",
      render: (text) => {
        return <div>{text}%</div>;
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
                    createdAt: formattedCreatedAt,
                    updatedAt: formattedUpdatedAt,
                  };
                  setSelectedRecord(updatedRecord);
                  updateForm.setFieldsValue(updatedRecord);
                  setEditFormVisible(true);
                }}
                icon={<EditOutlined />}
              ></Button>
            </Space>
          </div>
        );
      },
    },
  ];
  // addedAttribute(columnCategories, columns);
  // Handle Form
  const AccumulatedField = [
    {
      name: "name",
      label: "Tên",
      rules: [
        {
          required: true,
          message: "Tên không được để trống!",
        },
      ],
      component: <Input />,
    },
    {
      name: "percent",
      label: "Phần trăm",
      rules: [
        {
          required: true,
          message: "Tên không được để trống!",
        },
      ],
      component: <Input />,
    },

    {
      name: "createdAt",
      label: "Ngày tạo",
      noStyle: createFormVisible ? true : editFormVisible ? false : true,
      //muốn input trong antd không hiện thị lên thì cần thuộc tính noStyle: true (của antd) và style={display:none} (của css)
      component: (
        <DatePicker
          style={{
            display: createFormVisible ? "none" : editFormVisible ? "" : "none",
          }}
          disabled
          format={"YYYY/MM/DD-HH:mm:ss"}
        />
      ),
    },
    {
      name: "updatedAt",
      label: "Ngày sửa",
      noStyle: createFormVisible ? true : editFormVisible ? false : true,
      // component: <Input disabled type={createFormVisible ? `hidden` : ``} />,
      component: (
        <DatePicker
          style={{
            display: createFormVisible ? "none" : editFormVisible ? "" : "none",
          }}
          disabled
          format={"YYYY/MM/DD-HH:mm:ss"}
        />
      ),
    },
  ];

  const onUpdateFinish = (values: any) => {
    axiosClient
      .patch("/accumulateds/" + selectedRecord._id, values)
      .then((response) => {
        updateForm.resetFields();
        setEditFormVisible(false);
        setRefresh((f) => f + 1);
        message.success("Cập nhật thành công!");
      })
      .catch((err) => {
        message.error("Cập nhật thất bại!");
        message.error(err.response.data.msg);
        console.log(err);
      });
  };
  const onUpdateFinishFailed = (errors: object) => {
    console.log("💣💣💣 ", errors);
  };

  return (
    <div>
      {/* Update Form */}
      <Modal
        centered
        title="Chỉnh sửa tích lũy"
        open={editFormVisible}
        onOk={() => {
          updateForm.submit();
        }}
        onCancel={() => {
          setEditFormVisible(false);
        }}
        okText="Lưu"
        cancelText="Đóng"
      >
        <CustomForm
          form={updateForm}
          formName={"update-form"}
          onFinish={onUpdateFinish}
          onFinishFailed={onUpdateFinishFailed}
          fields={AccumulatedField}
        />
      </Modal>
      <Table rowKey={"_id"} dataSource={accumulated} columns={columns} />
    </div>
  );
}
