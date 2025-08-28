import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { TransactionCategoryDto } from "../services/types";
import { useState } from "react";

function CategoryTree({ nodes }: { nodes: TransactionCategoryDto[] }) {
  return (
    <ul style={{ listStyle: "none", paddingLeft: 16 }}>
      {nodes.map((n) => (
        <li key={n.id} style={{ margin: "4px 0" }}>
          <span>{n.name} (ID:{n.id})</span>
          {Array.isArray(n.children) && n.children.length > 0 && (
            <CategoryTree nodes={n.children} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Categories() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<TransactionCategoryDto[]>({
    queryKey: ["categories-tree"],
    queryFn: async () => (await http.get("/transactioncategory/tree")).data,
  });

  const [form, setForm] = useState<Partial<TransactionCategoryDto>>({ name: "", type: 2, parentId: undefined });
  const [deleteId, setDeleteId] = useState<string>("");

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<TransactionCategoryDto>) => (await http.post("/transactioncategory", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories-tree"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await http.delete(`/transactioncategory/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories-tree"] }),
  });

  return (
    <div>
      <h2>分类</h2>

      <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: "8px 0" }}>创建分类</h3>
          <div style={{ display: "grid", gap: 8, minWidth: 320 }}>
            <input placeholder="名称" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <input placeholder="类型(1收入/2支出)" value={form.type ?? ""} onChange={(e) => setForm({ ...form, type: Number(e.target.value) })} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <input placeholder="父分类ID(可选)" value={form.parentId ?? ""} onChange={(e) => setForm({ ...form, parentId: Number(e.target.value) })} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} style={{ padding: "8px 12px" }}>
              {createMutation.isPending ? "创建中..." : "创建"}
            </button>
          </div>
        </div>
        <div>
          <h3 style={{ margin: "8px 0" }}>删除分类</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="分类ID" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <button onClick={() => deleteId && deleteMutation.mutate(Number(deleteId))} disabled={deleteMutation.isPending} style={{ padding: "8px 12px" }}>
              {deleteMutation.isPending ? "删除中..." : "删除"}
            </button>
          </div>
        </div>
      </div>

      {isLoading && <p>加载中...</p>}
      {error && <p style={{ color: "red" }}>加载失败</p>}
      {!isLoading && !error && Array.isArray(data) && (
        <CategoryTree nodes={data} />
      )}
    </div>
  );
}
