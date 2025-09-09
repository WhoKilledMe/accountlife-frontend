import { useState } from "react";
// import { http } from "../lib/http";
import { keywordApi } from "../api/keywords";

export default function Keywords() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const match = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await keywordApi.match(keyword);
      setResult(resp.data);
    } catch (e: any) {
      setError(e?.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>关键词映射</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入关键词，例如：星巴克"
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
        />
        <button onClick={match} style={{ padding: "8px 12px" }}>匹配分类</button>
      </div>
      {loading && <p>匹配中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
