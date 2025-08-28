import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useState } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Keywords from "./pages/Keywords";
import Upload from "./pages/Upload";
import UsersAdmin from "./pages/UsersAdmin";
import UserPage from "./pages/UserPage";
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

export default function App() {
  const [isDarkMode] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: "#1890ff",
            colorInfo: "#1890ff",
            colorBgLayout: isDarkMode ? "#0f1217" : "#F6F7FA",
            colorBgContainer: isDarkMode ? "#151922" : "#FFFFFF",
            colorBorder: isDarkMode ? "#303030" : "#E5E5E7",
            colorText: isDarkMode ? "#E6F0FF" : "#1A2233",
            colorTextSecondary: isDarkMode ? "#9FB3C8" : "#667085",
            borderRadius: 6,
            borderRadiusLG: 8,
            boxShadow: isDarkMode 
              ? "0 6px 16px rgba(0, 0, 0, 0.45), 0 3px 6px rgba(0, 0, 0, 0.3)"
              : "0 8px 24px rgba(16, 24, 40, 0.08), 0 3px 8px rgba(16, 24, 40, 0.05)",
            boxShadowSecondary: isDarkMode 
              ? "0 1px 2px rgba(255, 255, 255, 0.08)"
              : "0 1px 2px rgba(16, 24, 40, 0.04)",
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
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}> 
              <Route path="/" element={<Home />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/admin" element={<UsersAdmin />} />
              <Route path="/admin/users" element={<UserPage />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/keywords" element={<Keywords />} />
              <Route path="/upload" element={<Upload />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
