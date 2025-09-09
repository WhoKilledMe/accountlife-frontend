import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Space, Table, Modal, message, Switch, InputNumber } from "antd";
// import { http } from "../lib/http";
import { userMailConfigApi } from "../api/userMailConfig";

type MailCfg = {
  id?: number;
  userId?: number;
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
};

export default function AdminMailConfigs() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm<MailCfg>();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MailCfg[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<MailCfg | null>(null);

  const fetchPage = async (p = page, ps = pageSize) => {
    setLoading(true);
    try {
      const values = await form.validateFields().catch(() => ({}));
      const body = { ...values };
      const resp = await userMailConfigApi.page(p - 1, ps, body);
      const pr = resp.data as any;
      setItems(pr.content ?? []);
      setTotal(pr.totalElements ?? 0);
      setPage(p);
      setPageSize(ps);
    } catch (e) {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async (values: MailCfg) => {
    if (editing?.id) {
      await userMailConfigApi.update({ ...values, id: editing.id });
    } else {
      await userMailConfigApi.create(values);
    }
  };

  const removeItem = async (id: number) => {
    await userMailConfigApi.remove(id);
  };

  useEffect(() => { fetchPage(1, pageSize); /* eslint-disable-line */ }, []);

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={() => fetchPage(1, pageSize)}>
          <Form.Item name="userId" label="用户ID">
            <InputNumber placeholder="用户ID" style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="name" label="配置名称">
            <Input allowClear placeholder="模糊搜索名称" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={() => { form.resetFields(); fetchPage(1, pageSize); }}>重置</Button>
              <Button type="dashed" onClick={() => { setEditing(null); editForm.resetFields(); setEditOpen(true); }}>新建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          rowKey={(r) => String(r.id)}
          loading={loading}
          columns={[
            { title: "ID", dataIndex: "id", width: 80 },
            { title: "用户ID", dataIndex: "userId", width: 100 },
            { title: "配置名称", dataIndex: "name" },
            { title: "邮箱", dataIndex: "emailAddress" },
            { title: "服务器", dataIndex: "host" },
            { title: "端口", dataIndex: "port", width: 90 },
            { title: "启用", dataIndex: "isActive", width: 90, render: (v: boolean) => (v ? "是" : "否") },
            {
              title: "操作",
              width: 220,
              render: (_: any, record: MailCfg) => (
                <Space>
                  <Button type="link" onClick={() => { setEditing(record); editForm.setFieldsValue(record as any); setEditOpen(true); }}>编辑</Button>
                  <Button type="link" danger onClick={() => Modal.confirm({ title: `确认删除配置 #${record.id}?`, onOk: async () => { await removeItem(record.id!); message.success("已删除"); fetchPage(1, pageSize); } })}>删除</Button>
                </Space>
              ),
            },
          ] as any}
          dataSource={items}
          pagination={{
            total,
            current: page,
            pageSize,
            showSizeChanger: true,
            onChange: (p, ps) => fetchPage(p, ps),
          }}
        />
      </Card>

      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={() => editForm.submit()}
        title={editing?.id ? `编辑配置 #${editing.id}` : "新建配置"}
        destroyOnClose
      >
        <Form<MailCfg>
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await saveItem(values);
              setEditOpen(false);
              message.success("已保存");
              fetchPage(page, pageSize);
            } catch (e: any) {
              message.error(e?.message || "保存失败");
            }
          }}
        >
          <Form.Item name="userId" label="用户ID" rules={[{ required: true, message: "请输入用户ID" }]}>
            <InputNumber placeholder="用户ID" style={{ width: 200 }} />
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
        </Form>
      </Modal>
    </div>
  );
}


