import { useMemo, useState } from "react";
import { Form, Input, Button, Space, Modal, message, Drawer, Descriptions, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UserGroupDto } from "../services/types";
import { listUserGroups, createUserGroup, updateUserGroup, deleteUserGroup, getUserGroup } from "../api/userGroups";
import { PlusOutlined } from "@ant-design/icons";
import { CreateButton, EditButton, DeleteButton } from "../components/ActionButtons";
import PaginatedTable from "../components/PaginatedTable";

export default function UserGroups() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm<UserGroupDto>();

  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{ name?: string }>({});
  const [tableKey, setTableKey] = useState(0);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserGroupDto | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<UserGroupDto | null>(null);

  const columns: ColumnsType<UserGroupDto> = useMemo(() => [
    { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => (a.id || 0) - (b.id || 0) },
    { title: "组名称", dataIndex: "name", sorter: (a, b) => (a.name || "").localeCompare(b.name || "") },
    { title: "描述", dataIndex: "description" },
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
                const d = await getUserGroup(record.id!);
                setDetail(d);
              } catch (e: any) {
                message.error(e?.message || "加载详情失败");
              } finally {
                setDetailLoading(false);
              }
            }}
          >查看</Button>
          <EditButton permKey="userGroup:edit" onClick={() => {
            setEditing(record);
            editForm.setFieldsValue(record as any);
            setEditOpen(true);
          }} />
          <DeleteButton
            permKey="userGroup:delete"
            onConfirm={async () => {
              try {
                await deleteUserGroup(record.id!);
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
          用户组管理
        </h2>
        <p style={{ margin: "8px 0 0 0", color: "#86868B", fontSize: "14px" }}>
          管理用户组与权限设置
        </p>
      </div>

      <Card style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <CreateButton icon={<PlusOutlined />} permKey="userGroup:create" onClick={() => { setEditing(null); editForm.resetFields(); setEditOpen(true); }}>
              新建用户组
            </CreateButton>
          </Space>
          <Form form={form} layout="inline" onFinish={(values) => { setSearch(values); setTableKey((k) => k + 1); }}>
            <Form.Item name="name" label="组名称">
              <Input allowClear placeholder="模糊搜索组名称" style={{ width: 240 }} />
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
        <PaginatedTable<UserGroupDto>
          key={tableKey}
          columns={columns}
          fetchPage={async ({ page: p, pageSize: ps }) => {
            const res = await listUserGroups({ page: p, pageSize: ps, ...search });
            setPageSize(ps);
            return { items: res.items, total: res.total };
          }}
          defaultPageSize={pageSize}
          rowKey={(r) => String(r.id)}
        />
      </Card>

      <Modal
        open={editOpen}
        title={editing ? `编辑用户组 #${editing.id}` : "新建用户组"}
        onCancel={() => setEditOpen(false)}
        onOk={() => {
          editForm.submit();
        }}
        okText="保存"
        destroyOnClose
        width={600}
      >
        <Form<UserGroupDto>
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (editing?.id) {
                await updateUserGroup({ ...values, id: editing.id });
                message.success("已保存");
              } else {
                await createUserGroup(values);
                message.success("已创建");
              }
              setEditOpen(false);
              setTableKey((k) => k + 1);
            } catch (e: any) {
              message.error(e?.message || "保存失败");
            }
          }}
        >
          <Form.Item name="name" label="组名称" rules={[{ required: true, message: "请输入组名称" }]}>
            <Input placeholder="组名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={detailOpen}
        width={480}
        onClose={() => setDetailOpen(false)}
        title={detail ? `用户组详情 #${detail.id}` : "用户组详情"}
      >
        {detailLoading ? (
          <div>加载中...</div>
        ) : detail ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="组名称">{detail.name}</Descriptions.Item>
            <Descriptions.Item label="描述">{detail.description}</Descriptions.Item>
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


