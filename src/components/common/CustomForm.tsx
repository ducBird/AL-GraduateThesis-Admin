import { Form } from "antd";

interface CustomFormProps {
  form: any;
  formName: string;
  initialValues?: object;
  onFinish: (values: object) => void;
  onFinishFailed: (errors: object) => void;
  onFieldsChange?: (_: any, allFields: any) => void;
  fields: {
    name?: string;
    label?: string;
    initialValue?: any;
    rules?: any[];
    noStyle?: boolean;
    component: JSX.Element;
  }[];
}

export default function CustomForm({
  form,
  formName,
  initialValues,
  onFinish,
  onFinishFailed,
  onFieldsChange,
  fields,
}: CustomFormProps) {
  return (
    <Form
      form={form}
      name={formName}
      initialValues={initialValues}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onFieldsChange={onFieldsChange}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
    >
      {fields.map((field) => (
        <div key={field.name}>
          <Form.Item
            hasFeedback
            initialValue={field.initialValue}
            noStyle={field.noStyle}
            label={field.label}
            name={field.name}
            rules={field.rules}
          >
            {field.component}
          </Form.Item>
        </div>
      ))}
    </Form>
  );
}
