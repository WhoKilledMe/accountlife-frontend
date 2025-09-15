import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Space, message, Upload, Table, Tag, Typography, Input, Select, Modal, DatePicker } from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { http } from "../lib/http";
import { accountsApi } from "../api/accounts";
import { uploadApi } from "../api/upload";
import { mailSyncApi } from "../api/mailsync";
import { UploadLogStatusEnum, getEnumItemByKey } from "./enums";

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
  const [mailSender, setMailSender] = useState<string | undefined>(undefined);
  const [zipPassword, setZipPassword] = useState<string | undefined>(undefined);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [syncVisible, setSyncVisible] = useState(false);
  const [modalAccountId, setModalAccountId] = useState<number | undefined>(undefined);
  const [syncSubmitting, setSyncSubmitting] = useState(false);
  const [accountIdToMail, setAccountIdToMail] = useState<Record<number, string>>({});
  const [editingZipPassword, setEditingZipPassword] = useState<Record<number, string>>({});
  const [savingPassword, setSavingPassword] = useState<Record<number, boolean>>({});
  // forms reserved when we need validations in future; remove unused to avoid warnings

  // 确保从路由携带的账户ID能显示为名称
  useEffect(() => {
    (async () => {
      if (selectedAccountId && !accountOptions.some(o => o.value === selectedAccountId)) {
        try {
          const resp = await accountsApi.get(selectedAccountId);
          const acc = resp.data as any;
          if (acc && acc.name) {
            setAccountOptions(prev => [{ label: acc.name, value: acc.id }, ...prev]);
            if (acc.billEmail) {
              setAccountIdToMail(prev => ({ ...prev, [acc.id]: acc.billEmail }));
              if (!mailSender) {
                setMailSender(acc.billEmail);
              }
            }
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
      const mailMap: Record<number, string> = {};
      (pr.content || []).forEach((a: any) => {
        if (a && a.id != null && a.billEmail) {
          mailMap[a.id] = a.billEmail;
        }
      });
      setAccountOptions(prev => append ? [...prev, ...opts] : opts);
      setAccountIdToMail(prev => append ? { ...prev, ...mailMap } : mailMap);
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
    const item = getEnumItemByKey(UploadLogStatusEnum, (s as any));
    return <Tag color={item?.color || "default"}>{item?.value || s || "-"}</Tag>;
  };

  const saveZipPassword = async (logId: number, newPassword: string) => {
    setSavingPassword(prev => ({ ...prev, [logId]: true }));
    try {
      await http.put(`/accounttransaction/uploadlog`, {
        id: logId,
        zipPassword: newPassword ? parseInt(newPassword) : null
      });
      message.success("解压密码已更新");
      fetchLogs();
      setEditingZipPassword(prev => {
        const newState = { ...prev };
        delete newState[logId];
        return newState;
      });
    } catch (e: any) {
      message.error(e?.message || "保存失败");
    } finally {
      setSavingPassword(prev => ({ ...prev, [logId]: false }));
    }
  };

  const handleZipPasswordEdit = (logId: number, currentValue: number | null) => {
    const newValue = currentValue ? String(currentValue) : "";
    setEditingZipPassword(prev => ({ ...prev, [logId]: newValue }));
  };

  const handleZipPasswordSave = (logId: number) => {
    const newPassword = editingZipPassword[logId];
    if (newPassword !== undefined) {
      saveZipPassword(logId, newPassword);
    }
  };

  const handleZipPasswordCancel = (logId: number) => {
    setEditingZipPassword(prev => {
      const newState = { ...prev };
      delete newState[logId];
      return newState;
    });
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
      { 
        title: "解压密码", 
        dataIndex: "zipPassword", 
        key: "zipPassword", 
        width: 150, 
        render: (v: number, record: LogDto) => {
          const isCompleted = record.status === "COMPLETED" || record.status === "SUCCESS";
          const isEditing = editingZipPassword[record.id] !== undefined;
          const isLoading = savingPassword[record.id];
          
          if (isCompleted) {
            return v == null ? "-" : String(v);
          }
          
          if (isEditing) {
            return (
              <Input
                size="small"
                value={editingZipPassword[record.id]}
                onChange={(e) => setEditingZipPassword(prev => ({ ...prev, [record.id]: e.target.value }))}
                onBlur={() => {
                  setTimeout(() => {
                    handleZipPasswordSave(record.id);
                  }, 50);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleZipPasswordSave(record.id);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleZipPasswordCancel(record.id);
                  }
                }}
                placeholder="输入密码"
                disabled={isLoading}
                autoFocus
                style={{ width: 120 }}
              />
            );
          }
          
          return (
            <span
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleZipPasswordEdit(record.id, v);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{ 
                cursor: 'pointer', 
                padding: '4px 8px',
                border: '1px solid transparent',
                borderRadius: '4px',
                display: 'inline-block',
                minWidth: '40px',
                userSelect: 'none'
              }}
              title="双击编辑"
            >
              {v == null ? "-" : String(v)}
            </span>
          );
        }
      },
      { title: "状态", dataIndex: "status", key: "status", width: 120, render: (v: string) => statusTag(v) },
      { title: "记录(成功/失败)", key: "counts", width: 160, render: (_: any, r: LogDto) => `${r.totalRecords || 0} (${r.successCount || 0}/${r.failureCount || 0})` },
      { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 180, render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-") },
    ],
    [editingZipPassword, savingPassword]
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
        await uploadApi.uploadFile(form, { type: "BANK", accountId: modalAccountId });
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
      await mailSyncApi.sendEmail({
        mailDate: mailDate || undefined,
        mailSender: mailSender || undefined,
        accountId: modalAccountId,
        zipPassword: zipPassword || undefined,
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
            onChange={(v) => {
              setModalAccountId(v);
              const mail = accountIdToMail[v];
              if (mail) setMailSender(mail);
            }}
            onSearch={(v) => { setAccountKeyword(v); loadAccounts(0, v, false); }}
            onFocus={() => loadAccounts(0, accountKeyword, false)}
            filterOption={false}
            options={accountOptions}
          />
          <Input placeholder="邮箱（自动带出账户邮箱，可修改）" allowClear value={mailSender} onChange={(e) => setMailSender(e.target.value)} />
          <Input placeholder="ZIP包密码（如有）" allowClear value={zipPassword} onChange={(e) => setZipPassword(e.target.value)} />

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


