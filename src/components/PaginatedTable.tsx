import { Table } from "antd";
import type { TableProps } from "antd";
import { useState, useEffect } from "react";

export type FetchPageResult<T> = { items: T[]; total: number };

export type PaginatedTableProps<T extends { id?: number | string }> = {
  columns: TableProps<T>["columns"];
  fetchPage: (params: { page: number; pageSize: number }) => Promise<FetchPageResult<T>>;
  defaultPageSize?: number;
  rowKey?: (record: T) => string;
};

export default function PaginatedTable<T extends { id?: number | string }>({
  columns,
  fetchPage,
  defaultPageSize = 10,
  rowKey,
}: PaginatedTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchPage({ page, pageSize });
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  return (
    <Table<T>
      rowKey={rowKey || ((r) => String((r as any).id))}
      loading={loading}
      columns={columns}
      dataSource={data}
      onChange={(pagination) => {
        setPage(pagination.current || 1);
        setPageSize(pagination.pageSize || defaultPageSize);
      }}
      pagination={{ current: page, pageSize, total, showSizeChanger: true }}
    />
  );
}

