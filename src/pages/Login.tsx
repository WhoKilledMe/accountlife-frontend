import { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { http } from "../lib/http";
import { useNavigate, Navigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const resp = await http.post("/auth/login", values);
      const jwt = resp.data?.token ?? resp.data?.data?.token;
      if (!jwt) {
        throw new Error("登录失败：未返回token");
      }
      localStorage.setItem("token", jwt);
      try {
        (http.defaults.headers as any).common = (http.defaults.headers as any).common || {};
        (http.defaults.headers as any).common["Authorization"] = `Bearer ${jwt}`;
      } catch (_) {}
      message.success("登录成功");
      navigate("/", { replace: true });
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f6f7fa 0%, #ffffff 100%)",
        padding: 24,
      }}
    >
      <Card
        style={{ width: 360, boxShadow: "0 8px 24px rgba(16,24,40,0.08)" }}
        title={<Typography.Title level={4} style={{ margin: 0 }}>账号登录</Typography.Title>}
      >
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input placeholder="请输入用户名" size="large" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password placeholder="请输入密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}


