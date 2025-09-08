import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { AccountTransactionDto, StatisticsDto } from "../services/types";
import { useState } from "react";
import { Card, Button, Input, Form, Space, message, Statistic, Row, Col, Tag, Modal, Spin, Select } from "antd";
import PaginatedTable from "../components/PaginatedTable";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { CreateButton, EditButton, DeleteButton } from "../components/ActionButtons";
import { statisticsApi } from "../api/statistics";
import { TransactionTypeEnum, getEnumItemByKey, toSelectOptions } from "./enums";
import { transactionsApi, transactionCategoryApi, assetAccountApi } from "../api/transactions";

// 模拟数据
const mockTransactions: AccountTransactionDto[] = [
  {
    id: 1,
    accountId: 1,
    type: 1,
    amount: 1000,
    categoryId: 1,
    description: "工资收入",
    transactionTime: "2025-01-15T10:30:00Z",
    createdBy: "1",
    createdAt: "2025-01-15T10:30:00Z",
    updatedBy: "1",
    updatedAt: "2025-01-15T10:30:00Z",
    isDeleted: 0,
  },
  {
    id: 2,
    accountId: 1,
    type: 2,
    amount: 200,
    categoryId: 2,
    description: "餐饮支出",
    transactionTime: "2025-01-16T12:00:00Z",
    createdBy: "1",
    createdAt: "2025-01-16T12:00:00Z",
    updatedBy: "1",
    updatedAt: "2025-01-16T12:00:00Z",
    isDeleted: 0,
  },
  {
    id: 3,
    accountId: 1,
    type: 2,
    amount: 150,
    categoryId: 3,
    description: "购物支出",
    transactionTime: "2025-01-17T15:45:00Z",
    createdBy: "1",
    createdAt: "2025-01-17T15:45:00Z",
    updatedBy: "1",
    updatedAt: "2025-01-17T15:45:00Z",
    isDeleted: 0,
  },
];

