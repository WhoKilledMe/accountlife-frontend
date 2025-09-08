import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme as antdTheme } from "antd";
import Layout from "./components/Layout";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import Home from "./pages/Home";
// Users removed per requirements
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Keywords from "./pages/Keywords";
import Upload from "./pages/Upload";
import AccountUploadLogs from "./pages/AccountUploadLogs";
import Businesses from "./pages/Businesses";
import MailConfigs from "./pages/MailConfigs";
import AdminMailConfigs from "./pages/AdminMailConfigs";
import AccountConfigs from "./pages/AccountConfigs";
import UserGroups from "./pages/UserGroups";
import UsersAdmin from "./pages/UsersAdmin";
import Login from "./pages/Login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// 主题配置组件
function AppContent() {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          colorInfo: "#1890ff",
          // 优化浅色主题，使用更柔和的颜色
          colorBgLayout: isDarkMode ? "#0f1217" : "#F8F9FA",
          colorBgContainer: isDarkMode ? "#151922" : "#FEFEFE",
          colorBgElevated: isDarkMode ? "#1F1F1F" : "#FFFFFF",
          colorBorder: isDarkMode ? "#303030" : "#E8E9EA",
          colorBorderSecondary: isDarkMode ? "#404040" : "#F0F0F0",
          colorText: isDarkMode ? "#E6F0FF" : "#2C3E50",
          colorTextSecondary: isDarkMode ? "#9FB3C8" : "#6C757D",
          colorTextTertiary: isDarkMode ? "#7A8A9A" : "#9CA3AF",
          colorFill: isDarkMode ? "#262626" : "#F5F5F5",
          colorFillSecondary: isDarkMode ? "#1F1F1F" : "#FAFAFA",
          colorFillTertiary: isDarkMode ? "#141414" : "#F0F0F0",
          borderRadius: 8,
          borderRadiusLG: 12,
          boxShadow: isDarkMode 
            ? "0 6px 16px rgba(0, 0, 0, 0.45), 0 3px 6px rgba(0, 0, 0, 0.3)"
            : "0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.03)",
          boxShadowSecondary: isDarkMode 
            ? "0 1px 2px rgba(255, 255, 255, 0.08)"
            : "0 1px 3px rgba(0, 0, 0, 0.08)",
          fontSize: 14,
          fontSizeLG: 16,
          padding: 12,
          paddingLG: 16,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          Button: {
            motionDurationMid: "0.18s",
            motionDurationFast: "0.12s",
          },
          Modal: {
            motionDurationMid: "0.18s",
          },
          Table: {
            headerBorderRadius: 8,
          },
          Card: {
            borderRadiusLG: 12,
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}> 
            <Route path="/" element={<Home />} />
            <Route path="/users/admin" element={<UsersAdmin />} />
            <Route path="/usergroups" element={<UserGroups />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/accounts/logs" element={<AccountUploadLogs />} />
            <Route path="/accounts/:accountId/logs" element={<AccountUploadLogs />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/keywords" element={<Keywords />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/mail-configs" element={<MailConfigs />} />
            <Route path="/admin/mail-configs" element={<AdminMailConfigs />} />
            <Route path="/system/account-configs" element={<AccountConfigs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
