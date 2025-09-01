import { useMemo, useState } from "react";
import { Form, Input, Button, Space, Modal, message, Drawer, Descriptions } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UserGroupDto } from "../services/types";
import { listUserGroups, createUserGroup, updateUserGroup, deleteUserGroup, getUserGroup } from "../api/userGroups";
import FormCard from "../components/FormCard";
import PaginatedTable from "../components/PaginatedTable";

export default function UserGroups() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm<UserGroupDto>();

  const [page, setPage] = useState(1);
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
                title: `确认删除用户组 #${record.id}?`,
                onOk: async () => {
                  try {
                    await deleteUserGroup(record.id!);
                    message.success("已删除");
                    setTableKey((k) => k + 1);
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
        <Form form={form} layout="inline" onFinish={(values) => { setSearch(values); setPage(1); setTableKey((k) => k + 1); }}>
          <Form.Item name="name" label="组名称">
            <Input allowClear placeholder="模糊搜索组名称" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={() => { form.resetFields(); setSearch({}); setPage(1); setTableKey((k) => k + 1); }}>重置</Button>
              <Button type="dashed" onClick={() => { setEditing(null); editForm.resetFields(); setEditOpen(true); }}>新建</Button>
            </Space>
          </Form.Item>
        </Form>
      </FormCard>

      <div style={{ background: "#fff", padding: 0, borderRadius: 8 }}>
        <PaginatedTable<UserGroupDto>
          key={tableKey}
          columns={columns}
          fetchPage={async ({ page: p, pageSize: ps }) => {
            const res = await listUserGroups({ page: p, pageSize: ps, ...search });
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
        title={editing ? `编辑用户组 #${editing.id}` : "新建用户组"}
        onCancel={() => setEditOpen(false)}
        onOk={() => {
          editForm.submit();
        }}
        okText="保存"
        destroyOnClose
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


