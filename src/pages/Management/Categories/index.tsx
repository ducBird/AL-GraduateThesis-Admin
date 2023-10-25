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
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { columnCategories } from "./columnCategories";
import { addedAttribute } from "../../../utils/AddAttributeToColumns";
import axios from "axios";
import CustomForm from "../../../components/common/CustomForm";
import style from "./categories.module.css";
import moment from "moment";
import Highlighter from "react-highlight-words";
import { API_URL } from "../../../constants/URLS";
// import Highlighter from "react-highlight-words";
import { FilterConfirmProps } from "antd/es/table/interface";
import { useUser } from "../../../hooks/useUser";
import { AiFillDelete, AiFillQuestionCircle } from "react-icons/ai";
import { FaTrashRestore } from "react-icons/fa";
// import Highlighter from "react-highlight-words";
export default function Categories() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isDelete, setIsDelete] = useState<ICategory[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ICategory>({});
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [editFormDelete, setEditFormDelete] = useState(false);
  // File
  const [file, setFile] = useState<any>();
  //Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  type DataIndex = keyof ICategory;
  // Form
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  //
  const { users } = useUser((state) => state) as any;
  const userString = localStorage.getItem("user-storage");
  const user = userString ? JSON.parse(userString) : null;
  useEffect(() => {
    axiosClient
      .get("/categories")
      .then((response) => {
        const filteredCategories = response.data.filter(
          (category: ICategory) => {
            return category.is_delete === false;
          }
        );
        setCategories(filteredCategories);
      })
      .catch((err) => {
        message.error(err.response.data);
        console.log(err);
      });
  }, [refresh]);

  useEffect(() => {
    axiosClient
      .get("/categories")
      .then((response) => {
        const filterIsDeleteCategories = response.data.filter(
          (category: ICategory) => {
            return category.is_delete === true;
          }
        );
        setIsDelete(filterIsDeleteCategories);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [refresh]);
  //search
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
  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<ICategory> => ({
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
          placeholder={`Search ${dataIndex}`}
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
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
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
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
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

  const columns: ColumnsType<ICategory> = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      dataIndex: "image_url",
      key: "image_url",
      render: (text) => {
        return (
          <div style={{ textAlign: "center" }}>
            {text && (
              <img
                style={{ maxWidth: 150, width: "30%", minWidth: 70 }}
                src={`${text}`}
                alt="image_category"
              />
            )}
          </div>
        );
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
              {/* Button Delete */}
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                title="Bạn có chắc chắn muốn xóa?"
                onConfirm={() => {
                  const id = record._id;
                  axiosClient
                    .patch(
                      "/categories/" + id,
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
  const isDeleteColoumn: ColumnsType<ICategory> = [
    {
      dataIndex: "image_url",
      key: "image_url",
      render: (text: any) => {
        return (
          <div style={{ textAlign: "center" }}>
            {text && (
              <img
                style={{ maxWidth: 150, width: "30%", minWidth: 70 }}
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
      dataIndex: "name",
      key: "name",
    },
    {
      title: " Chức năng",
      render: (text: any, record: any) => {
        return (
          <div className="flex">
            <Popconfirm
              icon={<AiFillQuestionCircle size={"24px"} className="" />}
              title="Bạn có chắc muốn xóa vĩnh viễn danh mục này không?"
              onConfirm={() => {
                const id = record._id;
                axiosClient
                  .delete("/categories/" + id, {
                    headers: {
                      access_token: `Bearer ${window.localStorage.getItem(
                        "access_token"
                      )}`,
                    },
                  })
                  //{isDelete:true là mình sẽ lấy giá trị isDelete và xét nó về giá trị true}
                  .then((response) => {
                    message.success("Đã xóa thành công");
                    setRefresh((f) => f + 1);
                  })
                  .catch((err) => {
                    console.log(err);
                    message.error("Thất bại !!!");
                  });
              }}
              okText="Có"
              cancelText="Không"
            >
              <Button danger className=" ">
                {" "}
                <AiFillDelete size={"16px"} style={{ marginRight: "5px" }} />
                Xóa
              </Button>
            </Popconfirm>
            <Button
              onClick={() => {
                const id = record._id;
                console.log("id", id);
                axiosClient
                  .patch(
                    "/categories/" + id,
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
          </div>
        );
      },
    },
    {},
  ];
  // addedAttribute(columnCategories, columns);
  // Handle Form
  const categoryField = [
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
      .post("/categories", values, {
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
            .post(`${API_URL}/upload/categories/${_id}`, formData)
            .then((response) => {
              message.success("Tải lên hình ảnh thành công!");
              // createForm.resetFields();
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
        message.error("Thêm mới thất bại!");
        message.error(err.response.data);
        console.log(err);
      });
    console.log("👌👌👌", values);
  };
  const onFinishFailed = (errors: object) => {
    console.log("💣💣💣 ", errors);
  };
  const onUpdateFinish = (values: any) => {
    axiosClient
      .patch("/categories/" + selectedRecord._id, values, {
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
            .post(`${API_URL}/upload/categories/${_id}`, formData)
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
        // message.error(err.response.data.msg);
        message.error(err.response.data);
        console.log(err);
      });
  };
  const onUpdateFinishFailed = (errors: object) => {
    console.log("💣💣💣 ", errors);
  };
  return (
    <div>
      <h1>Category List</h1>
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
          Thêm danh mục
        </Button>
        <Button
          disabled={user?.state?.users?.user?.roles ? false : true}
          danger
          onClick={() => {
            setEditFormDelete(true);
          }}
        >
          Các danh mục đã xóa
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
          fields={categoryField}
        />
      </Modal>
      {/* Update Form */}
      <Modal
        centered
        title="Chỉnh sửa danh mục"
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
          fields={categoryField}
        />
      </Modal>
      <Table rowKey={"_id"} dataSource={categories} columns={columns} />
      <Modal
        open={editFormDelete}
        onCancel={() => {
          setEditFormDelete(false);
        }}
      >
        <Table rowKey={"_id"} dataSource={isDelete} columns={isDeleteColoumn} />
      </Modal>
    </div>
  );
}
