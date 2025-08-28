import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { AssetAccountDto } from "../services/types";
import { useState } from "react";
import PaginatedTable from "../components/PaginatedTable";
import FormCard from "../components/FormCard";

export default function Accounts() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<AssetAccountDto[]>({
    queryKey: ["accounts"],
    queryFn: async () => (await http.get("/assetaccount")).data,
  });

  const [form, setForm] = useState<Partial<AssetAccountDto>>({ name: "", type: 1, currency: "CNY" });
  const [deleteId, setDeleteId] = useState<string>("");

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<AssetAccountDto>) => (await http.post("/assetaccount", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await http.delete(`/assetaccount/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });

  return (
    <div>
      <h2>账户</h2>

      <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: "8px 0" }}>创建账户</h3>
          <div style={{ display: "grid", gap: 8, minWidth: 320 }}>
            <input placeholder="名称" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <input placeholder="类型(数字)" value={form.type ?? ""} onChange={(e) => setForm({ ...form, type: Number(e.target.value) })} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <input placeholder="币种" value={form.currency || ""} onChange={(e) => setForm({ ...form, currency: e.target.value })} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} style={{ padding: "8px 12px" }}>
              {createMutation.isPending ? "创建中..." : "创建"}
            </button>
          </div>
        </div>
        <div>
          <h3 style={{ margin: "8px 0" }}>删除账户</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="账户ID" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <button onClick={() => deleteId && deleteMutation.mutate(Number(deleteId))} disabled={deleteMutation.isPending} style={{ padding: "8px 12px" }}>
              {deleteMutation.isPending ? "删除中..." : "删除"}
            </button>
          </div>
        </div>
      </div>

      <FormCard>
        {isLoading && <p>加载中...</p>}
        {error && <p style={{ color: "red" }}>加载失败</p>}
        {!isLoading && !error && (
          <PaginatedTable<AssetAccountDto>
            columns={[
              { title: "ID", dataIndex: "id" },
              { title: "名称", dataIndex: "name" },
              { title: "类型", dataIndex: "type" },
              { title: "币种", dataIndex: "currency" },
            ] as any}
            fetchPage={async ({ page, pageSize }) => {
              const all = data || [];
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
