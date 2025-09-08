import { useState, useMemo, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { http } from "../lib/http";
import { useTheme } from "../contexts/ThemeContext";
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Space,
  Typography,
  Button,
  Badge,
  Dropdown,
  Switch,
  theme,
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
  BankOutlined,
  TransactionOutlined,
  PieChartOutlined,
  TagsOutlined,
  UploadOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content, Footer } = AntLayout;
const { Title } = Typography;

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  // 路由守卫：无token跳转登录
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const isLoginPage = location.pathname === '/login';
      if (!token && !isLoginPage) {
        navigate('/login', { replace: true });
      }
    } catch (_) {}
  }, [location.pathname, navigate]);
  
  const {
    token: { colorBgContainer, colorBorder, borderRadiusLG },
  } = theme.useToken();

  // 菜单项配置
  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        label: "仪表盘",
        icon: <DashboardOutlined />,
        children: [
          { key: "home", label: <NavLink to="/">首页概览</NavLink>, icon: <HomeOutlined /> },
        ],
      },
      {
        key: "user-management",
        label: "用户管理",
        icon: <TeamOutlined />,
        children: [
          { key: "users-admin", label: <NavLink to="/users/admin">用户管理</NavLink>, icon: <SettingOutlined /> },
          { key: "usergroups", label: <NavLink to="/usergroups">用户组管理</NavLink>, icon: <UserOutlined /> },
        ],
      },
      {
        key: "financial",
        label: "财务管理",
        icon: <BankOutlined />,
        children: [
          { key: "accounts", label: <NavLink to="/accounts">账户管理</NavLink>, icon: <BankOutlined /> },
          { key: "businesses", label: <NavLink to="/businesses">业务交易</NavLink>, icon: <BankOutlined /> },
          { key: "transactions", label: <NavLink to="/transactions">交易记录</NavLink>, icon: <TransactionOutlined /> },
          { key: "budgets", label: <NavLink to="/budgets">预算管理</NavLink>, icon: <PieChartOutlined /> },
          { key: "account-logs", label: <NavLink to="/accounts/logs">账单上传与日志</NavLink>, icon: <UploadOutlined /> },
        ],
      },
      {
        key: "system",
        label: "系统设置",
        icon: <SettingOutlined />,
        children: [
          { key: "categories", label: <NavLink to="/categories">分类管理</NavLink>, icon: <TagsOutlined /> },
          { key: "keywords", label: <NavLink to="/keywords">关键词映射</NavLink>, icon: <FileTextOutlined /> },
          { key: "upload", label: <NavLink to="/upload">文件上传</NavLink>, icon: <UploadOutlined /> },
          { key: "mail-configs", label: <NavLink to="/mail-configs">邮箱配置</NavLink>, icon: <SettingOutlined /> },
          { key: "admin-mail-configs", label: <NavLink to="/admin/mail-configs">管理员邮箱设置</NavLink>, icon: <SettingOutlined /> },
          { key: "system-account-configs", label: <NavLink to="/system/account-configs">系统账户配置</NavLink>, icon: <SettingOutlined /> },
        ],
      },
    ],
    []
  );

  // 当前选中的菜单
  const selectedKey = useMemo(() => {
    const p = location.pathname;
    if (p === "/") return "home";
    if (p.startsWith("/users/admin")) return "users-admin";
    if (p.startsWith("/usergroups")) return "usergroups";
    if (p.startsWith("/categories")) return "categories";
    if (p.startsWith("/accounts") && p.includes("/logs")) return "account-logs";
    if (p.startsWith("/accounts")) return "accounts";
    if (p.startsWith("/transactions")) return "transactions";
    if (p.startsWith("/budgets")) return "budgets";
    if (p.startsWith("/keywords")) return "keywords";
    if (p.startsWith("/upload")) return "upload";
    if (p.startsWith("/system/account-configs")) return "system-account-configs";
    return "home";
  }, [location.pathname]);

  // 获取当前展开的菜单组
  const openKeys = useMemo(() => {
    const p = location.pathname;
    if (p === "/") return ["dashboard"];
    if (p.startsWith("/users") || p.startsWith("/usergroups")) return ["user-management"];
    if (p.startsWith("/accounts") || p.startsWith("/transactions") || p.startsWith("/budgets")) return ["financial"];
    if (p.startsWith("/categories") || p.startsWith("/keywords") || p.startsWith("/upload") || p.startsWith("/mail-configs") || p.startsWith("/system/account-configs")) return ["system"];
    return ["dashboard"];
  }, [location.pathname]);

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: "profile",
      label: "个人资料",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "系统设置",
      icon: <SettingOutlined />,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
    },
  ];

  const onUserMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      (async () => {
        try {
          await http.post("/auth/logout");
        } catch (_) {
          // ignore logout errors
        }
        try {
          localStorage.removeItem("token");
          // also clear default header to avoid stale token
          try {
            (http.defaults.headers as any).common && delete (http.defaults.headers as any).common["Authorization"];
          } catch (_) {}
        } catch (_) {}
        navigate("/login", { replace: true });
      })();
    }
  };

  // 获取页面标题
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/") return "首页概览";
    if (p.startsWith("/users/admin")) return "用户管理";
    if (p.startsWith("/usergroups")) return "用户组管理";
    if (p.startsWith("/categories")) return "分类管理";
    if (p.startsWith("/accounts") && p.includes("/logs")) return "账单上传与日志";
    if (p.startsWith("/accounts")) return "账户管理";
    if (p.startsWith("/transactions")) return "交易记录";
    if (p.startsWith("/budgets")) return "预算管理";
    if (p.startsWith("/keywords")) return "关键词映射";
    if (p.startsWith("/upload")) return "文件上传";
    if (p.startsWith("/system/account-configs")) return "系统账户配置";
    return "AccountLife";
  };

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {/* 左侧侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        collapsedWidth={80}
        style={{
          background: colorBgContainer,
          borderRight: `1px solid ${colorBorder}`,
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Logo 区域 */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 24px",
            borderBottom: `1px solid ${colorBorder}`,
            background: colorBgContainer,
          }}
        >
          <Link
            to="/"
            style={{
              color: "#1890ff",
              fontWeight: 600,
              fontSize: collapsed ? 20 : 18,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 12,
            }}
          >
            <div
              style={{
                width: collapsed ? 32 : 28,
                height: collapsed ? 32 : 28,
                background: "#1890ff",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: collapsed ? 16 : 14,
                fontWeight: 600,
                color: "#FFFFFF",
              }}
            >
              A
            </div>
            {!collapsed && "AccountLife"}
          </Link>
        </div>

        {/* 菜单区域 */}
        <div style={{ padding: "16px 0", flex: 1 }}>
          <Menu
            mode="inline"
            items={menuItems}
            selectedKeys={[selectedKey]}
            defaultOpenKeys={openKeys}
            style={{
              borderRight: 0,
              background: "transparent",
              fontSize: 14,
            }}
            theme="light"
          />
        </div>
      </Sider>

      {/* 主布局区域 */}
      <AntLayout>
        {/* 顶部页眉 */}
        <Header
          style={{
            background: colorBgContainer,
            borderBottom: `1px solid ${colorBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            height: 64,
            position: "sticky",
            top: 0,
            zIndex: 1000,
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* 左侧：折叠按钮和页面标题 */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 16,
                width: 40,
                height: 40,
              }}
            />
            <Title level={4} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              {getPageTitle()}
            </Title>
          </div>

          {/* 右侧：操作区域 */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* 主题切换 */}
            <Space>
              <span style={{ fontSize: 12, color: "#666" }}>浅色</span>
              <Switch
                size="small"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span style={{ fontSize: 12, color: "#666" }}>暗色</span>
            </Space>

            {/* 通知按钮 */}
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  fontSize: 16,
                  width: 40,
                  height: 40,
                }}
              />
            </Badge>

            {/* 用户头像和下拉菜单 */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: onUserMenuClick }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}>
                <Avatar
                  size={32}
                  style={{
                    background: "#1890ff",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  A
                </Avatar>
                {!collapsed && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1D1D1F" }}>
                      Admin User
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      系统管理员
                    </div>
                  </div>
                )}
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* 主体内容区 */}
        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
            minHeight: "calc(100vh - 160px)",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>

        {/* 底部页脚 */}
        <Footer
          style={{
            textAlign: "center",
            padding: "16px 24px",
            background: "transparent",
            borderTop: `1px solid ${colorBorder}`,
            height: 40,
            lineHeight: "8px",
          }}
        >
          <div style={{ fontSize: 12, color: "#666" }}>
            ©{new Date().getFullYear()} AccountLife | 智能财务管理平台
          </div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
            技术支持 | 隐私政策 | 服务条款
          </div>
        </Footer>
      </AntLayout>
    </AntLayout>
  );
}
