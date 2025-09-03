// Derived from swagger components.schemas
export interface UserDto {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  createdBy?: string;
  createdAt?: string; // date-time
  updatedBy?: string;
  updatedAt?: string; // date-time
  isDeleted?: number;
  groupId?: number;
  role?: number;
}

export interface UserGroupDto {
  id?: number;
  name?: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isDeleted?: number;
}

export interface UserGroupMemberDto {
  id?: number;
  groupId?: number;
  userId?: number;
  role?: number;
  joinedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isDeleted?: number;
}

export interface TransactionCategoryDto {
  id?: number;
  name?: string;
  type?: number;
  parentId?: number;
  icon?: string;
  userId?: number;
  sortOrder?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isDeleted?: number;
  children?: TransactionCategoryDto[];
}

export interface PlatformTransactionDto {
  id?: number;
  userId?: number;
  platformCode?: string;
  rawJson?: string;
  mappedTransactionId?: number;
  remark?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isDeleted?: number;
}

export interface InvestmentAssetDto {
  id?: number;
  userId?: number;
  accountId?: number;
  code?: string;
  name?: string;
  type?: number;
  quantity?: number;
  costPrice?: number;
  marketPrice?: number;
  currency?: string;
  lastUpdated?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isDeleted?: number;
}

export interface FixedAssetDto {
  id?: number;
  userId?: number;
  name?: string;
  type?: number;
  value?: number;
  purchaseDate?: string;
  location?: string;
  note?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isDeleted?: number;
}

export interface CreditWalletStatementDto {
  id?: number;
  accountId?: number;
  userId?: number;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  totalAmount?: number;
  repayDueDate?: string;
  repayDate?: string;
  status?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isDeleted?: number;
}

export interface CategoryKeywordMapping {
  id?: number;
  categoryId?: number;
  keyword?: string;
  weight?: number;
  userId?: number;
  isActive?: boolean;
  createdTime?: string;
  updatedTime?: string;
}

export interface BudgetDto {
  id?: number;
  userId?: number;
  name?: string;
  type?: number;
  categoryId?: number;
  categoryName?: string;
  amount?: number;
  usedAmount?: number;
  remainingAmount?: number;
  usageRate?: number;
  startDate?: string; // date
  endDate?: string; // date
  status?: number;
  statusName?: string;
  alertThreshold?: number;
  remark?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface AssetAccountDto {
  id?: number;
  userId?: number;
  name?: string;
  type?: number;
  platformCode?: string;
  accountNumber?: string;
  isVirtual?: boolean;
  creditLimit?: number;
  currency?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isDeleted?: number;
}

export interface AccountTransactionDto {
  id?: number;
  userId?: number;
  accountId?: number;
  accountName?: string;
  type?: number;
  amount?: number;
  categoryId?: number;
  categoryName?: string;
  relatedTransactionId?: number;
  description?: string;
  transactionTime?: string;
  sourceType?: number;
  sourceRef?: string;
  statementId?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isDeleted?: number;
}

export interface ApiResponse<T> {
  code?: number;
  message?: string;
  data?: T;
  timestamp?: string;
}

export interface StatisticsDto {
  id?: number;
  userId?: number;
  type?: string;
  name?: string;
  value?: number;
  unit?: string;
  date?: string; // date
  period?: string;
  categoryId?: number;
  categoryName?: string;
  accountId?: number;
  accountName?: string;
  income?: number;
  expense?: number;
  balance?: number;
  percentage?: number;
  target?: number;
  completionRate?: number;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}