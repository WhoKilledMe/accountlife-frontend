import { http } from "../lib/http";
import type { AccountTransactionDto, PageResponse } from "../services/types";

export const transactionsApi = {
  // 分页查询（数据库分页+模糊搜索）
  page: (page: number, size: number, filter?: Partial<AccountTransactionDto>) =>
    http.post<PageResponse<AccountTransactionDto>>(
      `/accounttransaction/page?page=${page}&size=${size}`,
      filter ?? {}
    ),

  // 列表（简单获取所有）
  list: () => http.get<AccountTransactionDto[]>(`/accounttransaction`),
};

export const transactionCategoryApi = {
  // 下拉分页查询，支持名称模糊
  select: (page: number, size: number, categoryName?: string) =>
    http.get<PageResponse<any>>(
      `/transactioncategory/select`,
      { params: { page, size, categoryName } }
    ),
};

export const assetAccountApi = {
  // 下拉分页查询，支持名称模糊
  select: (page: number, size: number, accountName?: string) =>
    http.get<PageResponse<any>>(
      `/assetaccount/select`,
      { params: { page, size, accountName } }
    ),
};
