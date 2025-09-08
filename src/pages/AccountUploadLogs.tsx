import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Space, message, Upload, Table, Tag, Typography, Input, Select, Modal, DatePicker } from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { http } from "../lib/http";

type LogDto = {
  id: number;
  userId?: number;
  userName?: string;
  accountId?: number;
  accountName?: string;
  fileName?: string;
  filePath?: string;
  zipPassword?: number;
  transactionStartDate?: string;
  transactionEndDate?: string;
  md5Checksum?: string;
  status?: string;
  totalRecords?: number;
  successCount?: number;
  failureCount?: number;
  errorMessage?: string;
  createdAt?: string;
};

export default function AccountUploadLogs() {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [logs, setLogs] = useState<LogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [accountOptions, setAccountOptions] = useState<{label:string; value:number}[]>([]);
  const [accountPage, setAccountPage] = useState(0);
  const [accountHasMore, setAccountHasMore] = useState(true);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountKeyword, setAccountKeyword] = useState<string | undefined>(undefined);
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(
    accountId && !isNaN(Number(accountId)) && Number(accountId) > 0 ? Number(accountId) : undefined
  );
  const [mailDate, setMailDate] = useState<string | undefined>(undefined);
  const [mailSubject, setMailSubject] = useState<string | undefined>(undefined);
  const [sender, setSender] = useState<string | undefined>(undefined);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [syncVisible, setSyncVisible] = useState(false);
  const [modalAccountId, setModalAccountId] = useState<number | undefined>(undefined);
  const [syncSubmitting, setSyncSubmitting] = useState(false);
  // forms reserved when we need validations in future; remove unused to avoid warnings

  // 确保从路由携带的账户ID能显示为名称
  useEffect(() => {
    (async () => {
      if (selectedAccountId && !accountOptions.some(o => o.value === selectedAccountId)) {
        try {
          const resp = await http.get(`/assetaccount/${selectedAccountId}`);
          const acc = resp.data as any;
          if (acc && acc.name) {
            setAccountOptions(prev => [{ label: acc.name, value: acc.id }, ...prev]);
          }
        } catch (_) {
          // ignore
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const resp = await http.post(
        `/accounttransaction/uploadlog/page?page=0&size=20`,
        {
          userId: undefined,
          fileName: keyword || undefined,
          status: undefined,
          accountId: selectedAccountId,
        }
      );
      const pr = resp.data as any;
      setLogs(pr.content || []);
    } catch (e) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, accountId, selectedAccountId]);

  // 账户下拉加载（分页+搜索）
  const loadAccounts = async (page = 0, keyword?: string, append = false) => {
    if (accountLoading) return;
    setAccountLoading(true);
    try {
      const resp = await http.get(`/assetaccount/select`, { params: { page, size: 20, accountName: keyword } });
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

  const statusTag = (s?: string) => {
    const map: Record<string, { color: string; text: string }> = {
      PENDING: { color: "default", text: "待处理" },
      PROCESSING: { color: "processing", text: "处理中" },
      COMPLETED: { color: "success", text: "完成" },
      FAILED: { color: "error", text: "失败" },
    };
    const cfg = (s && map[s]) || { color: "default", text: s || "-" } as any;
    return <Tag color={cfg.color}>{cfg.text}</Tag>;
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 80 },
      { title: "用户", dataIndex: "userName", key: "userName", width: 140 },
      { title: "账户", dataIndex: "accountName", key: "accountName", width: 160 },
      { title: "文件名", dataIndex: "fileName", key: "fileName", width: 160, render: (v: string) => (
        <Typography.Text style={{ wordBreak: "break-all" }}>{v || "-"}</Typography.Text>
      ) },
      { title: "交易开始日期", dataIndex: "transactionStartDate", key: "transactionStartDate", width: 180, render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-") },
      { title: "交易结束日期", dataIndex: "transactionEndDate", key: "transactionEndDate", width: 180, render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-") },
      { title: "解压密码", dataIndex: "zipPassword", key: "zipPassword", width: 120, render: (v: number) => (v == null ? "-" : String(v)) },
      { title: "状态", dataIndex: "status", key: "status", width: 120, render: (v: string) => statusTag(v) },
      { title: "记录(成功/失败)", key: "counts", width: 160, render: (_: any, r: LogDto) => `${r.totalRecords || 0} (${r.successCount || 0}/${r.failureCount || 0})` },
      { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 180, render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-") },
    ],
    []
  );

  const props: UploadProps = {
    name: "file",
    multiple: false,
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options as any;
      try {
        if (!modalAccountId) {
          message.warning("请先选择账户");
          onError?.(new Error("未选择账户"));
          return;
        }
        const form = new FormData();
        form.append("file", file);
        await http.post(`/v1/file/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" },
          params: { type: "BANK", accountId: modalAccountId },
        });
        message.success("上传成功");
        onSuccess?.({});
        fetchLogs();
        setUploadVisible(false);
      } catch (e: any) {
        message.error(e?.message || "上传失败");
        onError?.(e);
      }
    },
  };

  const triggerMailSync = async () => {
    if (!modalAccountId) {
      message.warning("请先选择账户");
      return;
    }
    try {
      setSyncSubmitting(true);
      await http.post(`/mailsync/email`, {
        mailDate: mailDate || undefined,
        mailSubject: mailSubject || undefined,
        sender: sender || undefined,
        accountId: modalAccountId,
      });
      message.success("邮箱同步已触发");
      fetchLogs();
      setSyncVisible(false);
    } catch (e: any) {
      message.error(e?.message || "邮箱同步失败");
    } finally {
      setSyncSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <Typography.Title level={4} style={{ margin: 0 }}>账单上传与同步</Typography.Title>
      </Space>
      <Card
        style={{ marginBottom: 16 }}
        title="账单上传与同步"
        extra={
          <Space>
            <Button type="primary" icon={<UploadOutlined />} onClick={() => { setModalAccountId(selectedAccountId); setUploadVisible(true); }}>上传账单文件</Button>
            <Button type="primary" onClick={() => { setModalAccountId(selectedAccountId); setSyncVisible(true); }}>邮箱同步</Button>
          </Space>
        }
      >
        <Space>
          <Select
            showSearch
            placeholder="选择账户筛选"
            style={{ width: 260 }}
            value={selectedAccountId}
            onChange={(v) => setSelectedAccountId(v)}
            onSearch={(v) => { setAccountKeyword(v); loadAccounts(0, v, false); }}
            onFocus={() => loadAccounts(0, accountKeyword, false)}
            filterOption={false}
            options={accountOptions}
            allowClear
            onClear={() => setSelectedAccountId(undefined)}
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
          <Input.Search placeholder="按文件名搜索" allowClear onSearch={(v) => setKeyword(v)} style={{ width: 280 }} />
        </Space>
      </Card>
      <Card>
        <Table
          rowKey={(r) => String(r.id)}
          loading={loading}
          columns={columns as any}
          dataSource={logs}
          pagination={false}
        />
      </Card>

      <Modal
        title="上传账单文件"
        open={uploadVisible}
        onCancel={() => setUploadVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            showSearch
            placeholder="选择账户"
            style={{ width: "100%" }}
            value={modalAccountId}
            onChange={(v) => setModalAccountId(v)}
            onSearch={(v) => { setAccountKeyword(v); loadAccounts(0, v, false); }}
            onFocus={() => loadAccounts(0, accountKeyword, false)}
            filterOption={false}
            options={accountOptions}
          />
          <Upload {...props} showUploadList={false}>
            <Button type="primary" icon={<UploadOutlined />}>选择并上传文件</Button>
          </Upload>
        </Space>
      </Modal>

      <Modal
        title="邮箱同步"
        open={syncVisible}
        onCancel={() => setSyncVisible(false)}
        onOk={triggerMailSync}
        confirmLoading={syncSubmitting}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            showSearch
            placeholder="选择账户"
            style={{ width: "100%" }}
            value={modalAccountId}
            onChange={(v) => setModalAccountId(v)}
            onSearch={(v) => { setAccountKeyword(v); loadAccounts(0, v, false); }}
            onFocus={() => loadAccounts(0, accountKeyword, false)}
            filterOption={false}
            options={accountOptions}
          />
          <Input placeholder="邮件标题（可选）" allowClear value={mailSubject} onChange={(e) => setMailSubject(e.target.value)} />
          <Input placeholder="发件人" allowClear value={sender} onChange={(e) => setSender(e.target.value)} />

          <DatePicker
            style={{ width: "100%" }}
            placeholder="邮件日期（YYYY-MM-DD，可选）"
            onChange={(d) => setMailDate(d ? (d as any).format("YYYY-MM-DD") : undefined)}
          />
        </Space>
      </Modal>
    </div>
  );
}


