import { useState, useEffect, useRef } from "react";
import { axiosClient } from "../../../libraries/axiosClient";
import { IProduct } from "../../../interfaces/Product";
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
  InputNumber,
  DatePicker,
  Select,
  InputRef,
  Switch,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import type { ColumnType, ColumnsType } from "antd/es/table";
import { columnProducts } from "./columnProducts";
import { addedAttribute } from "../../../utils/AddAttributeToColumns";
import style from "./products.module.css";
import CustomForm from "../../../components/common/CustomForm";
import moment from "moment";
import Highlighter from "react-highlight-words";
import { ICategory } from "../../../interfaces/Category";
import { ISubCategory } from "../../../interfaces/SubCategory";
import { FilterConfirmProps } from "antd/es/table/interface";
import axios from "axios";
import { API_URL } from "../../../constants/URLS";
import { FaTrashRestore } from "react-icons/fa";
import { useUser } from "../../../hooks/useUser";
import VariantModal from "./VariantModal";
export default function Products() {
  //--- state để render dữ liệu ở columns, productField và xử lý <Select/> trong Form antd ---//
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isProducts, setIsProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [subCategoriesCreateForm, setSubCategoriesCreateForm] = useState<
    ISubCategory[]
  >([]);
  const [subCategoriesUpdateForm, setSubCategoriesUpdateForm] = useState<
    ISubCategory[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState();
  const [selectedRecord, setSelectedRecord] = useState<IProduct>({});
  const [editFormDelete, setEditFormDelete] = useState(false);
  const [productVariants, setProductVariants] = useState<IProduct>({});
  // File
  const [file, setFile] = useState<any>();
  //----------------------------------------------------------------//

  //--- state quản lý đóng mở Modal ---//
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [openModalAttribute, setOpenModalAttribute] = useState(false);
  //----------------------------------------------------------------//

  //--- state xử lý render khi có sự thay đổi ở useEffect ---//
  const [refresh, setRefresh] = useState(0);
  //--- state kiểm tra sản phẩm có biến thể không ---//
  const [isVariant, setIsVariant] = useState(false);
  //----------------------------------------------------------------//
  const { users } = useUser((state) => state) as any;
  const userString = localStorage.getItem("user-storage");
  const user = userString ? JSON.parse(userString) : null;
  const [openVariant, setOpenVariant] = useState(false);
  //State search
  type DataIndex = keyof IProduct;
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  // Form
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [attributeForm] = Form.useForm();

  //gets list products
  useEffect(() => {
    axiosClient
      .get("/products")
      .then((response) => {
        const filteredProducts = response.data.filter((product: IProduct) => {
          return product.is_delete === false;
        });
        setProducts(filteredProducts);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [refresh]);
  useEffect(() => {
    axiosClient
      .get("/products")
      .then((response) => {
        const filterDeleteProducts = response.data.filter(
          (product: IProduct) => {
            return product.is_delete === true;
          }
        );
        setIsProducts(filterDeleteProducts);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [refresh]);
  //gets list categories
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
        console.log(err);
      });
  }, []);
  //get list sub-categories by category_id for createForm
  useEffect(() => {
    if (selectedCategoryId) {
      axiosClient
        .get(`/sub-categories/${selectedCategoryId}`)
        .then((response) => {
          const filteredSubCategories = response.data.filter(
            (subCategory: ISubCategory) => {
              return subCategory.is_delete === false;
            }
          );
          setSubCategoriesCreateForm(filteredSubCategories);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [selectedCategoryId]);
  //get list sub-categories by category_id for updateForm
  useEffect(() => {
    if (selectedRecord.category?._id) {
      axiosClient
        .get(`/sub-categories/${selectedRecord.category?._id}`)
        .then((response) => {
          const filteredSubCategories = response.data.filter(
            (subCategory: ISubCategory) => {
              return subCategory.is_delete === false;
            }
          );
          setSubCategoriesUpdateForm(filteredSubCategories);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [selectedRecord.category?._id]);
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
  ): ColumnType<IProduct> => ({
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

  const dataSource = products.map((item) => ({
    ...item,
    categoryName: item.category?.name,
    subCategory: item.sub_category?.name,
  }));

  // console.log(dataSource.map((item) => item.categoryName));
  // console.log(dataSource.length);
  // Columns Table
  const columns: ColumnsType<IProduct> = [
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (text, record) => <strong>{text}</strong>,
      ...getColumnSearchProps("categoryName"),
    },
    {
      title: "Danh mục con",
      dataIndex: "subCategory",
      key: "subCategory",
      render: (text, record) => {
        return <strong>{text}</strong>;
      },
      ...getColumnSearchProps("subCategory"),
    },
    {
      dataIndex: "product_image",
      key: "product_image",
      width: "20%",
      render: (text) => {
        return (
          <div style={{ textAlign: "center" }}>
            {text && (
              <img
                style={{ maxWidth: 150, width: "30%", minWidth: 70 }}
                src={`${text}`}
                alt="image_products"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      render: (text) => {
        return <div>{text}%</div>;
      },
    },
    {
      title: "",
      key: "actions",
      render: (record) => {
        return (
          <div>
            <Space>
              {/* Button Variant */}
              <Button
                type="primary"
                onClick={() => {
                  setOpenModalAttribute(true);
                  setSelectedRecord(record);
                  attributeForm.setFieldsValue(record);
                  console.log(record);
                }}
              >
                Thuộc tính
              </Button>
              {/* Button Variant */}
              <Button
                type="primary"
                onClick={() => {
                  setOpenVariant(true);
                  // console.log(record);
                  setProductVariants(record);
                }}
              >
                Biến thể
              </Button>
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
                      "/products/" + id,
                      { is_delete: true }
                      // {
                      //   headers: {
                      //     access_token: `Bearer ${window.localStorage.getItem(
                      //       "access_token"
                      //     )}`,
                      //   },
                      // }
                    )
                    .then(() => {
                      message.success("Xóa thành công!");
                      setRefresh((f) => f + 1);
                    })
                    .catch((err) => {
                      console.log(err);
                      message.error("Xóa thất bại!");
                      message.error(err.response.data.msg);
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
  const isDeletColumns: ColumnsType<IProduct> = [
    {
      dataIndex: "product_image",
      key: "product_image",
      width: "20%",
      render: (text) => {
        return (
          <div style={{ textAlign: "center" }}>
            {text && (
              <img
                style={{ maxWidth: 150, width: "30%", minWidth: 70 }}
                src={`${text}`}
                alt="image_products"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "",
      key: "actions",
      render: (record) => {
        return (
          <div>
            <Space>
              {/* Button Delete */}
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                title="Bạn có chắc muốn xóa vĩnh viễn sản phẩm này không?"
                onConfirm={() => {
                  const id = record._id;
                  axiosClient
                    .delete(
                      "/products/" + id
                      // {
                      //   headers: {
                      //     access_token: `Bearer ${window.localStorage.getItem(
                      //       "access_token"
                      //     )}`,
                      //   },
                      // }
                    )
                    .then(() => {
                      message.success("Xóa thành công!");
                      setRefresh((f) => f + 1);
                    })
                    .catch((err) => {
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
              <Button
                onClick={() => {
                  const id = record._id;
                  console.log("id", id);
                  axiosClient
                    .patch(
                      "/products/" + id,
                      { is_delete: false }
                      // {
                      //   headers: {
                      //     access_token: `Bearer ${window.localStorage.getItem(
                      //       "access_token"
                      //     )}`,
                      //   },
                      // }
                    )
                    .then((response) => {
                      setRefresh((f) => f + 1);
                    })
                    .catch((err) => {
                      console.log(err);
                      message.error("Thất bại !!!");
                      message.error(err.response.data.msg);
                      message.error(err.response.data);
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
  // addedAttribute(columnProducts, columns);

  // Handle Form
  const handleCategoryChange = (value: any) => {
    setSelectedCategoryId(value);
  };

  // PRODUCT FIELD For createForm & updateForm
  const productField = [
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
      name: "category_id",
      label: "Danh mục",
      rules: [
        {
          required: true,
          message: "Danh mục không được để trống!",
        },
      ],
      component: !editFormVisible ? (
        <Select
          allowClear
          onChange={handleCategoryChange}
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
      ) : (
        <Select
          allowClear
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
      name: "sub_category_id",
      label: "Danh mục con",
      /* sử dụng defaultValue ở phía dưới sẽ bị antd cảnh báo nên sử dụng initialValue cho field ở <CustomForm /> */
      // initialValue: editFormVisible
      //   ? [
      //       {
      //         value: selectedRecord?.sub_category?._id,
      //         label: selectedRecord?.sub_category?.name,
      //       },
      //     ]
      //   : "",
      component: !editFormVisible ? (
        <Select
          allowClear
          disabled={selectedCategoryId ? false : true}
          options={
            subCategoriesCreateForm &&
            subCategoriesCreateForm.map((subCategory) => {
              return {
                value: subCategory._id,
                label: subCategory.name,
              };
            })
          }
        />
      ) : (
        <Select
          // defaultValue={[
          //   {
          //     value: selectedRecord?.sub_category?._id,
          //     label: selectedRecord?.sub_category?.name,
          //   },
          // ]}
          allowClear
          options={
            subCategoriesUpdateForm &&
            subCategoriesUpdateForm.map((subCategory) => {
              return {
                value: subCategory._id,
                label: subCategory.name,
              };
            })
          }
        />
      ),
    },
    {
      name: "is_variant",
      label: "Biến thể",
      initialValue: false,
      component: (
        <Switch
          checked={isVariant}
          checkedChildren="Có"
          unCheckedChildren="Không"
          onChange={() => {
            setIsVariant(!isVariant);
          }}
        />
      ),
    },
    {
      name: "price",
      label: "Giá",
      initialValue: undefined,
      noStyle: isVariant ? true : false,
      component: (
        <InputNumber
          style={{
            display: isVariant ? "none" : "",
          }}
        />
      ),
    },
    {
      name: "stock",
      label: "Số lượng",
      initialValue: undefined,
      noStyle: isVariant ? true : false,
      component: (
        <InputNumber
          style={{
            display: isVariant ? "none" : "",
          }}
        />
      ),
    },
    {
      name: "discount",
      label: "Giảm giá",
      initialValue: 0,
      rules: [
        {
          validator: (_: any, value: any) => {
            if (value < 0) {
              return Promise.reject(new Error("Giảm giá từ 0% đến 100%"));
            } else if (value > 100) {
              return Promise.reject(new Error("Giảm giá từ 0% đến 100%"));
            }
            return Promise.resolve();
          },
        },
      ],
      component: <InputNumber maxLength={3} addonAfter="%" />,
    },
    {
      name: "soft_order",
      label: "Thứ tự xếp",
      initialValue: 10,
      component: <InputNumber />,
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
      name: "description",
      label: "Mô tả",
      initialValue: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      component: <TextArea rows={3} />,
    },
    // {
    //   name: "variantButton",
    //   component: editFormVisible ? (
    //     <Button
    //       type="dashed"
    //       onClick={() => {
    //         setOpenModalAttribute(true);
    //       }}
    //     >
    //       Biến thể
    //     </Button>
    //   ) : (
    //     <></>
    //   ),
    // },
  ];

  // const onCreateFinish = (values: IProduct) => {
  //   axiosClient
  //     .post("/products", values)
  //     .then(() => {
  //       createForm.resetFields();
  //       setRefresh((f) => f + 1);
  //       message.success("Thêm mới thành công!");
  //     })
  //     .catch((err) => {
  //       message.error("Thêm mới thất bại!");
  //       message.error(err.response.data.msg);
  //       console.log(err);
  //     });
  //   // console.log("👌👌👌", values);
  // };
  const onCreateFinish = (values: any) => {
    axiosClient
      .post(
        "/products",
        values
        // {
        //   headers: {
        //     access_token: `Bearer ${window.localStorage.getItem("access_token")}`,
        //   },
        // }
      )
      .then((response) => {
        if (values.file !== undefined) {
          //UPLOAD FILE
          const { _id } = response.data;
          const formData = new FormData();
          formData.append("file", file);
          axios
            .post(`${API_URL}/upload/products/${_id}`, formData)
            .then((response) => {
              setRefresh((f) => f + 1);
              message.success("Thêm mới thành công!");
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
        message.error(err.response.data);
        console.log(err);
      });
    console.log("👌👌👌", values);
  };
  const onCreateFinishFailed = (errors: object) => {
    console.log("💣💣💣 ", errors);
  };

  const onUpdateFinish = (values: IProduct) => {
    axiosClient
      .patch(
        "/products/" + selectedRecord._id,
        values
        // {
        //   headers: {
        //     access_token: `Bearer ${window.localStorage.getItem("access_token")}`,
        //   },
        // }
      )
      .then(() => {
        message.success("Cập nhật thành công!");
        setRefresh((f) => f + 1);
        setEditFormVisible(false);
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

  const onAttributeFinish = (values: any) => {
    if (!selectedRecord.attributes?.length) {
      console.log("created");
      createAttribute(values);
    } else {
      console.log("updated");
      updateAttribute(values);
    }
  };
  const createAttribute = (values: any) => {
    console.log("values", values);

    const updateAttribute: any = [];
    values.attributes.map((v: any, index: number) => {
      const valueAttribute = { ...v, product_id: selectedRecord._id };
      axiosClient
        .post(
          "/attributes-p/",
          valueAttribute
          // {
          //   headers: {
          //     access_token: `Bearer ${window.localStorage.getItem(
          //       "access_token"
          //     )}`,
          //   },
          // }
        )
        .then((res) => {
          const attributeId = res.data.id;
          console.log(res.data);
          updateAttribute.push(attributeId);
          // console.log("valueAttribute", valueAttribute);
          // console.log("res.data", res.data);
          console.log("updateAttribute", updateAttribute);
          axiosClient.patch(
            "/products/" + selectedRecord._id,
            {
              attributes: updateAttribute,
            }
            // {
            //   headers: {
            //     access_token: `Bearer ${window.localStorage.getItem(
            //       "access_token"
            //     )}`,
            //   },
            // }
          );
          setRefresh((f) => f + 1);
          // setOpenModalAttribute(false);
          message.success(`Thuộc tính ${index + 1} đã được cập nhật!`);
        })
        .catch((err) => {
          message.error("Cập nhật Thuộc tính thất bại!");
          message.error(err.response.data.msg);
          message.error(err.response.data);
          console.log(err);
        });
    });
  };
  const updateAttribute = (values: any) => {
    axios
      .put(
        // "https://be-aquatic-land.onrender.com/attributes-p/updateAttributes",
        "http://localhost:9000/attributes-p/updateAttributes",
        {
          values,
          product_id: selectedRecord._id,
        }
        // {
        //   headers: {
        //     access_token: `Bearer ${window.localStorage.getItem(
        //       "access_token"
        //     )}`,
        //   },
        // }
      )
      .then((res) => {
        const attributeArray = res.data.map((attribute: any) => {
          return attribute.options;
        });
        console.log("attributeArray", attributeArray);

        console.log("res.data", res.data);
        message.success("Cập nhật thành công!");
        setRefresh((f) => f + 1);
      })
      .catch((err) => {
        message.error("Cập nhật thất bại!");
        message.error(err.response.data.msg);
        message.error(err.response.data);
        console.log(err);
      });
  };
  const onAttributeFinishFailed = (errors: object) => {
    console.log(errors);
  };

  return (
    <div>
      <h1>Product List</h1>
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
          Thêm sản phẩm
        </Button>
        <Button
          disabled={user?.state?.users?.user?.roles ? false : true}
          danger
          onClick={() => {
            setEditFormDelete(true);
          }}
        >
          Các sản phẩm đã xóa
        </Button>
      </div>
      {/* --- CREATE PRODUCT FORM --- */}
      <Modal
        centered
        open={createFormVisible}
        title="Thêm mới sản phẩm"
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
          onFinish={onCreateFinish}
          onFinishFailed={onCreateFinishFailed}
          fields={productField}
        />
      </Modal>

      {/* --- UPDATE PRODUCT FORM --- */}
      <Modal
        centered
        title="Cập nhật sản phẩm"
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
          fields={productField}
        />
      </Modal>

      {/* Modal Attribute */}
      <Modal
        centered
        width={"50%"}
        open={openModalAttribute}
        title="Thuộc tính"
        onOk={() => {
          attributeForm.submit();
          setOpenModalAttribute(false);
        }}
        onCancel={() => {
          setOpenModalAttribute(false);
        }}
        okText="Lưu"
        cancelText="Đóng"
      >
        <Form
          form={attributeForm}
          name="attribute-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onAttributeFinish}
          onFinishFailed={onAttributeFinishFailed}
        >
          <Form.List name="attributes">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <div key={field.key}>
                    <h4 style={{ marginTop: 0 }}>Thuộc tính {index + 1}</h4>
                    <Form.Item
                      label={`Tên thuộc tính`}
                      name={[field.name, "attribute_name"]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Giá trị thuộc tính"
                      name={[field.name, "values"]}
                    >
                      <Form.List name={[field.name, "values"]}>
                        {(
                          valuesFields,
                          { add: addValue, remove: removeValue }
                        ) => (
                          <>
                            {valuesFields.map((valueField, valueIndex) => (
                              <div
                                key={valueField.key}
                                style={{ marginBottom: 24 }}
                              >
                                <Form.Item
                                  label={`Giá trị ${valueIndex + 1}`}
                                  name={[valueField.name]}
                                  noStyle
                                >
                                  {/* Input */}
                                  <Input style={{ width: "60%" }} />
                                </Form.Item>
                                {/* Nút xóa Input */}
                                <Popconfirm
                                  icon={
                                    <QuestionCircleOutlined
                                      style={{ color: "red" }}
                                    />
                                  }
                                  title="Bạn có chắc chắn muốn xóa?"
                                  onConfirm={() => {
                                    removeValue(valueField.name);
                                  }}
                                  okText="Có"
                                  cancelText="Không"
                                >
                                  {valuesFields.length > 1 ? (
                                    <MinusCircleOutlined
                                      style={{
                                        fontSize: 20,
                                        marginLeft: 5,
                                        color: "red",
                                      }}
                                    />
                                  ) : null}
                                </Popconfirm>
                              </div>
                            ))}
                            <Button type="dashed" onClick={() => addValue()}>
                              Thêm giá trị
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>
                      Xóa thuộc tính
                    </Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()}>
                  Thêm thuộc tính
                </Button>
              </>
            )}
          </Form.List>
        </Form>
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
          dataSource={isProducts}
          columns={isDeletColumns}
        />
      </Modal>

      {openVariant ? (
        <VariantModal
          productVariants={productVariants}
          openVariant={openVariant}
          setOpenVariant={setOpenVariant}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
