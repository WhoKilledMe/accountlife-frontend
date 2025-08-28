import { Card } from "antd";
import type { PropsWithChildren, ReactNode } from "react";

type FormCardProps = PropsWithChildren<{
  title?: ReactNode;
  extra?: ReactNode;
  style?: React.CSSProperties;
}>;

export default function FormCard({ title, extra, style, children }: FormCardProps) {
  return (
    <Card
      title={title}
      extra={extra}
      bordered={false}
      style={{ borderRadius: 8, ...style }}
      bodyStyle={{ padding: 16 }}
    >
      {children}
    </Card>
  );
}

