import { useState, useEffect, useRef } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputRef,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Upload,
  message,
} from "antd";
import style from "./employees.module.css";
import { axiosClient } from "../../../libraries/axiosClient";
import CustomForm from "../../../components/common/CustomForm";
import axios from "axios";
import { API_URL } from "../../../constants/URLS";
import {
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
// import { addedAttribute } from "../../../utils/AddAttributeToColumns";
import moment from "moment";
import Highlighter from "react-highlight-words";
import type { ColumnType, ColumnsType } from "antd/es/table";
import { IEmployees } from "../../../interfaces/Employees";
import { FilterConfirmProps } from "antd/es/table/interface";
import { FaTrashRestore } from "react-icons/fa";
import { useUser } from "../../../hooks/useUser";
export default function Employees() {
  const [employees, setEmployees] = useState<IEmployees[]>([]);
  const [isEmployees, setIsEmployees] = useState<IEmployees[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IEmployees>({});
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [editFormDelete, setEditFormDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkInputPassword, setCheckInputPassword] = useState(undefined);
  // File
  const [file, setFile] = useState<any>();
  //State search
  type DataIndex = keyof IEmployees;
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  // Form
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  //
  const { users } = useUser((state) => state) as any;
  const userString = localStorage.getItem("user-storage");
  const user = userString ? JSON.parse(userString) : null;

  // Tạo một hàm để kiểm tra mật khẩu có đáp ứng các tiêu chí bảo mật cao hay không
  const validatePassword = (rule, value, callback) => {
    // Tạo một regex để kiểm tra mật khẩu có chứa ít nhất một chữ cái hoa, một chữ cái thường, một số và một ký tự đặc biệt
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).+$/;

    // Nếu mật khẩu không khớp với regex, gọi callback với thông báo lỗi
    if (!passwordRegex.test(value)) {
      callback(
        "Mật khẩu phải có ít nhất một chữ cái hoa, một chữ cái thường, một số và một ký tự đặc biệt!"
      );
    } else {
      // Nếu mật khẩu khớp với regex, gọi callback với tham số trống
      callback();
    }
  };

  useEffect(() => {
    axiosClient
      .get("/employees", {
        headers: {
          access_token: `Bearer ${window.localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        const filteredEmployees = response.data.filter(
          (employees: IEmployees) => {
            return employees.is_delete === false;
          }
        );
        setEmployees(filteredEmployees);
      })
      .catch((err) => {
        console.log(err);
        message.error(err.response.data);
      });
  }, [refresh]);
  useEffect(() => {
    axiosClient
      .get("/employees", {
        headers: {
          access_token: `Bearer ${window.localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        const filterIsDeleteEmployees = response.data.filter(
          (employees: IEmployees) => {
            return employees.is_delete === true;
          }
        );
        setIsEmployees(filterIsDeleteEmployees);
      })
      .catch((err) => {
        console.log(err);
        message.error(err.response.data);
      });
  }, [refresh]);
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
  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<IEmployees> => ({
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
  const columns: ColumnsType<IEmployees> = [
    {
      title: "Tên",
      dataIndex: "full_name",
      key: "full_name",
      ...getColumnSearchProps("full_name"),
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
                style={{ maxWidth: 150, width: "10%", minWidth: 50 }}
                src={`${text}`}
                alt="avatar"
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
      ...getColumnSearchProps("email"),
    },
    {
      title: "SĐT",
      dataIndex: "phone_number",
      key: "phone_number",
      ...getColumnSearchProps("phone_number"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ...getColumnSearchProps("address"),
    },
    {
      title: "Ngày sinh",
      dataIndex: "birth_day",
      key: "birth_day",
    },
    {
      title: "",
      key: "actions",
      render: (record) => {
        const { password, birth_day, ...restOfRecord } = record;
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
                  // const formattedBirthday = moment(
                  //   record.birth_day,
                  //   "YYYY-MM-DD HH:mm:ss"
                  // );
                  const updatedRecord = {
                    ...restOfRecord,
                    createdAt: formattedCreatedAt,
                    updatedAt: formattedUpdatedAt,
                    // birth_day: formattedBirthday,
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
                    .patch(
                      "/employees/" + id,
                      { is_delete: true },
                      {
                        headers: {
                          access_token: `Bearer ${window.localStorage.getItem(
                            "access_token"
                          )}`,
                        },
                      }
                    )
                    .then(() => {
                      // Gửi yêu cầu xóa ảnh từ Cloudinary
                      message.success("Xóa thành công!");
                      setRefresh((f) => f + 1);
                    })
                    .catch((err) => {
                      console.log(err);
                      message.error("Xóa thất bại!");
                      message.error(err.response.data);
                      message.error(err.response.data.msg);
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
  const isDeleteColumns: ColumnsType<IEmployees> = [
    {
      title: "",
      dataIndex: "avatar",
      key: "avatar",
      render: (text) => {
        return (
          <div style={{ textAlign: "center" }}>
            {text && (
              <img
                style={{ maxWidth: 150, width: "40%", minWidth: 70 }}
                src={`${text}`}
                alt="image_category"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Tên",
      dataIndex: "full_name",
      key: "full_name",
      ...getColumnSearchProps("full_name"),
    },
    {
      title: "",
      key: "actions",
      render: (record) => {
        return (
          <div>
            <Space>
              {/* Button Edit */}
              {/* Button Delete */}
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                title="Bạn có chắc muốn xóa vĩnh viễn nhân viên này không?"
                onConfirm={() => {
                  const id = record._id;
                  axiosClient
                    .delete("/employees/" + id, {
                      headers: {
                        access_token: `Bearer ${window.localStorage.getItem(
                          "access_token"
                        )}`,
                      },
                    })
                    .then(() => {
                      // Gửi yêu cầu xóa ảnh từ Cloudinary
                      message.success("Xóa thành công!");
                      setRefresh((f) => f + 1);
                    })
                    .catch((err) => {
                      console.log(err);
                      message.error("Xóa thất bại!");
                      message.error(err.response.data);
                      message.error(err.response.data.msg);
                    });
                }}
                okText="Có"
                cancelText="Không"
              >
                <Button danger icon={<DeleteOutlined />}></Button>
              </Popconfirm>
              <Button
                onClick={() => {
                  const id = record._id;
                  console.log("id", id);
                  axiosClient
                    .patch(
                      "/employees/" + id,
                      { is_delete: false },
                      {
                        headers: {
                          access_token: `Bearer ${window.localStorage.getItem(
                            "access_token"
                          )}`,
                        },
                      }
                    )
                    .then((response) => {
                      setRefresh((f) => f + 1);
                    })
                    .catch((err) => {
                      console.log(err);
                      message.error("Thất bại !!!");
                    });
                }}
                className=""
              >
                <FaTrashRestore size={"16px"} style={{ marginRight: "5px" }} />
                Restore
              </Button>
            </Space>
          </div>
        );
      },
    },
  ];
  // addedAttribute(columnEmployees, columns);
  const phoneValidator = (rule: any, value: any, callback: any) => {
    const phoneNumberPattern =
      /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
    if (value && !phoneNumberPattern.test(value)) {
      callback("Số điện thoại không hợp lệ!");
    } else {
      callback();
    }
  };
  const employeesFields = [
    {
      name: "first_name",
      label: "Họ",
      rules: [
        {
          required: true,
          message: "Họ không được để trống!",
        },
      ],
      component: <Input />,
    },
    {
      name: "last_name",
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
    {
      name: "email",
      label: "Email",
      rules: [
        {
          required: true,
          message: "Email không được để trống!",
        },
        { type: "email", message: "Email không hợp lệ!" },
      ],
      component: <Input />,
    },
    {
      name: "isPassword",
      label: "Đổi mật khẩu",
      noStyle: createFormVisible ? true : editFormVisible ? false : true,
      component: (
        <Switch
          style={{
            display: createFormVisible ? "none" : editFormVisible ? "" : "none",
          }}
          onClick={() => {
            setShowPassword(!showPassword);
          }}
        />
      ),
    },
    {
      name: "password",
      label: "Mật khẩu",
      rules: showPassword
        ? [
            {
              required: true,
              message: "Mật khẩu không được để trống!",
            },
            {
              min: 5,
              max: 50,
              message: "Độ dài mật khẩu từ 5-50 kí tự",
            },
            {
              validator: validatePassword,
            },
          ]
        : "",
      noStyle: createFormVisible ? false : showPassword ? false : true,
      component: (
        <Input.Password
          style={{
            display: createFormVisible ? "" : showPassword ? "" : "none",
          }}
        />
      ),
    },
    {
      name: "phone_number",
      label: "SĐT",
      rules: [
        { required: true, message: "Số điện thoại không được để trống!" },
        {
          validator: phoneValidator,
        },
      ],
      component: <Input maxLength={10} />,
    },
    {
      name: "address",
      label: "Địa chỉ",
      rules: [
        {
          required: true,
          message: "Địa chỉ không được để trống!",
        },
      ],
      component: <Input />,
    },
    {
      name: "birth_day",
      label: "Ngày sinh",
      rules: [
        {
          required: false,
        },
      ],
      component: <DatePicker format={"YYYY/MM/DD - HH:mm:ss"} />,
    },
    {
      name: "active",
      label: "Trạng thái",
      noStyle: createFormVisible ? true : editFormVisible ? false : true,
      component: (
        <Select
          style={{
            display: createFormVisible ? "none" : editFormVisible ? "" : "none",
          }}
          allowClear
          options={[
            {
              value: "true",
              label: "Kích hoạt",
            },
            {
              value: "false",
              label: "Thu hồi",
            },
          ]}
        />
      ),
    },
    {
      name: "roles",
      label: "Quyền",
      component: (
        <Select
          allowClear
          options={[
            {
              value: "sales",
              label: "Nhân viên bán hàng",
            },
            {
              value: "shipper",
              label: "Nhân viên vận chuyển",
            },
            {
              value: "admin",
              label: "Quản trị viên",
            },
          ]}
        />
      ),
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
  const onFinish = (values: any) => {
    axiosClient
      .post("/employees", values, {
        headers: {
          access_token: `Bearer ${window.localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        if (values.file !== undefined) {
          //UPLOAD FILE
          const { _id } = response.data;
          const formData = new FormData();
          formData.append("file", file);
          axios
            .post(`${API_URL}/upload/employees/${_id}`, formData)
            .then((response) => {
              message.success("Tải lên hình ảnh thành công!");
              // createForm.resetFields();
            })
            .catch((err) => {
              message.error("Tải lên hình ảnh thất bại!");
              console.log(err);
            });
        }
        createForm.resetFields();
        setRefresh((f) => f + 1);
        message.success("Thêm mới thành công!");
      })
      .catch((err) => {
        message.error("Thêm mới thất bại!");
        message.error(err.response.data.msg);
        console.log(err);
      });
    console.log("👌👌👌", values);
  };
  const onFinishFailed = (errors: object) => {
    console.log("💣💣💣 ", errors);
  };
  const onUpdateFinish = async (values: any) => {
    const { password, ...restOfValues } = values;
    let valuesUpdated = password === undefined ? { ...restOfValues } : values;
    await axiosClient
      .patch("/employees/" + selectedRecord._id, valuesUpdated, {
        headers: {
          access_token: `Bearer ${window.localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        if (values.file !== undefined) {
          //UPLOAD FILE
          const { _id } = response.data;
          const formData = new FormData();
          formData.append("file", file);
          axios
            .post(`${API_URL}/upload/employees/${_id}`, formData)
            .then((response) => {
              message.success("Cập nhật ảnh thành công!");
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
        message.error(err.response.data.msg);
        message.error(err.response.data);
        console.log(err);
      });
  };
  const onUpdateFinishFailed = (errors: object) => {
    console.log("💣💣💣 ", errors);
  };
  return (
    <div>
      <h1>Danh sách nhân viên</h1>
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
          Thêm nhân viên
        </Button>
        <Button
          disabled={user?.state?.users?.user?.roles ? false : true}
          danger
          onClick={() => {
            setEditFormDelete(true);
          }}
        >
          Các nhân viên đã xóa
        </Button>
      </div>
      {/* Cteate Form */}
      <Modal
        centered
        open={createFormVisible}
        title="Thêm mới nhân viên"
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
          fields={employeesFields}
        />
      </Modal>
      {/* Update Form */}
      <Modal
        centered
        title="Chỉnh sửa nhân viên"
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
          fields={employeesFields}
        />
      </Modal>
      <Table rowKey={"_id"} dataSource={employees} columns={columns} />
      <Modal
        width={"50%"}
        open={editFormDelete}
        onCancel={() => {
          setEditFormDelete(false);
        }}
      >
        <Table
          rowKey={"_id"}
          dataSource={isEmployees}
          columns={isDeleteColumns}
        />
      </Modal>
    </div>
  );
}
