import { Card, Row, Col, Statistic, Progress, Table, Tag, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../api/statistics";
import { transactionsApi } from "../api/transactions";
import { budgetApi } from "../api/budget";
import type { StatisticsDto, AccountTransactionDto, BudgetDto } from "../services/types";
import {
  UserOutlined,
  BankOutlined,
  TransactionOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

export default function Home() {
  // 获取当前月份和年份
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const currentYear = currentDate.getFullYear();

  // 获取月度统计
  const { data: monthlyStats, isLoading: monthlyLoading } = useQuery<StatisticsDto>({
    queryKey: ["monthly-stats", currentMonth],
    queryFn: async (): Promise<StatisticsDto> => {
      try {
        const response = await statisticsApi.getMonthlyStatistics(currentMonth);
        return response.data.data || { income: 0, expense: 0, balance: 0 };
      } catch (error) {
        console.error("获取月度统计失败:", error);
        return { income: 0, expense: 0, balance: 0 };
      }
    },
  });

  // 获取年度统计
  const { data: yearlyStats, isLoading: yearlyLoading } = useQuery<StatisticsDto>({
    queryKey: ["yearly-stats", currentYear],
    queryFn: async (): Promise<StatisticsDto> => {
      try {
        const response = await statisticsApi.getYearlyStatistics(currentYear);
        return response.data.data || { income: 0, expense: 0, balance: 0 };
      } catch (error) {
        console.error("获取年度统计失败:", error);
        return { income: 0, expense: 0, balance: 0 };
      }
    },
  });

  // 获取总资产统计
  const { data: totalStats, isLoading: totalLoading } = useQuery<StatisticsDto>({
    queryKey: ["total-stats"],
    queryFn: async (): Promise<StatisticsDto> => {
      try {
        const response = await statisticsApi.getTotalAssets();
        return response.data.data || { income: 0, expense: 0, balance: 0 };
      } catch (error) {
        console.error("获取总资产统计失败:", error);
        return { income: 0, expense: 0, balance: 0 };
      }
    },
  });

  // 获取最近交易记录
  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery<AccountTransactionDto[]>({
    queryKey: ["recent-transactions"],
    queryFn: async (): Promise<AccountTransactionDto[]> => {
      try {
        const response = await transactionsApi.page(0, 5, {});
        return response.data.content || [];
      } catch (error) {
        console.error("获取最近交易记录失败:", error);
        return [];
      }
    },
  });

  // 获取当前月份预算使用情况
  const { data: budgetUsage, isLoading: budgetLoading } = useQuery<BudgetDto[]>({
    queryKey: ["budget-usage", currentMonth],
    queryFn: async (): Promise<BudgetDto[]> => {
      try {
        const response = await budgetApi.getCurrentMonthBudgetUsage();
        return response.data.data || [];
      } catch (error) {
        console.error("获取预算使用情况失败:", error);
        return [];
      }
    },
  });

  const columns = [
    {
      title: "交易ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type: number) => {
        const typeText = type === 1 ? "收入" : "支出";
        return (
          <Tag color={type === 1 ? "green" : "red"}>
            {typeText}
          </Tag>
        );
      },
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number, record: AccountTransactionDto) => (
        <span style={{ color: record.type === 1 ? "#52c41a" : "#ff4d4f" }}>
          {record.type === 1 ? "+" : "-"}¥{amount?.toFixed(2) || 0}
        </span>
      ),
    },
    {
      title: "分类",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 100,
      render: (categoryName: string) => categoryName || "-",
    },
    {
      title: "账户",
      dataIndex: "accountName",
      key: "accountName",
      width: 120,
      render: (accountName: string) => accountName || "-",
    },
    {
      title: "时间",
      dataIndex: "transactionTime",
      key: "transactionTime",
      width: 150,
      render: (time: string) => time ? new Date(time).toLocaleString() : "-",
    },
  ];

  // 计算加载状态
  const isLoading = monthlyLoading || yearlyLoading || totalLoading || transactionsLoading || budgetLoading;

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 600, color: "#1D1D1F" }}>
          欢迎回来，Admin User
        </h1>
        <p style={{ margin: "8px 0 0 0", color: "#86868B", fontSize: "14px" }}>
          这里是您的财务管理系统仪表盘，查看最新的财务数据和统计信息
        </p>
      </div>

      {/* 统计卡片 */}
      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总资产"
                value={(totalStats?.balance as number) || 0}
                prefix={<BankOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#1890ff" }}
                formatter={(value) => `¥${Number(value).toLocaleString()}`}
              />
              <div style={{ marginTop: 8 }}>
                <span style={{ color: "#666", fontSize: "12px" }}>
                  实时数据
                </span>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="本月收入"
                value={(monthlyStats?.income as number) || 0}
                prefix={<TransactionOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#52c41a" }}
                formatter={(value) => `¥${Number(value).toLocaleString()}`}
              />
              <div style={{ marginTop: 8 }}>
                <span style={{ color: "#666", fontSize: "12px" }}>
                  本月数据
                </span>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="本月支出"
                value={(monthlyStats?.expense as number) || 0}
                prefix={<PieChartOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#ff4d4f" }}
                formatter={(value) => `¥${Number(value).toLocaleString()}`}
              />
              <div style={{ marginTop: 8 }}>
                <span style={{ color: "#666", fontSize: "12px" }}>
                  本月数据
                </span>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="年度净收入"
                value={((yearlyStats?.income as number) || 0) + ((yearlyStats?.expense as number) || 0)}
                prefix={<UserOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ 
                  color: (((yearlyStats?.income as number) || 0) + ((yearlyStats?.expense as number) || 0)) >= 0 ? "#52c41a" : "#ff4d4f" 
                }}
                formatter={(value) => `¥${Number(value).toLocaleString()}`}
              />
              <div style={{ marginTop: 8 }}>
                <span style={{ color: "#666", fontSize: "12px" }}>
                  年度数据
                </span>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* 预算使用情况 */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="预算使用情况" style={{ height: "100%" }}>
            <Spin spinning={budgetLoading}>
              {budgetUsage && budgetUsage.length > 0 ? (
                budgetUsage.slice(0, 4).map((budget, index) => {
                  const usedAmount = budget.usedAmount || 0;
                  const totalAmount = budget.amount || 0;
                  const percentage = totalAmount > 0 ? Math.round((usedAmount / totalAmount) * 100) : 0;
                  
                  // 根据使用率选择颜色
                  let strokeColor = "#52c41a"; // 绿色
                  if (percentage >= 90) {
                    strokeColor = "#ff4d4f"; // 红色
                  } else if (percentage >= 70) {
                    strokeColor = "#faad14"; // 橙色
                  } else if (percentage >= 50) {
                    strokeColor = "#1890ff"; // 蓝色
                  }
                  
                  return (
                    <div key={budget.id || index} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span>{budget.name || `预算 ${index + 1}`}</span>
                        <span>¥{usedAmount.toLocaleString()} / ¥{totalAmount.toLocaleString()}</span>
                      </div>
                      <Progress 
                        percent={percentage} 
                        strokeColor={strokeColor}
                        showInfo={true}
                        format={(percent) => `${percent}%`}
                      />
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", color: "#999", padding: "20px 0" }}>
                  暂无预算数据
                </div>
              )}
            </Spin>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="快速访问" style={{ height: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Link to="/accounts" style={{ textDecoration: "none" }}>
                <div style={{ textAlign: "center", padding: "16px", background: "#f8f9fa", borderRadius: "8px", cursor: "pointer" }}>
                  <BankOutlined style={{ fontSize: 24, color: "#1890ff", marginBottom: 8 }} />
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>账户管理</div>
                </div>
              </Link>
              <Link to="/transactions" style={{ textDecoration: "none" }}>
                <div style={{ textAlign: "center", padding: "16px", background: "#f8f9fa", borderRadius: "8px", cursor: "pointer" }}>
                  <TransactionOutlined style={{ fontSize: 24, color: "#52c41a", marginBottom: 8 }} />
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>交易记录</div>
                </div>
              </Link>
              <Link to="/budgets" style={{ textDecoration: "none" }}>
                <div style={{ textAlign: "center", padding: "16px", background: "#f8f9fa", borderRadius: "8px", cursor: "pointer" }}>
                  <PieChartOutlined style={{ fontSize: 24, color: "#ff4d4f", marginBottom: 8 }} />
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>预算管理</div>
                </div>
              </Link>
              <Link to="/categories" style={{ textDecoration: "none" }}>
                <div style={{ textAlign: "center", padding: "16px", background: "#f8f9fa", borderRadius: "8px", cursor: "pointer" }}>
                  <UserOutlined style={{ fontSize: 24, color: "#722ed1", marginBottom: 8 }} />
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>分类管理</div>
                </div>
              </Link>
              <Link to="/upload" style={{ textDecoration: "none" }}>
                <div style={{ textAlign: "center", padding: "16px", background: "#f8f9fa", borderRadius: "8px", cursor: "pointer" }}>
                  <TransactionOutlined style={{ fontSize: 24, color: "#faad14", marginBottom: 8 }} />
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>导入流水</div>
                </div>
              </Link>
              <Link to="/keywords" style={{ textDecoration: "none" }}>
                <div style={{ textAlign: "center", padding: "16px", background: "#f8f9fa", borderRadius: "8px", cursor: "pointer" }}>
                  <UserOutlined style={{ fontSize: 24, color: "#1890ff", marginBottom: 8 }} />
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>关键字映射</div>
                </div>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近交易记录 */}
      <Card title="最近交易记录">
        <Spin spinning={transactionsLoading}>
          <Table
            columns={columns}
            dataSource={recentTransactions || []}
            pagination={false}
            size="small"
            rowKey={(record) => String(record.id)}
            locale={{
              emptyText: "暂无交易记录"
            }}
          />
        </Spin>
      </Card>
    </div>
  );
}
