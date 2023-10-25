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
} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
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
import { ISupplier } from "../../../interfaces/Supplier";
import { IVariant } from "../../../interfaces/Variant";
import { FilterConfirmProps } from "antd/es/table/interface";
import axios from "axios";
import { API_URL } from "../../../constants/URLS";
import { FaTrashRestore } from "react-icons/fa";
import { useUser } from "../../../hooks/useUser";
export default function Products() {
  //--- state để render dữ liệu ở columns, productField và xử lý <Select/> trong Form antd ---//
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isProducts, setIsProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [subCategoriesCreateForm, setSubCategoriesCreateForm] = useState<
    ISubCategory[]
  >([]);
  const [subCategoriesUpdateForm, setSubCategoriesUpdateForm] = useState<
    ISubCategory[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState();
  const [selectedRecord, setSelectedRecord] = useState<IProduct>({});
  const [editFormDelete, setEditFormDelete] = useState(false);
  // File
  const [file, setFile] = useState<any>();
  //----------------------------------------------------------------//

  //--- state quản lý đóng mở Modal ---//
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [openModalVariant, setOpenModalVariant] = useState(false);
  //----------------------------------------------------------------//

  //--- state xử lý render khi có sự thay đổi ở useEffect ---//
  const [refresh, setRefresh] = useState(0);
  //----------------------------------------------------------------//
  const [variants, setVariants] = useState<IVariant[]>([]);
  const { users } = useUser((state) => state) as any;
  const userString = localStorage.getItem("user-storage");
  const user = userString ? JSON.parse(userString) : null;
  //State search
  type DataIndex = keyof IProduct;
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  // Form
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [variantForm] = Form.useForm();

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
  //get list suppliers
  useEffect(() => {
    axiosClient
      .get(`/suppliers`)
      .then((response) => {
        const filteredSuppliers = response.data.filter(
          (supplier: ISupplier) => {
            return supplier.is_delete === false;
          }
        );
        setSuppliers(filteredSuppliers);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
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
                  setOpenModalVariant(true);
                  setSelectedRecord(record);
                  variantForm.setFieldsValue(record);
                  // console.log(record);
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
                  const formattedDateOfManufacture = moment(
                    record.date_of_manufacture,
                    "YYYY-MM-DD HH:mm:ss"
                  );
                  const formattedExpirationDate = moment(
                    record.expiration_date,
                    "YYYY-MM-DD HH:mm:ss"
                  );
                  const updatedRecord = {
                    ...record,
                    createdAt: formattedCreatedAt,
                    updatedAt: formattedUpdatedAt,
                    date_of_manufacture: formattedDateOfManufacture,
                    expiration_date: formattedExpirationDate,
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
                    .delete("/products/" + id, {
                      headers: {
                        access_token: `Bearer ${window.localStorage.getItem(
                          "access_token"
                        )}`,
                      },
                    })
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
      initialValue: editFormVisible
        ? [
            {
              value: selectedRecord?.sub_category?._id,
              label: selectedRecord?.sub_category?.name,
            },
          ]
        : "",
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
      name: "supplier_id",
      label: "Nhà cung cấp",
      rules: [
        {
          required: true,
          message: "Nhà cung cấp không được để trống!",
        },
      ],
      component: (
        <Select
          allowClear
          options={
            suppliers &&
            suppliers.map((supplier) => {
              return {
                value: supplier._id,
                label: supplier.name,
              };
            })
          }
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
      name: "date_of_manufacture",
      label: "Ngày sản xuất",
      initialValue: moment(new Date(), "YYYY-MM-DD HH:mm:ss"),
      component: (
        <DatePicker format={"YYYY/MM/DD-HH:mm:ss"} placeholder="Chọn ngày" />
      ),
    },
    {
      name: "expiration_date",
      label: "Ngày hết hạn",
      initialValue: moment(
        new Date(new Date().getFullYear() + 1, new Date().getMonth()),
        "YYYY-MM-DD HH:mm:ss"
      ),
      component: (
        <DatePicker format={"YYYY/MM/DD-HH:mm:ss"} placeholder="Chọn ngày" />
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
    //         setOpenModalVariant(true);
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
      .post("/products", values, {
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
            .post(`${API_URL}/upload/products/${_id}`, formData)
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
      .patch("/products/" + selectedRecord._id, values, {
        headers: {
          access_token: `Bearer ${window.localStorage.getItem("access_token")}`,
        },
      })
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

  const onVariantFinish = (values: any) => {
    if (!selectedRecord.variants?.length) {
      console.log("created");
      createVariants(values);
    } else {
      console.log("updated");
      updateVariants(values);
    }
  };
  const createVariants = (values: any) => {
    const updateVariants: any = [];
    values.variants.map((v: any, index: number) => {
      const valueVariants = { ...v, product_id: selectedRecord._id };
      axiosClient
        .post("/variants-p/", valueVariants, {
          headers: {
            access_token: `Bearer ${window.localStorage.getItem(
              "access_token"
            )}`,
          },
        })
        .then((res) => {
          const variantId = res.data.id;
          console.log(res.data);
          updateVariants.push(variantId);
          // console.log("valueVariants", valueVariants);
          // console.log("res.data", res.data);
          // console.log("updateVariants",updateVariants);
          if (valueVariants.file !== undefined) {
            //UPLOAD FILE
            const { _id } = res.data;
            const formData = new FormData();
            formData.append("file", file);
            axios
              .post(`${API_URL}/upload/variants/${_id}`, formData)
              .then((response) => {
                message.success("Tải lên hình ảnh thành công!");
                // createForm.resetFields();
              })
              .catch((err) => {
                message.error("Tải lên hình ảnh thất bại!");
                console.log(err);
              });
          }
          axiosClient.patch(
            "/products/" + selectedRecord._id,
            {
              variants: updateVariants,
            },
            {
              headers: {
                access_token: `Bearer ${window.localStorage.getItem(
                  "access_token"
                )}`,
              },
            }
          );
          setRefresh((f) => f + 1);
          // setOpenModalVariant(false);
          message.success(`Biến thể ${index + 1} đã được cập nhật!`);
        })
        .catch((err) => {
          message.error("Cập nhật biến thể thất bại!");
          message.error(err.response.data.msg);
          message.error(err.response.data);
          console.log(err);
        });
    });
  };
  const updateVariants = (values: any) => {
    console.log(values);
    axios
      .put(
        // "https://be-aquatic-land.onrender.com/variants-p/updateVariants",
        "http://localhost:9000/variants-p/updateVariants",
        {
          values,
          product_id: selectedRecord._id,
        },
        {
          headers: {
            access_token: `Bearer ${window.localStorage.getItem(
              "access_token"
            )}`,
          },
        }
      )
      .then((res) => {
        const variantArray = res.data.map((variant: any) => {
          return variant.options;
        });
        console.log("variantArray", variantArray);

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
  const onVariantFinishFailed = (errors: object) => {
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

      {/* --- VARIANT FORM --- */}
      <Modal
        centered
        width={"50%"}
        open={openModalVariant}
        title="Biến thể"
        onOk={() => {
          variantForm.submit();
        }}
        onCancel={() => {
          setOpenModalVariant(false);
        }}
        okText="Lưu"
        cancelText="Đóng"
      >
        {/* UPDATE VARIANT FORM */}
        <Form
          form={variantForm}
          name="variant-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onVariantFinish}
          onFinishFailed={onVariantFinishFailed}
        >
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <div key={field.key}>
                    <h4 style={{ marginTop: 0 }}>Biến thể {index + 1}</h4>
                    <Form.Item
                      label={`Tên biến thể`}
                      name={[field.name, "title"]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={`Giá điều chỉnh`}
                      name={[field.name, "price_adjustment"]}
                    >
                      <InputNumber />
                    </Form.Item>
                    <Form.Item
                      label={`Thứ tứ xếp`}
                      name={[field.name, "position"]}
                    >
                      <InputNumber />
                    </Form.Item>
                    <Form.Item label="Tùy chọn" name={[field.name, "options"]}>
                      <Form.List name={[field.name, "options"]}>
                        {(
                          optionFields,
                          { add: addOption, remove: removeOption }
                        ) => (
                          <>
                            {optionFields.map((optionField, optionIndex) => (
                              <div
                                key={optionField.key}
                                className={style.option_container}
                              >
                                <Form.Item
                                  label={`Tùy chọn ${optionIndex + 1}`}
                                  name={[optionField.name, "value"]}
                                >
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  label="Giá cộng thêm"
                                  name={[optionField.name, "add_valuation"]}
                                >
                                  <InputNumber />
                                </Form.Item>
                                <Form.Item
                                  label="Tồn kho"
                                  name={[
                                    optionField.name,
                                    "inventory_quantity",
                                  ]}
                                >
                                  <InputNumber />
                                </Form.Item>
                                <Form.Item
                                  label={`Hình ảnh`}
                                  name={[optionField.name, "images"]}
                                >
                                  <Upload
                                    showUploadList={true}
                                    beforeUpload={(file) => {
                                      setFile(file);
                                      return false;
                                    }}
                                  >
                                    <Button
                                      onClick={() => {
                                        console.log("Clicked");
                                      }}
                                      icon={<UploadOutlined />}
                                    >
                                      Tải lên hình ảnh
                                    </Button>
                                  </Upload>
                                </Form.Item>
                                <Button
                                  danger
                                  onClick={() => removeOption(optionField.name)}
                                >
                                  Xóa tùy chọn
                                </Button>
                              </div>
                            ))}
                            <Button type="dashed" onClick={() => addOption()}>
                              Thêm tùy chọn
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>
                      Xóa biến thể
                    </Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()}>
                  Thêm biến thể
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
    </div>
  );
}
