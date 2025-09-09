import { useMemo, useState } from "react";
import { Form, Input, Button, Space, Modal, message, Drawer, Descriptions, Card } from "antd";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import type { UserDto } from "../services/types";
import { listUsers, createUser, updateUser, deleteUser, getUser } from "../api/users";
// removed unused FormCard to align with Accounts page layout
import PaginatedTable from "../components/PaginatedTable";
import { PlusOutlined } from "@ant-design/icons";
import { CreateButton, EditButton, DeleteButton } from "../components/ActionButtons";

export default function UsersAdmin() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm<UserDto>();

  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{ username?: string; email?: string }>({});
  const [tableKey, setTableKey] = useState(0);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<UserDto | null>(null);

  const columns: ColumnsType<UserDto> = useMemo(() => [
    { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => (a.id || 0) - (b.id || 0) },
    { title: "用户名", dataIndex: "username", sorter: (a, b) => (a.username || "").localeCompare(b.username || "") },
    { title: "邮箱", dataIndex: "email", sorter: (a, b) => (a.email || "").localeCompare(b.email || "") },
    { title: "手机号", dataIndex: "phone", sorter: (a, b) => (a.phone || "").localeCompare(b.phone || "") },
    {
      title: "操作",
      width: 260,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={async () => {
              setDetailOpen(true);
              setDetail(null);
              setDetailLoading(true);
              try {
                const d = await getUser(record.id!);
                setDetail(d);
              } catch (e: any) {
                message.error(e?.message || "加载详情失败");
              } finally {
                setDetailLoading(false);
              }
            }}
          >查看</Button>
          <Button
            type="link"
            onClick={() => navigate(`/mail-configs?userId=${record.id}`)}
          >邮箱配置</Button>
          <EditButton permKey="user:edit" onClick={() => {
            setEditing(record);
            editForm.setFieldsValue(record as any);
            setEditOpen(true);
          }} />
          <DeleteButton
            permKey="user:delete"
            onConfirm={async () => {
              try {
                await deleteUser(record.id!);
                message.success("已删除");
                setTableKey((k) => k + 1);
              } catch (e: any) {
                message.error(e?.message || "删除失败");
              }
            }}
          />
        </Space>
      ),
    },
  ], [editForm]);

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600, color: "#1D1D1F" }}>
          用户管理
        </h2>
        <p style={{ margin: "8px 0 0 0", color: "#86868B", fontSize: "14px" }}>
          管理系统中的用户信息与配置
        </p>
      </div>

      <Card style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <CreateButton icon={<PlusOutlined />} permKey="user:create" onClick={() => { setEditing(null); editForm.resetFields(); setEditOpen(true); }}>
              新建用户
            </CreateButton>
          </Space>
          <Form form={form} layout="inline" onFinish={(values) => { setSearch(values); setTableKey((k) => k + 1); }}>
            <Form.Item name="username" label="用户名">
              <Input allowClear placeholder="模糊搜索用户名" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="email" label="邮箱">
              <Input allowClear placeholder="模糊搜索邮箱" style={{ width: 220 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">查询</Button>
                <Button onClick={() => { form.resetFields(); setSearch({}); setTableKey((k) => k + 1); }}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Card>

      <Card>
        <PaginatedTable<UserDto>
          key={tableKey}
          columns={columns}
          fetchPage={async ({ page: p, pageSize: ps }) => {
            const res = await listUsers({ page: p, pageSize: ps, ...search });
            setPageSize(ps);
            return { items: res.items, total: res.total };
          }}
          defaultPageSize={pageSize}
          rowKey={(r) => String(r.id)}
        />
      </Card>

      <Modal
        open={editOpen}
        title={editing ? `编辑用户 #${editing.id}` : "新建用户"}
        onCancel={() => setEditOpen(false)}
        onOk={() => {
          editForm.submit();
        }}
        okText="保存"
        destroyOnClose
        width={600}
      >
        <Form<UserDto>
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (editing?.id) {
                await updateUser({ ...values, id: editing.id });
                message.success("已保存");
              } else {
                await createUser(values);
                message.success("已创建");
              }
              setEditOpen(false);
              setTableKey((k) => k + 1);
            } catch (e: any) {
              message.error(e?.message || "保存失败");
            }
          }}
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="手机号" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={detailOpen}
        width={480}
        onClose={() => setDetailOpen(false)}
        title={detail ? `用户详情 #${detail.id}` : "用户详情"}
      >
        {detailLoading ? (
          <div>加载中...</div>
        ) : detail ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="用户名">{detail.username}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{detail.email}</Descriptions.Item>
            <Descriptions.Item label="手机号">{detail.phone}</Descriptions.Item>
            <Descriptions.Item label="创建人">{detail.createdBy}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detail.createdAt}</Descriptions.Item>
            <Descriptions.Item label="修改人">{detail.updatedBy}</Descriptions.Item>
            <Descriptions.Item label="修改时间">{detail.updatedAt}</Descriptions.Item>
          </Descriptions>
        ) : (
          <div>暂无数据</div>
        )}
      </Drawer>
    </div>
  );
}