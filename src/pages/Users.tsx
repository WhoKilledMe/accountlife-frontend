import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { UserDto } from "../services/types";
import { useMemo, useState } from "react";
import PaginatedTable from "../components/PaginatedTable";
import { Button, Form, Input, Space } from "antd";
import FormCard from "../components/FormCard";

export default function Users() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<UserDto[]>({
    queryKey: ["users"],
    queryFn: async () => (await http.get("/user")).data,
  });

  const [form, setForm] = useState<Partial<UserDto>>({ username: "", email: "", phone: "" });
  const [deleteId, setDeleteId] = useState<string>("");

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<UserDto>) => (await http.post("/user", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await http.delete(`/user/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id" },
      { title: "用户名", dataIndex: "username" },
      { title: "邮箱", dataIndex: "email" },
      { title: "手机号", dataIndex: "phone" },
    ],
    []
  );

  const [formAnt] = Form.useForm();
  const [search, setSearch] = useState<{ username?: string; email?: string }>({});

  return (
    <div>
      <h2>用户</h2>
      <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: "8px 0" }}>创建用户</h3>
          <div style={{ display: "grid", gap: 8, minWidth: 280 }}>
            <input placeholder="用户名" value={form.username || ""} onChange={(e) => setForm({ ...form, username: e.target.value })} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <input placeholder="邮箱" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <input placeholder="手机号" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending}
              style={{ padding: "8px 12px" }}
            >{createMutation.isPending ? "创建中..." : "创建"}</button>
          </div>
        </div>
        <div>
          <h3 style={{ margin: "8px 0" }}>删除用户</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="用户ID" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <button
              onClick={() => deleteId && deleteMutation.mutate(Number(deleteId))}
              disabled={deleteMutation.isPending}
              style={{ padding: "8px 12px" }}
            >{deleteMutation.isPending ? "删除中..." : "删除"}</button>
          </div>
        </div>
      </div>

      <FormCard>
        <Form form={formAnt} layout="inline" onFinish={(values) => setSearch(values)}>
          <Form.Item name="username" label="用户名">
            <Input allowClear placeholder="模糊搜索用户名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input allowClear placeholder="模糊搜索邮箱" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={() => { formAnt.resetFields(); setSearch({}); }}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </FormCard>

      <FormCard>
        {isLoading && <p>加载中...</p>}
        {error && <p style={{ color: "red" }}>加载失败</p>}
        {!isLoading && !error && (
          <PaginatedTable<UserDto>
            columns={columns as any}
            fetchPage={async ({ page, pageSize }) => {
              const all = (data || []).filter((u) => {
                if (search.username && !String(u.username || "").includes(search.username)) return false;
                if (search.email && !String(u.email || "").includes(search.email)) return false;
                return true;
              });
              const items = all.slice((page - 1) * pageSize, page * pageSize);
              return { items, total: all.length };
            }}
            defaultPageSize={10}
            rowKey={(r) => String(r.id)}
          />
        )}
      </FormCard>
    </div>
  );
}
