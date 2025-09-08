import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, Input, Form, Space, message, Tag, Modal, Select, Switch } from "antd";
import PaginatedTable from "../components/PaginatedTable";
import { PlusOutlined } from "@ant-design/icons";
import { CreateButton, EditButton, DeleteButton } from "../components/ActionButtons";
import type { AccountConfigDto } from "../services/types";
import { accountConfigApi } from "../api/accountConfig";
import { AccountTypeEnum, ActiveStatusBooleanEnum, getEnumItemByKey, toSelectOptions } from "./enums";

export default function AccountConfigs() {
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState<AccountConfigDto | null>(null);
  const [tableKey, setTableKey] = useState(0);

  // filter state
  const [searchName, setSearchName] = useState("");
  const [searchType, setSearchType] = useState<number | undefined>(undefined);
  const [searchActive, setSearchActive] = useState<boolean | undefined>(undefined);

  const typeOptions = useMemo(() => toSelectOptions(AccountTypeEnum), []);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "名称", dataIndex: "name", key: "name", width: 200 },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: number) => {
        const item = getEnumItemByKey(AccountTypeEnum, type);
        return <Tag color={item?.color || "default"}>{item?.value || "未知"}</Tag>;
      },
    },
    { title: "平台代码", dataIndex: "platformCode", key: "platformCode", width: 140, render: (v: string) => v || "-" },
    { title: "官网", dataIndex: "websiteUrl", key: "websiteUrl", width: 200, render: (v: string) => v || "-" },
    { title: "账单邮箱", dataIndex: "billEmail", key: "billEmail", width: 220, render: (v: string) => v || "-" },
    {
      title: "启用",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (active: boolean) => active ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>,
    },
    {
      title: "操作",
      key: "actions",
      width: 160,
      render: (_: any, record: AccountConfigDto) => (
        <Space size="small">
          <EditButton permKey="sys-account-config:edit" onClick={() => onEdit(record)} />
          <DeleteButton permKey="sys-account-config:delete" onConfirm={() => onDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const onCreate = () => {
    setEditing(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const onEdit = (record: AccountConfigDto) => {
    setEditing(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<AccountConfigDto>) => (await accountConfigApi.create(payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accountConfigsPage"] });
      message.success("新增成功");
      setIsModalVisible(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<AccountConfigDto>) => (await accountConfigApi.update(payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accountConfigsPage"] });
      message.success("更新成功");
      setIsModalVisible(false);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id?: number) => { if (id != null) await accountConfigApi.remove(id); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accountConfigsPage"] });
      message.success("删除成功");
    },
  });

  const onDelete = (id?: number) => {
    if (id == null) return;
    deleteMutation.mutate(id);
  };

  const onSubmit = (values: any) => {
    if (values.id) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  // 触发表格刷新
  const triggerRefresh = () => setTableKey(k => k + 1);

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>系统账户配置</h2>
        <p style={{ margin: "8px 0 0 0", color: "#86868B", fontSize: "14px" }}>维护系统级账户配置，供账户创建时选择</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <CreateButton icon={<PlusOutlined />} permKey="sys-account-config:create" onClick={onCreate}>新建配置</CreateButton>
          </Space>
          <Space>
            <Input.Search placeholder="按名称搜索..." allowClear style={{ width: 240 }} onSearch={(v) => { setSearchName(v); triggerRefresh(); }} />
            <Select
              placeholder="类型"
              allowClear
              style={{ width: 140 }}
              options={typeOptions}
              onChange={(v) => { setSearchType(v); triggerRefresh(); }}
            />
            <Select
              placeholder="启用状态"
              allowClear
              style={{ width: 140 }}
              options={toSelectOptions(ActiveStatusBooleanEnum)}
              onChange={(v) => { setSearchActive(v); triggerRefresh(); }}
            />
          </Space>
        </div>
      </Card>

      <Card>
        <PaginatedTable<AccountConfigDto>
          key={tableKey}
          columns={columns as any}
          fetchPage={async ({ page, pageSize }) => {
            const resp = await accountConfigApi.page(page - 1, pageSize, {
              name: searchName || undefined,
              type: searchType,
              isActive: searchActive,
            });
            const pr: any = resp.data;
            return { items: pr.content ?? [], total: pr.totalElements ?? 0 };
          }}
          defaultPageSize={10}
          rowKey={(r) => String(r.id)}
        />
      </Card>

      <Modal
        title={editing ? "编辑配置" : "新建配置"}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item name="id" style={{ display: "none" }}><Input type="hidden" /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}>
            <Input placeholder="如：招商银行、支付宝" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: "请选择类型" }]}>
            <Select placeholder="请选择类型" options={typeOptions} />
          </Form.Item>
          <Form.Item name="platformCode" label="平台代码">
            <Input placeholder="如：ALIPAY、MEITUAN" />
          </Form.Item>
          <Form.Item name="websiteUrl" label="官网登录地址">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="billEmail" label="账单邮箱">
            <Input placeholder="可选，账单邮箱" />
          </Form.Item>
          <Form.Item name="isActive" label="是否启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序权重">
            <Input type="number" placeholder="可选，越小越靠前" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="可选，简要描述" />
          </Form.Item>
          <Form.Item name="logoUrl" label="Logo地址">
            <Input placeholder="可选，Logo 图片 URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


