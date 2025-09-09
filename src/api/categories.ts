import { http } from "../lib/http";
import type { TransactionCategoryDto, PageResponse } from "../services/types";

export const categoriesApi = {
  listAll: () => http.get<TransactionCategoryDto[]>(`/transactioncategory`),

  page: (page: number, size: number, filter?: Partial<TransactionCategoryDto>) =>
    http.post<PageResponse<TransactionCategoryDto>>(`/transactioncategory/page?page=${page}&size=${size}`, filter ?? {}),

  create: (payload: Partial<TransactionCategoryDto>) =>
    http.post(`/transactioncategory`, payload, { flags: { autoToast: true } } as any),

  update: (payload: Partial<TransactionCategoryDto>) =>
    http.put(`/transactioncategory`, payload, { flags: { autoToast: true } } as any),

  remove: (id: number) => http.delete(`/transactioncategory/${id}`, { flags: { autoToast: true } } as any),
};


