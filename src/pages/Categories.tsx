import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { TransactionCategoryDto, PageResponse } from "../services/types";
import { useMemo, useState, useEffect } from "react";
import { Card, Button, Input, Form, Space, message, Tag, Modal, Select } from "antd";
import PaginatedTable from "../components/PaginatedTable";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

export default function Categories() {
  const qc = useQueryClient();
  const [form] = Form.useForm<Partial<TransactionCategoryDto>>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TransactionCategoryDto | null>(null);
  const [tableKey, setTableKey] = useState(0);
  const [searchText, setSearchText] = useState("");

  // 父分类选项（用于下拉选择）
  const { data: allCategories } = useQuery<TransactionCategoryDto[]>({
    queryKey: ["categories-all"],
    queryFn: async () => (await http.get("/transactioncategory")).data,
  });

  const parentOptions = useMemo(() => {
    const list = allCategories || [];
    return list.map((c) => ({ label: `${c.name} (${c.id})`, value: c.id }));
  }, [allCategories]);

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<TransactionCategoryDto>) => {
      const resp = await http.post("/transactioncategory", payload);
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories-all"] });
      setIsModalVisible(false);
      form.resetFields();
      message.success("分类创建成功");
      setTableKey((k) => k + 1);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<TransactionCategoryDto>) => {
      const resp = await http.put("/transactioncategory", payload);
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories-all"] });
      setIsModalVisible(false);
      form.resetFields();
      message.success("分类更新成功");
      setTableKey((k) => k + 1);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await http.delete(`/transactioncategory/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories-all"] });
      message.success("分类删除成功");
      setTableKey((k) => k + 1);
    },
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: TransactionCategoryDto) => {
    if (record.userId == null) {
      message.warning("系统分类不可编辑");
      return;
    }
    setEditingCategory(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number | undefined) => {
    const record = (allCategories || []).find((c) => c.id === id);
    if (record && record.userId == null) {
      message.warning("系统分类不可删除");
      return;
    }
    if (id !== undefined) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (values: any) => {
    if (values.id) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "名称", dataIndex: "name", key: "name", width: 200 },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: number) => {
        const map: any = { 1: { text: "收入", color: "green" }, 2: { text: "支出", color: "red" }, 3: { text: "转出", color: "blue" }, 4: { text: "转入", color: "yellow" } };
        const cfg = map[type] || { text: "未知", color: "default" };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: "范围",
      dataIndex: "userId",
      key: "scope",
      width: 100,
      render: (userId?: number) => (userId == null ? <Tag color="blue">系统</Tag> : <Tag color="purple">用户</Tag>),
    },
    { title: "父级ID", dataIndex: "parentId", key: "parentId", width: 100, render: (v?: number) => v ?? "-" },
    { title: "排序", dataIndex: "sortOrder", key: "sortOrder", width: 100, render: (v?: number) => v ?? "-" },
    {
      title: "操作",
      key: "actions",
      width: 160,
      render: (_: any, record: TransactionCategoryDto) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} disabled={record.userId == null} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} disabled={record.userId == null} />
        </Space>
      ),
    },
  ];

  // 监听类型选择，限制父分类选择为相同类型（若需要）
  useEffect(() => {
    const type = form.getFieldValue("type");
    if (type && editingCategory == null) {
      // 创建时切换类型，清空父级，以避免跨类型
      form.setFieldValue("parentId", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getFieldValue("type"), editingCategory]);

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600, color: "#1D1D1F" }}>分类管理</h2>
        <p style={{ margin: "8px 0 0 0", color: "#86868B", fontSize: "14px" }}>
          系统分类（userId 为 null）为只读；其他为用户分类，可进行管理
        </p>
      </div>

      <Card style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建分类
            </Button>
          </Space>
          <Space>
            <Input.Search
              placeholder="搜索分类名称..."
              style={{ width: 300 }}
              onSearch={(value) => {
                setSearchText(value);
                setTableKey((k) => k + 1);
              }}
              allowClear
            />
          </Space>
        </div>
      </Card>

      <Card>
        <PaginatedTable<TransactionCategoryDto>
          key={tableKey}
          columns={columns as any}
          fetchPage={async ({ page, pageSize }) => {
            try {
              const resp = await http.post(
                `/transactioncategory/page?page=${page - 1}&size=${pageSize}`,
                searchText ? { name: searchText } : {}
              );
              const pr = resp.data as PageResponse<TransactionCategoryDto>;
              return { items: pr.content ?? [], total: pr.totalElements ?? 0 };
            } catch (e) {
              // 回退：使用全部数据本地分页
              const list = (allCategories || []);
              const filtered = searchText
                ? list.filter((c) => (c.name || "").toLowerCase().includes(searchText.toLowerCase()))
                : list;
              const items = filtered.slice((page - 1) * pageSize, page * pageSize);
              return { items, total: filtered.length };
            }
          }}
          defaultPageSize={10}
          rowKey={(r) => String(r.id)}
        />
      </Card>

      <Modal
        title={editingCategory ? "编辑分类" : "新建分类"}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ type: 2 }}>
          <Form.Item name="id" style={{ display: "none" }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入分类名称" }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: "请选择类型" }]}>
            <Select placeholder="请选择类型" options={[{ label: "收入", value: 1 }, { label: "支出", value: 2 }]} />
          </Form.Item>
          <Form.Item name="parentId" label="父分类">
            <Select
              allowClear
              placeholder="可选，选择父分类"
              options={parentOptions}
              showSearch
              filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <Input type="number" placeholder="可选，排序值" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="可选，图标名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
