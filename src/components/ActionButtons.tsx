import { Button, Popconfirm, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

type PermissionCheck = (permKey?: string) => boolean;

// 可替换为实际权限校验逻辑（如从上下文/用户信息中读取）
const defaultCheck: PermissionCheck = () => true;

type BaseProps = {
  onClick?: () => void;
  children?: ReactNode;
  permKey?: string;
  checkPermission?: PermissionCheck;
  size?: "small" | "middle" | "large";
  type?: "link" | "text" | "default" | "primary" | "dashed";
  danger?: boolean;
  icon?: ReactNode;
  title?: string;
  disabled?: boolean;
};

export function CreateButton(props: BaseProps) {
  const { onClick, children, permKey, checkPermission = defaultCheck, size = "middle", type = "primary", icon = <PlusOutlined />, title, disabled } = props;
  const allowed = checkPermission(permKey);
  const btn = (
    <Button type={type} size={size} icon={icon} onClick={onClick} disabled={!allowed || disabled}>
      {children}
    </Button>
  );
  return title ? <Tooltip title={title}>{btn}</Tooltip> : btn;
}

type EditProps = BaseProps & { onClick: () => void };
export function EditButton(props: EditProps) {
  const { onClick, permKey, checkPermission = defaultCheck, size = "small", type = "text", icon = <EditOutlined />, title, disabled } = props;
  const allowed = checkPermission(permKey);
  const btn = (
    <Button type={type} size={size} icon={icon} onClick={onClick} disabled={!allowed || disabled} />
  );
  return title ? <Tooltip title={title}>{btn}</Tooltip> : btn;
}

type DeleteProps = BaseProps & { onConfirm: () => void; confirmText?: string };
export function DeleteButton(props: DeleteProps) {
  const { onConfirm, permKey, checkPermission = defaultCheck, size = "small", type = "text", icon = <DeleteOutlined />, title, confirmText = "确定删除该记录吗？", danger = true, disabled } = props;
  const allowed = checkPermission(permKey);
  const btn = (
    <Popconfirm title={confirmText} onConfirm={onConfirm} disabled={!allowed || disabled}>
      <Button type={type} size={size} icon={icon} danger={danger} disabled={!allowed || disabled} />
    </Popconfirm>
  );
  return title ? <Tooltip title={title}>{btn}</Tooltip> : btn;
}


