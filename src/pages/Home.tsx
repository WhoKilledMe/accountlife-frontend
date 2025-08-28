import React from "react";
import { Card, Row, Col, Statistic, Progress, Table, Tag, Space } from "antd";
import {
  UserOutlined,
  BankOutlined,
  TransactionOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

export default function Home() {
  // 模拟数据
  const recentTransactions = [
    {
      key: "1",
      id: "T001",
      type: "收入",
      amount: 5000,
      category: "工资",
      time: "2025-01-20 10:30",
      status: "completed",
    },
    {
      key: "2",
      id: "T002",
      type: "支出",
      amount: 200,
      category: "餐饮",
      time: "2025-01-20 12:15",
      status: "completed",
    },
    {
      key: "3",
      id: "T003",
      type: "支出",
      amount: 150,
      category: "购物",
      time: "2025-01-20 15:45",
      status: "pending",
    },
  ];

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
      render: (type: string) => (
        <Tag color={type === "收入" ? "green" : "red"}>
          {type}
        </Tag>
      ),
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number, record: any) => (
        <span style={{ color: record.type === "收入" ? "#52c41a" : "#ff4d4f" }}>
          {record.type === "收入" ? "+" : "-"}¥{amount}
        </span>
      ),
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      width: 100,
    },
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: 150,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "completed" ? "green" : "orange"}>
          {status === "completed" ? "已完成" : "处理中"}
        </Tag>
      ),
    },
  ];

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
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资产"
              value={125680}
              prefix="¥"
              valueStyle={{ color: "#1890ff" }}
              prefix={<BankOutlined style={{ marginRight: 8 }} />}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#52c41a", fontSize: "12px" }}>
                <ArrowUpOutlined /> +12.5%
              </span>
              <span style={{ color: "#666", fontSize: "12px", marginLeft: 8 }}>
                较上月
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={15800}
              prefix="¥"
              valueStyle={{ color: "#52c41a" }}
              prefix={<TransactionOutlined style={{ marginRight: 8 }} />}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#52c41a", fontSize: "12px" }}>
                <ArrowUpOutlined /> +8.2%
              </span>
              <span style={{ color: "#666", fontSize: "12px", marginLeft: 8 }}>
                较上月
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月支出"
              value={8920}
              prefix="¥"
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<PieChartOutlined style={{ marginRight: 8 }} />}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                <ArrowDownOutlined /> -3.1%
              </span>
              <span style={{ color: "#666", fontSize: "12px", marginLeft: 8 }}>
                较上月
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={128}
              valueStyle={{ color: "#722ed1" }}
              prefix={<UserOutlined style={{ marginRight: 8 }} />}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#52c41a", fontSize: "12px" }}>
                <ArrowUpOutlined /> +15.3%
              </span>
              <span style={{ color: "#666", fontSize: "12px", marginLeft: 8 }}>
                较上月
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 进度和图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="预算使用情况" style={{ height: "100%" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>餐饮预算</span>
                <span>¥1,200 / ¥2,000</span>
              </div>
              <Progress percent={60} strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>交通预算</span>
                <span>¥300 / ¥500</span>
              </div>
              <Progress percent={60} strokeColor="#1890ff" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>购物预算</span>
                <span>¥800 / ¥1,000</span>
              </div>
              <Progress percent={80} strokeColor="#faad14" />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>娱乐预算</span>
                <span>¥450 / ¥500</span>
              </div>
              <Progress percent={90} strokeColor="#ff4d4f" />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="快速操作" style={{ height: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Card size="small" hoverable style={{ textAlign: "center" }}>
                <BankOutlined style={{ fontSize: 24, color: "#1890ff", marginBottom: 8 }} />
                <div>新建账户</div>
              </Card>
              <Card size="small" hoverable style={{ textAlign: "center" }}>
                <TransactionOutlined style={{ fontSize: 24, color: "#52c41a", marginBottom: 8 }} />
                <div>记录交易</div>
              </Card>
              <Card size="small" hoverable style={{ textAlign: "center" }}>
                <PieChartOutlined style={{ fontSize: 24, color: "#faad14", marginBottom: 8 }} />
                <div>设置预算</div>
              </Card>
              <Card size="small" hoverable style={{ textAlign: "center" }}>
                <UserOutlined style={{ fontSize: 24, color: "#722ed1", marginBottom: 8 }} />
                <div>用户管理</div>
              </Card>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近交易记录 */}
      <Card title="最近交易记录">
        <Table
          columns={columns}
          dataSource={recentTransactions}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
