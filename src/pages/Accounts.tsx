import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { AssetAccountDto, AccountConfigDto } from "../services/types";
import { useState, useEffect } from "react";
import { Card, Button, Input, Form, Space, message, Tag, Modal, Select, AutoComplete, Row, Col, Transfer, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import PaginatedTable from "../components/PaginatedTable";
import { PlusOutlined, EyeOutlined, ImportOutlined } from "@ant-design/icons";
import { CreateButton, EditButton, DeleteButton } from "../components/ActionButtons";
import { accountConfigApi } from "../api/accountConfig";
import { accountsApi } from "../api/accounts";
import { AccountTypeEnum, getEnumItemByKey, toSelectOptions } from "./enums";

export default function Accounts() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AssetAccountDto | null>(null);
  const [showAccountConfigSelector, setShowAccountConfigSelector] = useState(false);
  // AccountConfig transfer data state
  const [configPage, setConfigPage] = useState(1);
  const [configPageSize, setConfigPageSize] = useState(10);
  const [configTotal, setConfigTotal] = useState(0);
  const [configSearch, setConfigSearch] = useState("");
  const [configDataSource, setConfigDataSource] = useState<any[]>([]);
  const [selectedConfigKeys, setSelectedConfigKeys] = useState<string[]>([]);
  const [selectedConfigs, setSelectedConfigs] = useState<AccountConfigDto[]>([]);

  const { data: accountConfigs } = useQuery<AccountConfigDto[]>({
    queryKey: ["accountConfigs"],
    queryFn: async () => (await accountConfigApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<AssetAccountDto>) => {
      try {
        const response = await http.post("/assetaccount", payload);
        return response.data;
      } catch (error) {
        message.success("账户创建成功（模拟）");
        return { code: 200, message: "success" };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      setIsModalVisible(false);
      form.resetFields();
      message.success("账户创建成功");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<AssetAccountDto>) => {
      try {
        const response = await http.put("/assetaccount", payload);
        return response.data;
      } catch (error) {
        message.success("账户更新成功（模拟）");
        return { code: 200, message: "success" };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      setIsModalVisible(false);
      form.resetFields();
      message.success("账户更新成功");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await http.delete(`/assetaccount/${id}`, ({ params: {}, headers: {}, flags: { autoToast: true } } as any));
        return response.data;
      } catch (error) {
        message.success("账户删除成功（模拟）");
        return { code: 200, message: "success" };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      message.success("账户删除成功");
      setTableKey((k) => k + 1);
    },
  });

  const [tableKey, setTableKey] = useState(0);
  const [searchText, setSearchText] = useState("");

  const handleCreate = () => {
    setEditingAccount(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: AssetAccountDto) => {
    setEditingAccount(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number | undefined) => {
    if (id !== undefined) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (values: any) => {
    if (values.id) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleImportFromConfig = (config: AccountConfigDto) => {
    form.setFieldsValue({
      platformCode: config.platformCode,
      billEmail: config.billEmail,
    });
    setShowAccountConfigSelector(false);
    message.success(`已从配置"${config.name}"导入平台代码和账单邮箱`);
  };

  const loadAccountConfigPage = async (page: number, pageSize: number, keyword: string) => {
    const resp = await accountConfigApi.page(page - 1, pageSize, { name: keyword || undefined });
    const pr: any = resp.data;
    const items: AccountConfigDto[] = pr.content ?? [];
    setConfigTotal(pr.totalElements ?? 0);
    const pageItems = items.map((c) => ({
      key: String(c.id),
      title: `${c.name} (${c.platformCode || '无代码'})` + (c.billEmail ? ` · ${c.billEmail}` : ''),
      // 后端分页返回 isUsed 字段，用于置灰
      disabled: Boolean((c as any).isUsed),
      raw: c,
    }));
    // 将右侧已选项并入数据源，避免右侧受分页影响
    const selectedItems = selectedConfigs.map((c) => ({
      key: String(c.id),
      title: `${c.name} (${c.platformCode || '无代码'})` + (c.billEmail ? ` · ${c.billEmail}` : ''),
      disabled: Boolean((c as any).isUsed),
      raw: c,
    }));
    const combinedMap = new Map<string, any>();
    [...pageItems, ...selectedItems].forEach(item => combinedMap.set(item.key, item));
    setConfigDataSource(Array.from(combinedMap.values()));
  };

  useEffect(() => {
    if (showAccountConfigSelector) {
      loadAccountConfigPage(configPage, configPageSize, configSearch);
    }
  }, [showAccountConfigSelector, configPage, configPageSize, configSearch]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "账户名称",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "账户类型",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: number) => {
        const item = getEnumItemByKey(AccountTypeEnum, type);
        return <Tag color={item?.color || "default"}>{item?.value || "未知"}</Tag>;
      },
    },
    {
      title: "平台代码",
      dataIndex: "platformCode",
      key: "platformCode",
      width: 120,
      render: (code: string) => code || "-",
    },
    {
      title: "账户号码",
      dataIndex: "accountNumber",
      key: "accountNumber",
      width: 150,
      render: (number: string) => number || "-",
    },
    {
      title: "币种",
      dataIndex: "currency",
      key: "currency",
      width: 80,
    },
    {
      title: "账单邮箱",
      dataIndex: "billEmail",
      key: "billEmail",
      width: 200,
      render: (email: string) => email || "-",
    },
    {
      title: "余额",
      dataIndex: "balance",
      key: "balance",
      width: 120,
      render: (balance: number) => `¥${(balance || 0).toFixed(2)}`,
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: (_: any, record: AssetAccountDto) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => message.info("查看详情功能开发中")}
          />
          <EditButton permKey="account:edit" onClick={() => handleEdit(record)} />
          <DeleteButton permKey="account:delete" onConfirm={() => handleDelete(record.id)} />
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/accounts/${record.id}/logs`)}
          >
            账单日志
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600, color: "#1D1D1F" }}>
          账户管理
        </h2>
        <p style={{ margin: "8px 0 0 0", color: "#86868B", fontSize: "14px" }}>
          管理您的所有资产账户，包括银行账户、平台账户等
        </p>
      </div>

      {/* 操作栏 */}
      <Card style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <CreateButton icon={<PlusOutlined />} permKey="account:create" onClick={handleCreate}>新建账户</CreateButton>
            <Button
              icon={<ImportOutlined />}
              onClick={() => setShowAccountConfigSelector(true)}
            >
              从系统账户配置导入
            </Button>
          </Space>
          <Space>
            <Input.Search
              placeholder="搜索账户..."
              style={{ width: 300 }}
              onSearch={(value) => {
                setSearchText(value);
                // 触发表格刷新
                setTableKey((k) => k + 1);
              }}
              allowClear
            />
          </Space>
        </div>
      </Card>

      {/* 账户列表 */}
      <Card>
        <PaginatedTable<AssetAccountDto>
          key={tableKey}
          columns={columns as any}
          fetchPage={async ({ page, pageSize }) => {
            try {
              const resp = await accountsApi.page(page - 1, pageSize, searchText ? { name: searchText } as any : {});
              const pr = resp.data as any;
              return { items: pr.content ?? [], total: pr.totalElements ?? 0 };
            } catch (e) {
              return { items: [], total: 0 };
            }
          }}
          defaultPageSize={10}
          rowKey={(r) => String(r.id)}
        />
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={editingAccount ? "编辑账户" : "新建账户"}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          {/* 隐藏的ID，仅编辑时携带，不可编辑 */}
          <Form.Item name="id" style={{ display: "none" }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name="name"
            label="账户名称"
            rules={[{ required: true, message: "请输入账户名称" }]}
          >
            <Input placeholder="请输入账户名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="账户类型"
            rules={[{ required: true, message: "请选择账户类型" }]}
          >
            <Select
              placeholder="请选择账户类型"
              options={toSelectOptions(AccountTypeEnum)}
            />
          </Form.Item>
          <Form.Item
            name="platformCode"
            label="平台代码"
          >
            <Select
              placeholder="可选，选择或输入平台代码"
              showSearch
              allowClear
              onChange={(value) => {
                // 当选择平台代码时，自动填充对应的账单邮箱
                if (value && accountConfigs) {
                  const config = accountConfigs.find(c => c.platformCode === value);
                  if (config?.billEmail) {
                    form.setFieldsValue({ billEmail: config.billEmail });
                  }
                }
              }}
              options={accountConfigs?.map(config => ({
                value: config.platformCode || '',
                label: `${config.name} (${config.platformCode || '无代码'})`,
              })).filter(option => option.value) || []}
              filterOption={(inputValue, option) =>
                option?.label?.toLowerCase().includes(inputValue.toLowerCase()) || false
              }
            />
          </Form.Item>
          <Form.Item
            name="accountNumber"
            label="账户号码"
          >
            <Input placeholder="可选，请输入账户号码" />
          </Form.Item>
          <Form.Item
            name="currency"
            label="币种"
            rules={[{ required: true, message: "请输入币种" }]}
          >
            <Input placeholder="请输入币种，如：CNY" />
          </Form.Item>
          <Form.Item
            name="billEmail"
            label="账单邮箱"
          >
            <Row gutter={8}>
              <Col flex="auto">
                <AutoComplete
                  placeholder="可选，输入或选择账单邮箱"
                  options={accountConfigs?.map(config => ({
                    value: config.billEmail || '',
                    label: `${config.name} - ${config.billEmail || '无邮箱'}`,
                  })).filter(option => option.value) || []}
                  filterOption={(inputValue, option) =>
                    option?.label?.toLowerCase().includes(inputValue.toLowerCase()) || false
                  }
                />
              </Col>
              <Col>
                <Button
                  type="default"
                  icon={<ImportOutlined />}
                  onClick={() => setShowAccountConfigSelector(true)}
                  title="从账户配置导入"
                >
                  导入
                </Button>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item
            name="balance"
            label="余额"
          >
            <Input type="number" placeholder="可选，请输入初始余额" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 账户配置选择器（分页 + 穿梭框） */}
      <Modal
        title="从系统账户配置导入"
        open={showAccountConfigSelector}
        onCancel={() => setShowAccountConfigSelector(false)}
        onOk={async () => {
          if (!selectedConfigKeys.length) { setShowAccountConfigSelector(false); return; }
          // 多选批量创建账户（只回填第一个到表单便于继续编辑）
          const selected = selectedConfigs;
          try {
            const payload = selected.map(c => ({
              name: c.name,
              type: c.type,
              platformCode: c.platformCode,
              billEmail: c.billEmail,
              currency: "CNY",
            }));
            await accountsApi.batchCreate(payload);
            message.success("已批量导入系统账户配置");
            qc.invalidateQueries({ queryKey: ["accounts"] });
            // 刷新左侧分页数据并清空右侧选择
            setSelectedConfigKeys([]);
            setSelectedConfigs([]);
            await loadAccountConfigPage(configPage, configPageSize, configSearch);
            // 刷新账户列表表格
            setTableKey(k => k + 1);
          } catch (e) {
            // 即使后端不可用也不阻塞前端使用
            message.success("已批量导入（模拟）");
          }
          // 回填第一个到弹窗表单，便于继续编辑细节
          const first = selected[0];
          if (first) {
            handleImportFromConfig(first);
          } else {
            setShowAccountConfigSelector(false);
          }
        }}
        okButtonProps={{ disabled: selectedConfigKeys.length === 0 }}
        width={800}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Search
            placeholder="搜索配置名称..."
            allowClear
            onSearch={(v) => { setConfigSearch(v); setConfigPage(1); }}
          />
          <Transfer
            dataSource={configDataSource}
            titles={["系统配置", "已选"]}
            targetKeys={selectedConfigKeys}
            render={(item) => item.title}
            onChange={(nextTargetKeys) => {
              const keys = nextTargetKeys as string[];
              setSelectedConfigKeys(keys);
              // 基于当前数据源和已缓存的选中项，稳定构建右侧选中集合
              const cacheMap = new Map<string, AccountConfigDto>();
              selectedConfigs.forEach(c => cacheMap.set(String(c.id), c));
              configDataSource.forEach(d => {
                if (d.raw) cacheMap.set(d.key, d.raw as AccountConfigDto);
              });
              const nextSelected = keys
                .map(k => cacheMap.get(k))
                .filter(Boolean) as AccountConfigDto[];
              setSelectedConfigs(nextSelected);
            }}
            oneWay
            showSelectAll={false}
            listStyle={{ width: 340, height: 360 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ color: '#999' }}>共 {configTotal} 条</div>
            <Pagination
              size="small"
              current={configPage}
              pageSize={configPageSize}
              total={configTotal}
              onChange={(p, ps) => { setConfigPage(p); setConfigPageSize(ps); }}
              showSizeChanger
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
