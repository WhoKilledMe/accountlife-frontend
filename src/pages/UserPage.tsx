import { useEffect, useMemo, useState } from "react";
import { Form, Input, Button, Space, Modal, message, Drawer, Descriptions } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UserDto } from "../services/types";
import { listUsers, createUser, updateUser, deleteUser, getUser } from "../api/users";
import FormCard from "../components/FormCard";
import PaginatedTable from "../components/PaginatedTable";

export default function UserPage() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm<UserDto>();

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{ username?: string; email?: string }>({});

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<UserDto | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      await listUsers({ page, pageSize, ...search });
    } catch (e: any) {
      message.error(e?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search.username, search.email]);

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
            onClick={() => {
              setEditing(record);
              editForm.setFieldsValue(record as any);
              setEditOpen(true);
            }}
          >编辑</Button>
          <Button
            type="link"
            danger
            onClick={async () => {
              Modal.confirm({
                title: `确认删除用户 #${record.id}?`,
                onOk: async () => {
                  try {
                    await deleteUser(record.id!);
                    message.success("已删除");
                    fetchData();
                  } catch (e: any) {
                    message.error(e?.message || "删除失败");
                  }
                },
              });
            }}
          >删除</Button>
        </Space>
      ),
    },
  ], [editForm]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FormCard>
        <Form form={form} layout="inline" onFinish={(values) => setSearch(values)}>
          <Form.Item name="username" label="用户名">
            <Input allowClear placeholder="模糊搜索用户名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input allowClear placeholder="模糊搜索邮箱" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={() => { form.resetFields(); setSearch({}); }}>重置</Button>
              <Button type="dashed" onClick={() => { setEditing(null); editForm.resetFields(); setEditOpen(true); }}>新建</Button>
            </Space>
          </Form.Item>
        </Form>
      </FormCard>

      <div style={{ background: "#fff", padding: 0, borderRadius: 8 }}>
        <PaginatedTable<UserDto>
          columns={columns}
          fetchPage={async ({ page: p, pageSize: ps }) => {
            const res = await listUsers({ page: p, pageSize: ps, ...search });
            setPage(p);
            setPageSize(ps);
            return { items: res.items, total: res.total };
          }}
          defaultPageSize={pageSize}
          rowKey={(r) => String(r.id)}
        />
      </div>

      <Modal
        open={editOpen}
        title={editing ? `编辑用户 #${editing.id}` : "新建用户"}
        onCancel={() => setEditOpen(false)}
        onOk={() => {
          editForm.submit();
        }}
        okText="保存"
        destroyOnClose
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
              fetchData();
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