export interface LabeledEnumItem<T extends string | number | boolean> {
  key: T;
  value: string;
  color?: string;
}

export const AccountTypeEnum: LabeledEnumItem<number>[] = [
  { key: 1, value: "银行", color: "blue" },
  { key: 2, value: "平台", color: "green" },
  { key: 3, value: "信用钱包", color: "orange" },
  { key: 4, value: "钱包", color: "purple" },
  { key: 5, value: "保险", color: "magenta" },
  { key: 6, value: "证券", color: "geekblue" },
];

export const SystemAccountTypeEnum: LabeledEnumItem<number>[] = [
  { key: 1, value: "银行", color: "blue" },
  { key: 2, value: "平台", color: "green" },
  { key: 3, value: "信用钱包", color: "orange" },
  { key: 4, value: "钱包", color: "purple" },
  { key: 5, value: "保险", color: "magenta" },
  { key: 6, value: "证券", color: "geekblue" },
];

export const TransactionCategoryTypeEnum: LabeledEnumItem<number>[] = [
  { key: 1, value: "收入", color: "green" },
  { key: 2, value: "支出", color: "red" },
  { key: 3, value: "转出", color: "blue" },
  { key: 4, value: "转入", color: "yellow" },
];

export const TransactionTypeEnum: LabeledEnumItem<number>[] = [
  { key: 1, value: "收入", color: "green" },
  { key: 2, value: "支出", color: "red" },
];

export const UploadLogStatusEnum: LabeledEnumItem<string>[] = [
  { key: "PENDING", value: "待处理", color: "default" },
  { key: "PROCESSING", value: "处理中", color: "processing" },
  { key: "COMPLETED", value: "完成", color: "success" },
  { key: "FAILED", value: "失败", color: "error" },
];

export const ActiveStatusBooleanEnum: LabeledEnumItem<boolean>[] = [
  { key: true, value: "启用", color: "success" },
  { key: false, value: "停用", color: "default" },
];

export const BudgetStatusEnum: LabeledEnumItem<string>[] = [
  { key: "ACTIVE", value: "活跃", color: "green" },
  { key: "INACTIVE", value: "停用", color: "red" },
  { key: "EXPIRED", value: "过期", color: "orange" },
];

export function getEnumItemByKey<T extends string | number | boolean>(list: LabeledEnumItem<T>[], key?: T) {
  return list.find(i => i.key === key);
}

export function toSelectOptions<T extends string | number | boolean>(list: LabeledEnumItem<T>[]) {
  return list.map(i => ({ label: i.value, value: i.key }));
}


