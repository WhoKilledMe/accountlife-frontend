import { http } from "../lib/http";
import type { BudgetDto } from "../services/types";

export const budgetsApi = {
  listByUser: (userId: number) => http.get(`/budget/user/${userId}`),
  create: (payload: Partial<BudgetDto>) => http.post(`/budget`, payload, { flags: { autoToast: true } } as any),
  remove: (id: number) => http.delete(`/budget/${id}`, { flags: { autoToast: true } } as any),
};


