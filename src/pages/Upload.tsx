import { useState } from "react";
// import { http } from "../lib/http";
import { uploadApi } from "../api/upload";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("BANK");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onUpload = async () => {
    if (!file || !accountName) {
      setMessage("请选择文件并填写账户名称");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      await uploadApi.uploadFile(form, { type, accountName });
      setMessage("上传成功");
    } catch (e: any) {
      setMessage(e?.message || "上传失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>文件上传</h2>
      <div style={{ display: "grid", gap: 12, maxWidth: 500 }}>
        <label>
          <span style={{ display: "block", marginBottom: 6 }}>类型</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="NING_BO_CREDIT">NING_BO_CREDIT</option>
            <option value="LABEL_DETAIL">LABEL_DETAIL</option>
            <option value="BANK">BANK</option>
            <option value="PLATFORM">PLATFORM</option>
            <option value="CREDIT_WALLET">CREDIT_WALLET</option>
          </select>
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 6 }}>账户名称</span>
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="例如 招商银行"
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4, width: "100%" }}
          />
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 6 }}>账单文件</span>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <button onClick={onUpload} disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "上传中..." : "上传"}
        </button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}