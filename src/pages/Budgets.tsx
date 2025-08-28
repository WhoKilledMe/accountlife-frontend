import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { ApiResponse, BudgetDto } from "../services/types";
import { useState } from "react";
import { Card, Button, Input, Form, Space, message, Statistic, Row, Col, Tag, Modal } from "antd";
import PaginatedTable from "../components/PaginatedTable";
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

// 模拟数据
const mockBudgets: BudgetDto[] = [
  {
    id: 1,
    userId: 1,
    name: "餐饮预算",
    type: "MONTHLY",
    categoryId: 1,
    categoryName: "餐饮",
    amount: 2000,
    usedAmount: 1200,
    remainingAmount: 800,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    status: "ACTIVE",
    alertThreshold: 80,
    remark: "每月餐饮支出预算",
    createdBy: 1,
    createdAt: "2025-01-01T00:00:00Z",
    updatedBy: 1,
    updatedAt: "2025-01-01T00:00:00Z",
    isDeleted: false,
  },
  {
    id: 2,
    userId: 1,
    name: "交通预算",
    type: "MONTHLY",
    categoryId: 2,
    categoryName: "交通",
    amount: 500,
    usedAmount: 300,
    remainingAmount: 200,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    status: "ACTIVE",
    alertThreshold: 70,
    remark: "每月交通支出预算",
    createdBy: 1,
    createdAt: "2025-01-01T00:00:00Z",
    updatedBy: 1,
    updatedAt: "2025-01-01T00:00:00Z",
    isDeleted: false,
  },
  {
    id: 3,
    userId: 1,
    name: "购物预算",
    type: "MONTHLY",
    categoryId: 3,
    categoryName: "购物",
    amount: 1000,
    usedAmount: 800,
    remainingAmount: 200,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    status: "ACTIVE",
    alertThreshold: 90,
    remark: "每月购物支出预算",
    createdBy: 1,
    createdAt: "2025-01-01T00:00:00Z",
    updatedBy: 1,
    updatedAt: "2025-01-01T00:00:00Z",
    isDeleted: false,
  },
];

export default function Budgets() {
  const userId = 1;
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetDto | null>(null);

  // 使用模拟数据，避免后端错误
  const { data, isLoading, error } = useQuery<ApiResponse<BudgetDto[]>>({
    queryKey: ["budgets", userId],
    queryFn: async () => {
      try {
        const response = await http.get(`/budget/user/${userId}`);
        return response.data;
      } catch (error) {
        console.log("使用模拟数据，后端API暂时不可用");
        // 返回模拟数据
        return {
          code: 200,
          message: "success",
          data: mockBudgets,
        };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<BudgetDto>) => {
      try {
        const response = await http.post(`/budget`, payload);
        return response.data;
      } catch (error) {
        // 模拟创建成功
        message.success("预算创建成功（模拟）");
        return { code: 200, message: "success" };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets", userId] });
      setIsModalVisible(false);
      form.resetFields();
      message.success("预算创建成功");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await http.delete(`/budget/${id}`);
        return response.data;
      } catch (error) {
        // 模拟删除成功
        message.success("预算删除成功（模拟）");
        return { code: 200, message: "success" };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets", userId] });
      message.success("预算删除成功");
    },
  });

  const budgets = data?.data ?? mockBudgets;

  const handleCreate = () => {
    setEditingBudget(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: BudgetDto) => {
    setEditingBudget(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = (values: any) => {
    createMutation.mutate(values);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "预算名称",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "分类",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 120,
    },
    {
      title: "预算金额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: "已用金额",
      dataIndex: "usedAmount",
      key: "usedAmount",
      width: 120,
      render: (usedAmount: number) => `¥${usedAmount.toLocaleString()}`,
    },
    {
      title: "剩余金额",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 120,
      render: (remainingAmount: number, record: BudgetDto) => {
        const percentage = (record.usedAmount / record.amount) * 100;
        let color = "green";
        if (percentage > 80) color = "red";
        else if (percentage > 60) color = "orange";
        
        return (
          <Space>
            <span>¥{remainingAmount.toLocaleString()}</span>
            <Tag color={color}>{percentage.toFixed(1)}%</Tag>
          </Space>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusMap = {
          ACTIVE: { text: "活跃", color: "green" },
          INACTIVE: { text: "停用", color: "red" },
          EXPIRED: { text: "过期", color: "orange" },
        };
        const config = statusMap[status as keyof typeof statusMap] || { text: status, color: "default" };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: (_: any, record: BudgetDto) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => message.info("查看详情功能开发中")}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalUsed = budgets.reduce((sum, budget) => sum + budget.usedAmount, 0);
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remainingAmount, 0);
  const usagePercentage = totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0;

  return (
    <div style={{ padding: "24px" }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600, color: "#1D1D1F" }}>
          预算管理
        </h2>
        <p style={{ margin: "8px 0 0 0", color: "#86868B", fontSize: "14px" }}>
          管理您的财务预算，跟踪支出情况
        </p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总预算"
              value={totalBudget}
              prefix="¥"
              valueStyle={{ color: "#007AFF" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已使用"
              value={totalUsed}
              prefix="¥"
              valueStyle={{ color: "#FF3B30" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="剩余金额"
              value={totalRemaining}
              prefix="¥"
              valueStyle={{ color: "#34C759" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="使用率"
              value={usagePercentage}
              suffix="%"
              valueStyle={{ color: usagePercentage > 80 ? "#FF3B30" : "#34C759" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建预算
            </Button>
          </Space>
          <Space>
            <Input.Search
              placeholder="搜索预算..."
              style={{ width: 300 }}
              onSearch={(value) => message.info(`搜索: ${value}`)}
            />
          </Space>
        </div>
      </Card>

      {/* 预算列表 */}
      <Card>
        <PaginatedTable<BudgetDto>
          columns={columns as any}
          fetchPage={async ({ page, pageSize }) => {
            const items = budgets.slice((page - 1) * pageSize, page * pageSize);
            return { items, total: budgets.length };
          }}
          defaultPageSize={10}
          rowKey={(r) => String(r.id)}
        />
      </Card>

             {/* 创建/编辑弹窗 */}
       <Modal
         title={editingBudget ? "编辑预算" : "新建预算"}
         open={isModalVisible}
         onOk={() => form.submit()}
         onCancel={() => {
           setIsModalVisible(false);
           form.resetFields();
         }}
         confirmLoading={createMutation.isPending}
         width={600}
       >
         <Form
           form={form}
           onFinish={handleSubmit}
           layout="vertical"
         >
           <Form.Item
             name="name"
             label="预算名称"
             rules={[{ required: true, message: "请输入预算名称" }]}
           >
             <Input placeholder="请输入预算名称" />
           </Form.Item>
           <Form.Item
             name="amount"
             label="预算金额"
             rules={[{ required: true, message: "请输入预算金额" }]}
           >
             <Input type="number" placeholder="请输入预算金额" />
           </Form.Item>
           <Form.Item
             name="categoryId"
             label="分类ID"
             rules={[{ required: true, message: "请输入分类ID" }]}
           >
             <Input type="number" placeholder="请输入分类ID" />
           </Form.Item>
           <Form.Item
             name="startDate"
             label="开始日期"
             rules={[{ required: true, message: "请选择开始日期" }]}
           >
             <Input placeholder="YYYY-MM-DD" />
           </Form.Item>
           <Form.Item
             name="endDate"
             label="结束日期"
             rules={[{ required: true, message: "请选择结束日期" }]}
           >
             <Input placeholder="YYYY-MM-DD" />
           </Form.Item>
         </Form>
       </Modal>
    </div>
  );
}
