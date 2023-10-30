import { useState, useEffect, useRef } from "react";
import { axiosClient } from "../../../libraries/axiosClient";
import { ISubCategory } from "../../../interfaces/SubCategory";
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
  Select,
  InputRef,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnType, ColumnsType } from "antd/es/table";
import style from "./subcategories.module.css";
import CustomForm from "../../../components/common/CustomForm";
import moment from "moment";
import Highlighter from "react-highlight-words";
import { ICategory } from "../../../interfaces/Category";
import {
  getAllSubCategories,
  getAllDeleteSubCategories,
} from "../../../apis/subCategories";
import { getAllCategories } from "../../../apis/categories";
import { FilterConfirmProps } from "antd/es/table/interface";
import axios from "axios";
import { API_URL } from "../../../constants/URLS";
import { FaTrashRestore } from "react-icons/fa";

export default function SubCategories() {
  const [subCategories, setSubCategories] = useState<ISubCategory[]>([]);
  const [subIsDeleteCategories, setSubIsDeleteCategories] = useState<
    ISubCategory[]
  >([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ISubCategory>({});
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [editFormDelete, setEditFormDelete] = useState(false);
  // File
  const [file, setFile] = useState<any>();
  //Search
  type DataIndex = keyof ISubCategory;
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  // Form
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  useEffect(() => {
    const fetchDataSubCategories = async () => {
      try {
        const data = await getAllSubCategories();
        setSubCategories(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDataSubCategories();
  }, [refresh]);

  useEffect(() => {
    const fetchDataDeleteSubCategories = async () => {
      try {
        const data = await getAllDeleteSubCategories();
        setSubIsDeleteCategories(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDataDeleteSubCategories();
  }, [refresh]);
  // get list categories
  useEffect(() => {
    const fetchDataCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDataCategories();
  }, []);
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
  const dataSource = subCategories.map((item) => ({
    ...item,
    categoryName: item.category?.name,
  }));
  const columns: ColumnsType<ISubCategory> = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "",
      dataIndex: "image_url",
      key: "image_url",
      render: (text, record) => {
        return (
          <div style={{ textAlign: "left" }}>
            {text && (
              <img
                style={{
                  maxWidth: 150,
                  width: "30%",
                  minWidth: 70,
                }}
                src={`${text}`}
                alt="image_category"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (text, record) => {
        return <strong>{text}</strong>;
      },
      ...getColumnSearchProps("categoryName"),
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
                    .patch("/sub-categories/" + id, { is_delete: true })
                    .then(() => {
                      message.success("Xóa thành công!");
                      setRefresh((f) => f + 1);
                    })
                    .catch((err) => {
                      console.log(err);
                      message.error("Xóa thất bại!");
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
  const isDeleteColumns: ColumnsType<ISubCategory> = [
    {
      title: "",
      dataIndex: "image_url",
      key: "image_url",
      render: (text, record) => {
        return (
          <div style={{ textAlign: "left" }}>
            {text && (
              <img
                style={{
                  maxWidth: 150,
                  width: "30%",
                  minWidth: 70,
                }}
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
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (text, record) => {
        return <strong>{text}</strong>;
      },
    },
    {
      title: "Chức năng",
      key: "actions",
      render: (record) => {
        return (
          <div>
            <Space>
              {/* Button Delete */}
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                title="Bạn có chắc muốn xóa vĩnh viễn danh mục con này không?"
                onConfirm={() => {
                  const id = record._id;
                  axiosClient
                    .delete("/sub-categories/" + id)
                    .then(() => {
                      message.success("Xóa thành công!");
                      setRefresh((f) => f + 1);
                    })
                    .catch((err) => {
                      console.log(err);
                      message.error("Xóa thất bại!");
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
                    .patch("/sub-categories/" + id, { is_delete: false })
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
  // addedAttribute(columnSubCategories, columns);

  // Handle Form
  const subcategoryField = [
    {
      name: "name",
      label: "Name",
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
      name: "category_id",
      label: "Category",
      rules: [
        {
          required: true,
          message: "Danh mục không được để trống!",
        },
      ],
      component: (
        <Select
          options={
            categories &&
            categories.map((category) => {
              return {
                value: category._id,
                label: category.name,
              };
            })
          }
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
      .post("/sub-categories", values)
      .then((response) => {
        if (values.file !== undefined) {
          //UPLOAD FILE
          const { _id } = response.data;
          const formData = new FormData();
          formData.append("file", file);
          axios
            .post(`${API_URL}/upload/sub-categories/${_id}`, formData)
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
  const onUpdateFinish = (values: any) => {
    axiosClient
      .patch("/sub-categories/" + selectedRecord._id, values)
      .then((response) => {
        if (values.file !== undefined) {
          //UPLOAD FILE
          const { _id } = response.data;
          const formData = new FormData();
          formData.append("file", file);
          axios
            .post(`${API_URL}/upload/sub-categories/${_id}`, formData)
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
        console.log(err);
      });
  };
  const onUpdateFinishFailed = (errors: object) => {
    console.log("💣💣💣 ", errors);
  };

  return (
    <div>
      <h1>SubCategory List</h1>
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
          Thêm danh mục con
        </Button>
        <Button
          danger
          onClick={() => {
            setEditFormDelete(true);
          }}
        >
          Các danh mục con đã xóa
        </Button>
      </div>
      <Modal
        centered
        open={createFormVisible}
        title="Thêm mới danh mục con"
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
          fields={subcategoryField}
        />
      </Modal>
      {/* Update Form */}
      <Modal
        centered
        title="Cập nhật danh mục con"
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
          fields={subcategoryField}
        />
      </Modal>
      <Table rowKey={"_id"} dataSource={dataSource} columns={columns} />
      <Modal
        open={editFormDelete}
        onCancel={() => {
          setEditFormDelete(false);
        }}
      >
        <Table
          rowKey={"_id"}
          dataSource={subIsDeleteCategories}
          columns={isDeleteColumns}
        />
      </Modal>
    </div>
  );
}