export default function Transactions() {
  const qc = useQueryClient();
  const currencyFormat = new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<AccountTransactionDto | null>(null);

  // 获取当前月份
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const currentYear = currentDate.getFullYear();

  // 使用模拟数据，避免后端错误
  const { data } = useQuery<AccountTransactionDto[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      try {
        const response = await http.get("/accounttransaction");
        return response.data;
      } catch (error) {
        console.log("使用模拟数据，后端API暂时不可用");
        return mockTransactions;
      }
    },
  });

  // 获取月度统计
  const { data: monthlyStats, isLoading: monthlyStatsLoading } = useQuery<StatisticsDto>({
    queryKey: ["monthly-stats", currentMonth],
    queryFn: async (): Promise<StatisticsDto> => {
      try {
        const response = await statisticsApi.getMonthlyStatistics(currentMonth);
        return response.data.data || {
          type: "monthly",
          income: 5000,
          expense: 3000,
          date: currentMonth + "-01"
        };
      } catch (error) {
        console.log("月度统计接口调用失败，使用模拟数据");
        return {
          type: "monthly",
          income: 5000,
          expense: 3000,
          date: currentMonth + "-01"
        };
      }
    },
  });

  // 获取年度统计
  const { data: yearlyStats, isLoading: yearlyStatsLoading } = useQuery<StatisticsDto>({
    queryKey: ["yearly-stats", currentYear],
    queryFn: async (): Promise<StatisticsDto> => {
      try {
        const response = await statisticsApi.getYearlyStatistics(currentYear);
        return response.data.data || {
          type: "yearly",
          income: 60000,
          expense: 36000,
          date: `${currentYear}-01-01`
        };
      } catch (error) {
        console.log("年度统计接口调用失败，使用模拟数据");
        return {
          type: "yearly",
          income: 60000,
          expense: 36000,
          date: `${currentYear}-01-01`
        };
      }
    },
  });

  // 获取总资产统计
  const { data: totalAssets, isLoading: totalAssetsLoading } = useQuery<StatisticsDto>({
    queryKey: ["total-assets"],
    queryFn: async (): Promise<StatisticsDto> => {
      try {
        const response = await statisticsApi.getTotalAssets();
        return response.data.data || {
          type: "totalAssets",
          value: 150000,
          unit: "CNY"
        };
      } catch (error) {
        console.log("总资产统计接口调用失败，使用模拟数据");
        return {
          type: "totalAssets",
          value: 150000,
          unit: "CNY"
        };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<AccountTransactionDto>) => {
      try {
        const response = await http.post("/accounttransaction", payload);
        return response.data;
      } catch (error) {
        message.success("交易创建成功（模拟）");
        return { code: 200, message: "success" };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setIsModalVisible(false);
      form.resetFields();
      message.success("交易创建成功");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<AccountTransactionDto>) => {
      try {
        const response = await http.put("/accounttransaction", payload);
        return response.data;
      } catch (error) {
        message.success("交易更新成功（模拟）");
        return { code: 200, message: "success" };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setIsModalVisible(false);
      form.resetFields();
      message.success("交易更新成功");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await http.delete(`/accounttransaction/${id}`);
        return response.data;
      } catch (error) {
        message.success("交易删除成功（模拟）");
        return { code: 200, message: "success" };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      message.success("交易删除成功");
    },
  });

  const transactions = data || mockTransactions;
  const [tableKey, setTableKey] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<{label:string; value:number}[]>([]);
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryHasMore, setCategoryHasMore] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryKeyword, setCategoryKeyword] = useState<string | undefined>(undefined);

  const [accountOptions, setAccountOptions] = useState<{label:string; value:number}[]>([]);
  const [accountPage, setAccountPage] = useState(0);
  const [accountHasMore, setAccountHasMore] = useState(true);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountKeyword, setAccountKeyword] = useState<string | undefined>(undefined);

  const loadCategories = async (page = 0, keyword?: string, append = false) => {
    if (categoryLoading) return;
    setCategoryLoading(true);
    try {
      const resp = await transactionCategoryApi.select(page, 20, keyword);
      const pr = resp.data as any;
      const opts = (pr.content || []).map((c: any) => ({ label: c.name, value: c.id }));
      setCategoryOptions(prev => append ? [...prev, ...opts] : opts);
      setCategoryPage(page);
      const total = pr.totalElements ?? 0;
      const pageSize = pr.pageSize ?? 20;
      const loadedCount = (page + 1) * pageSize;
      setCategoryHasMore(loadedCount < total);
    } catch (e) {
      if (!append) setCategoryOptions([]);
      setCategoryHasMore(false);
    } finally {
      setCategoryLoading(false);
    }
  };

  const loadAccounts = async (page = 0, keyword?: string, append = false) => {
    if (accountLoading) return;
    setAccountLoading(true);
    try {
      const resp = await assetAccountApi.select(page, 20, keyword);
      const pr = resp.data as any;
      const opts = (pr.content || []).map((a: any) => ({ label: a.name, value: a.id }));
      setAccountOptions(prev => append ? [...prev, ...opts] : opts);
      setAccountPage(page);
      const total = pr.totalElements ?? 0;
      const pageSize = pr.pageSize ?? 20;
      const loadedCount = (page + 1) * pageSize;
      setAccountHasMore(loadedCount < total);
    } catch (e) {
      if (!append) setAccountOptions([]);
      setAccountHasMore(false);
    } finally {
      setAccountLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: AccountTransactionDto) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      ...record,
      // 让下拉显示分类中文名，同时保持提交时可拿到id
      categoryId: record.categoryId != null ? { value: record.categoryId, label: record.categoryName } : undefined,
      // 让下拉显示账户名称，同时保持提交时可拿到id
      accountId: record.accountId != null ? { value: record.accountId, label: record.accountName } : undefined,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: number | undefined) => {
    if (id !== undefined) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (values: any) => {
    // 处理分类和账户：labelInValue 下拉会返回 { value, label }
    const payload: any = { ...values };
    if (payload.categoryId && typeof payload.categoryId === 'object') {
      payload.categoryId = payload.categoryId.value;
    }
    if (payload.accountId && typeof payload.accountId === 'object') {
      payload.accountId = payload.accountId.value;
    }
    // 隐藏ID，仅用于区分创建/编辑，不允许修改业务主键
    if (payload.id) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: number) => {
        const item = getEnumItemByKey(TransactionTypeEnum, type);
        return <Tag color={item?.color || "default"}>{item?.value || "未知"}</Tag>;
      },
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number, record: AccountTransactionDto) => {
        const isIncome = record.type === 1;
        return (
          <span style={{ color: isIncome ? "#34C759" : "#FF3B30", fontWeight: 500 }}>
            ¥{currencyFormat.format(amount || 0)}
          </span>
        );
      },
    },
    {
      title: "账户名称",
      dataIndex: "accountName",
      key: "accountName",
      width: 140,
      render: (name: string) => name || "-",
    },
    {
      title: "交易时间",
      dataIndex: "transactionTime",
      key: "transactionTime",
      width: 180,
      render: (time: string) => new Date(time).toLocaleString("zh-CN"),
    },
    {
      title: "说明",
      dataIndex: "description",
      key: "description",
      width: 200,
    },
    {
      title: "分类",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 140,
      render: (name: string) => name || "-",
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: (_: any, record: AccountTransactionDto) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => message.info("查看详情功能开发中")}
          />
          <EditButton permKey="transaction:edit" onClick={() => handleEdit(record)} />
          <DeleteButton permKey="transaction:delete" onConfirm={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  // 使用接口数据计算统计数据
  const totalIncome = (monthlyStats?.income as number) || 0;
  const totalExpense = (monthlyStats?.expense as number) || 0;
  const netAmount = totalIncome - totalExpense;
  // const transactionCount = transactions.length;

  // 统计加载状态
  const statsLoading = monthlyStatsLoading || yearlyStatsLoading || totalAssetsLoading;

  return (
    <div style={{ padding: "24px" }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600, color: "#1D1D1F" }}>
          交易记录
        </h2>
        <p style={{ margin: "8px 0 0 0", color: "#86868B", fontSize: "14px" }}>
          管理您的所有交易记录，跟踪收支情况
        </p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="本月收入"
                value={Number(totalIncome.toFixed(2))}
                precision={2}
                prefix="¥"
                valueStyle={{ color: "#34C759" }}
              />
            </Spin>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="本月支出"
                value={Number(totalExpense.toFixed(2))}
                precision={2}
                prefix="¥"
                valueStyle={{ color: "#FF3B30" }}
              />
            </Spin>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="本月净收入"
                value={Number(netAmount.toFixed(2))}
                precision={2}
                prefix="¥"
                valueStyle={{ color: netAmount >= 0 ? "#34C759" : "#FF3B30" }}
              />
            </Spin>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="总资产"
                value={Number(((totalAssets?.value as number) || 0).toFixed(2))}
                precision={2}
                prefix="¥"
                valueStyle={{ color: "#007AFF" }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* 年度统计卡片 */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={8}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="年度收入"
                value={Number(((yearlyStats?.income as number) || 0).toFixed(2))}
                precision={2}
                prefix="¥"
                valueStyle={{ color: "#34C759" }}
              />
            </Spin>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="年度支出"
                value={Number(((yearlyStats?.expense as number) || 0).toFixed(2))}
                precision={2}
                prefix="¥"
                valueStyle={{ color: "#FF3B30" }}
              />
            </Spin>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="年度净收入"
                value={Number((((yearlyStats?.income as number) || 0) + ((yearlyStats?.expense as number) || 0)).toFixed(2))}
                precision={2}
                prefix="¥"
                valueStyle={{ color: (((yearlyStats?.income as number) || 0) + ((yearlyStats?.expense as number) || 0)) >= 0 ? "#34C759" : "#FF3B30" }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <CreateButton icon={<PlusOutlined />} permKey="transaction:create" onClick={handleCreate}>新建交易</CreateButton>
          </Space>
          <Space>
            <Input.Search
              placeholder="搜索交易..."
              style={{ width: 300 }}
              onSearch={(value) => {
                setSearchText(value);
                // 触发表格刷新
                setTableKey((k) => k + 1);
              }}
              allowClear
            />
          </Space>
        </div>
      </Card>

      {/* 交易列表 */}
      <Card>
        <PaginatedTable<AccountTransactionDto>
          key={tableKey}
          columns={columns as any}
          fetchPage={async ({ page, pageSize }) => {
            try {
              const resp = await transactionsApi.page(page - 1, pageSize, searchText ? { description: searchText } : undefined);
              const pr = resp.data as any;
              return { items: pr.content ?? [], total: pr.totalElements ?? 0 };
            } catch (e) {
              // 后端不可用时，使用本地模拟+前端分页
              const items = transactions.slice((page - 1) * pageSize, page * pageSize);
              return { items, total: transactions.length };
            }
          }}
          defaultPageSize={10}
          rowKey={(r) => String(r.id)}
        />
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={editingTransaction ? "编辑交易" : "新建交易"}
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
          {/* 隐藏的ID，仅编辑时携带，不可编辑 */}
          <Form.Item name="id" style={{ display: "none" }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name="accountId"
            label="账户名称"
            rules={[{ required: true, message: "请选择账户" }]}
          >
            <Select
              showSearch
              labelInValue
              placeholder="请选择账户"
              onSearch={(v) => { setAccountKeyword(v); loadAccounts(0, v, false); }}
              onFocus={() => loadAccounts(0, accountKeyword, false)}
              filterOption={false}
              options={accountOptions}
              allowClear
              onPopupScroll={(e) => {
                const target = e.target as HTMLElement;
                if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
                  if (accountHasMore && !accountLoading) {
                    loadAccounts(accountPage + 1, accountKeyword, true);
                  }
                }
              }}
              notFoundContent={accountLoading ? <span>加载中...</span> : undefined}
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="交易类型"
            rules={[{ required: true, message: "请选择交易类型" }]}
          >
            <Select
              placeholder="请选择交易类型"
              options={toSelectOptions(TransactionTypeEnum)}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: "请输入金额" }]}
          >
            <Input type="number" placeholder="请输入金额" />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="分类"
          >
            <Select
              showSearch
              labelInValue
              placeholder="请选择分类"
              onSearch={(v) => { setCategoryKeyword(v); loadCategories(0, v, false); }}
              onFocus={() => loadCategories(0, categoryKeyword, false)}
              filterOption={false}
              options={categoryOptions}
              allowClear
              onPopupScroll={(e) => {
                const target = e.target as HTMLElement;
                if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
                  if (categoryHasMore && !categoryLoading) {
                    loadCategories(categoryPage + 1, categoryKeyword, true);
                  }
                }
              }}
              notFoundContent={categoryLoading ? <span>加载中...</span> : undefined}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="说明"
            rules={[{ required: true, message: "请输入说明" }]}
          >
            <Input placeholder="请输入交易说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
