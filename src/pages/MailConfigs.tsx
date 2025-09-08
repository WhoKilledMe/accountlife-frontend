import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Form, Input, Button, Space, message, Switch, InputNumber } from "antd";
import { http } from "../lib/http";
import { notify } from "../lib/notify";

type MailCfg = {
  id?: number;
  name?: string;
  host?: string;
  port?: number;
  emailAddress?: string;
  authCode?: string;
  enableSsl?: boolean;
  enableTls?: boolean;
  connectionTimeout?: number;
  readTimeout?: number;
  isActive?: boolean;
  description?: string;
  userId?: number;
};

export default function MailConfigs() {
  const location = useLocation();
  const [form] = Form.useForm<MailCfg>();
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<MailCfg>({});

  const loadInitial = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const u = params.get("userId");
      if (u) {
        const userId = Number(u);
        const next = { ...editing, userId } as MailCfg;
        // query existing configs by user
        try {
          const resp = await http.post(`/usermailconfig/query`, { userId });
          const list = (resp?.data?.data || resp?.data || []) as MailCfg[];
          const found = Array.isArray(list) ? list[0] : undefined;
          const merged = found ? { ...next, ...found } : next;
          setEditing(merged);
          form.setFieldsValue(merged);
        } catch (e: any) {
          notify.error(e?.message || "加载用户邮箱配置失败");
          // fallback set userId
          setEditing(next);
          form.setFieldsValue(next);
        }
      } else {
        // no userId in URL: try to fetch current user's single config
        try {
          const resp = await http.get(`/usermailconfig/me`);
          const data = resp?.data?.data ?? resp?.data;
          if (data) {
            setEditing(data);
            form.setFieldsValue(data);
          }
        } catch (e: any) {
          // ignore if not found; only notify on real errors
          if (e?.response?.status && e.response.status >= 400 && e.response.status !== 204) {
            notify.error(e?.message || "加载当前用户邮箱配置失败");
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 读取URL参数中的userId并初始化表单
  useEffect(() => { loadInitial(); /* eslint-disable-line */ }, []);

  const saveItem = async (values: MailCfg) => {
    // Always POST with id included; backend will upsert based on id
    await http.post(`/usermailconfig`, { ...values, id: values?.id });
  };

  const testConnectivity = async (values: MailCfg) => {
    const resp = await http.post(`/usermailconfig/test`, values);
    const d = resp?.data as any;
    const ok = d === true || d?.data === true || d?.success === true || d?.code === 0;
    notify.fromBoolean(ok, "连通性测试成功", "连通性测试失败");
  };

  

  return (
    <div style={{ padding: 24 }}>
      <Card title="用户邮箱配置" loading={loading}>
        <Form<MailCfg>
          form={form}
          layout="vertical"
          initialValues={editing}
          onValuesChange={(_, all) => setEditing(all)}
          onFinish={async (values) => {
            try {
              await saveItem(values);
              notify.success("已保存");
            } catch (e: any) {
              notify.error(e?.message || "保存失败");
            }
          }}
        >

          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="配置名称" rules={[{ required: true, message: "请输入配置名称" }]}>
            <Input placeholder="配置名称" />
          </Form.Item>
          <Form.Item name="emailAddress" label="邮箱账号" rules={[{ required: true, message: "请输入邮箱账号" }]}>
            <Input placeholder="邮箱账号" />
          </Form.Item>
          <Form.Item name="host" label="SMTP服务器地址" rules={[{ required: true, message: "请输入SMTP服务器地址" }]}>
            <Input placeholder="smtp.example.com" />
          </Form.Item>
          <Form.Item name="port" label="端口" rules={[{ required: true, message: "请输入端口" }]}>
            <InputNumber placeholder="465/587 等" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="authCode" label="授权码" rules={[{ required: true, message: "请输入授权码" }]}>
            <Input.Password placeholder="邮箱授权码" />
          </Form.Item>
          <Form.Item name="enableSsl" label="启用SSL" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="enableTls" label="启用TLS" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="connectionTimeout" label="连接超时(毫秒)">
            <InputNumber style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="readTimeout" label="读取超时(毫秒)">
            <InputNumber style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="isActive" label="是否启用" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="可选" />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit">保存</Button>
            <Button onClick={async () => {
              try {
                await testConnectivity(editing);
              } catch (e: any) {
                message.error(e?.message || "测试失败");
              }
            }}>连通性测试</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}


