import { Card, Typography, DatePicker, Space, Table } from "antd";
import type { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
// import { http } from "../lib/http";
import { businessApi } from "../api/business";

type BusinessTransactionDto = {
  id: number;
  transactionTime?: string;
  description?: string;
  amount?: number;
};

export default function Businesses() {
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BusinessTransactionDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 90 },
      { title: "交易时间", dataIndex: "transactionTime", key: "transactionTime", width: 200, render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-") },
      { title: "摘要", dataIndex: "description", key: "description" },
      { title: "金额", dataIndex: "amount", key: "amount", width: 140, render: (v: number) => (v == null ? "-" : `¥${Number(v).toFixed(2)}`) },
    ],
    []
  );

  const fetchPage = async (curPage = page, size = pageSize) => {
    setLoading(true);
    try {
      const body: any = {};
      if (range && range[0] && range[1]) {
        body.transactionStartDate = range[0].toISOString();
        body.transactionEndDate = range[1].toISOString();
      }
      const resp = await businessApi.page(curPage - 1, size, body);
      const pr = resp.data as any;
      setData(pr.content ?? []);
      setTotal(pr.totalElements ?? 0);
      setPage(curPage);
      setPageSize(size);
    } catch (e) {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>业务交易管理</Typography.Title>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <DatePicker.RangePicker
            showTime
            onChange={(v) => setRange(v)}
            onCalendarChange={() => {}}
          />
          <a onClick={() => fetchPage(1, pageSize)}>查询</a>
        </Space>
      </Card>
      <Card>
        <Table
          rowKey={(r) => String(r.id)}
          loading={loading}
          columns={columns as any}
          dataSource={data}
          pagination={{
            total,
            current: page,
            pageSize,
            showSizeChanger: true,
            onChange: (p, ps) => fetchPage(p, ps),
          }}
        />
      </Card>
    </div>
  );
}


