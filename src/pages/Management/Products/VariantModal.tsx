import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  message,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { IProduct } from "../../../interfaces/Product";
import { Variant } from "../../../interfaces/Variant";
import { axiosClient } from "../../../libraries/axiosClient";
import { API_URL } from "../../../constants/URLS";

interface IProps {
  productVariants: IProduct;
  openVariant: boolean;
  setOpenVariant: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function VariantModal(props: IProps) {
  const { productVariants, openVariant, setOpenVariant } = props;
  const [variants, setVariants] = useState<Variant[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDetailVariant, setOpenDetailVariant] = useState(false);
  const [selectedRecordVariant, setSelectedRecordVariant] = useState<Variant>(
    {}
  );
  const [file, setFile] = useState<any>();
  const [variantForm] = Form.useForm();

  useEffect(() => {
    async function fetchData() {
      try {
        // lấy danh sách biến thể theo _id sản phẩm
        const response = await axiosClient.get(
          `/variants-p/${productVariants._id}`
        );
        // console.log("response.data", response.data);
        setVariants(response.data);

        // kiểm tra nếu biến thể chưa được tạo thì thực thi post data
        if (!response.data.length) {
          const generatedVariants = generateProductVariants(productVariants);
          // mảng chứa tất cả id của từng variant
          const variantIds: string[] = [];
          // Gửi yêu cầu mạng để tạo biến thể và sau đó cập nhật variants
          const createdVariants = await Promise.all(
            generatedVariants.map(async (variant) => {
              const response = await axiosClient.post("/variants-p", variant);
              variantIds.push(response.data.id);
              return response.data;
            })
          );
          await axiosClient.patch("/products/" + productVariants._id, {
            variants: variantIds,
          });
          // console.log("createdVariants", createdVariants);
          setVariants(createdVariants);
        }

        // nếu biến thể đã được tạo rồi thì xem xét sự thay đổi attribute và cập nhật biến thể
        if (response.data.length) {
          const generatedVariants = generateProductVariants(productVariants);
          const isAttributeChanged = arraysHaveChanged(
            generatedVariants,
            response.data
          );
          // nếu có sự thay đổi ở attribute thì thực thi việc update variants
          if (!isAttributeChanged) {
            const updatedVariant = await axios.put(
              "http://localhost:9000/variants-p/updateVariants",
              {
                generatedVariants,
                product_id: productVariants._id,
              }
            );
            console.log(updatedVariant.data);
            setRefresh((f) => f + 1);
          }
        }

        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }

    fetchData();
  }, [productVariants, refresh]);

  const variantColumns: ColumnsType<Variant> = [
    {
      dataIndex: "variant_image",
      key: "variant_image",
      width: "20%",
      render: (text) => {
        return (
          <div style={{ textAlign: "center" }}>
            {text && (
              <img
                style={{ maxWidth: 150, width: "30%", minWidth: 70 }}
                src={`${text}`}
                alt="image_variants"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Tên biến thể",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (text) => {
        return <div>{text} vnđ</div>;
      },
    },
    {
      title: "Số lượng",
      dataIndex: "stock",
      key: "stock",
      render: (text) => {
        return <div>{text}</div>;
      },
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      render: (text) => {
        return <div>{text}</div>;
      },
    },
    {
      title: "",
      key: "actions",
      render: (record: Variant) => {
        return (
          <div>
            <Space>
              {/* Button Edit */}
              <Button
                onClick={() => {
                  setSelectedRecordVariant(record);
                  variantForm.setFieldsValue(record);
                  setOpenDetailVariant(true);
                  // console.log(record);
                }}
                icon={<EditOutlined />}
              ></Button>
              {/* Button Delete */}
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                title="Bạn có chắc chắn muốn xóa?"
                onConfirm={() => {
                  console.log("delete");
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
  const onVariantFinish = (values: any) => {
    axiosClient
      .patch("/variants-p/" + selectedRecordVariant._id, values)
      .then((response) => {
        if (values.file !== undefined) {
          //UPLOAD FILE
          const { _id } = response.data;
          const formData = new FormData();
          formData.append("file", file);
          axios
            .post(`${API_URL}/upload/variants-p/${_id}`, formData)
            .then((response) => {
              message.success("Cập nhật thành công!");
              console.log("image");

              setRefresh((f) => f + 1);
            })
            .catch((err) => {
              message.error("Tải lên hình ảnh thất bại!");
              console.log(err);
            });
        }
        variantForm.resetFields();
        setRefresh((f) => f + 1);
        console.log("ok");

        setOpenDetailVariant(false);
      })
      .catch((err) => {
        message.error("Cập nhật thất bại!");
        console.log(err);
      });
  };
  const onVariantFinishFailed = (errors: object) => {
    console.log(errors);
  };
  return (
    <>
      <Modal
        centered
        width={"80%"}
        open={openVariant}
        title="Biến thể"
        onOk={() => {
          setOpenVariant(false);
        }}
        onCancel={() => {
          setOpenVariant(false);
        }}
        okText="Lưu"
        cancelText="Đóng"
      >
        <Table rowKey={"_id"} dataSource={variants} columns={variantColumns} />
        <Modal
          centered
          width={"50%"}
          open={openDetailVariant}
          title="Cập nhật biến thể"
          onOk={() => {
            variantForm.submit();
          }}
          onCancel={() => {
            setOpenDetailVariant(false);
          }}
          okText="Lưu"
          cancelText="Đóng"
        >
          {/* Details Variant */}
          <Form
            form={variantForm}
            name="variant-form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onVariantFinish}
            onFinishFailed={onVariantFinishFailed}
          >
            <Form.Item label={`Tên biến thể`} name={"title"}>
              <Input />
            </Form.Item>
            <Form.Item label={`Giá`} name={"price"}>
              <Input />
            </Form.Item>
            <Form.Item label={`Số lượng`} name={"stock"}>
              <Input />
            </Form.Item>
            <Form.Item label={`Vị trí`} name={"position"}>
              <Input />
            </Form.Item>
            <Form.Item label="Hình ảnh" name="file">
              <Upload
                showUploadList={true}
                beforeUpload={(file) => {
                  setFile(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </Modal>
    </>
  );
}

function generateProductVariants(
  product: IProduct,
  currentVariant: Record<string, string> = {},
  index: number = 0,
  Variants: Variant[] = []
): Variant[] {
  if (product.attributes.length <= 0) {
    return (Variants = []);
  } else {
    if (index === product.attributes.length) {
      // Đã tạo xong một biến thể, thêm nó vào mảng biến thể
      const title = Object.values(currentVariant).join("/");
      const price = 0; // Điền logic tính giá sản phẩm
      const stock = 0;
      const position = 0;
      const variant_image = "";
      const product_id = product._id;

      Variants.push({
        title,
        price,
        stock,
        position,
        variant_image,
        product_id,
      });
    } else {
      const attribute = product.attributes[index];
      for (const value of attribute.values) {
        const newVariant = {
          ...currentVariant,
          [attribute.attribute_name]: value,
        };
        generateProductVariants(product, newVariant, index + 1, Variants);
      }
    }
    return Variants;
  }
}

function arraysHaveChanged(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (const item1 of arr1) {
    if (!arr2.some((item2) => item1.title === item2.title)) {
      return false;
    }
  }

  for (const item2 of arr2) {
    if (!arr1.some((item1) => item2.title === item1.title)) {
      return false;
    }
  }

  return true;
}

// const isAttributeChanged = response.data.every((item1: Variant) => {
//   return generatedVariants.some((item2) => item1.title === item2.title);
// });
