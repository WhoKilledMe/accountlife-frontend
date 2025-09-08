import { http } from "../lib/http";
import type { BudgetDto, ApiResponse } from "../services/types";

export const budgetApi = {
  // 获取用户当前月份预算使用情况
  getCurrentMonthBudgetUsage: () =>
    http.get<ApiResponse<BudgetDto[]>>(`/budget/usage/current-month`),

  // 获取用户指定月份预算使用情况
  getMonthBudgetUsage: (month: string) =>
    http.get<ApiResponse<BudgetDto[]>>(`/budget/usage/month`, {
      params: { month }
    }),

  // 获取用户所有预算
  getAll: () =>
    http.get<ApiResponse<BudgetDto[]>>(`/budget/user/1`), // 临时使用固定用户ID

  // 根据ID查询预算
  getById: (id: number) =>
    http.get<ApiResponse<BudgetDto>>(`/budget/${id}`),

  // 创建预算
  create: (budget: Partial<BudgetDto>) =>
    http.post<ApiResponse<BudgetDto>>(`/budget`, budget),

  // 更新预算
  update: (budget: Partial<BudgetDto>) =>
    http.put<ApiResponse<BudgetDto>>(`/budget`, budget),

  // 删除预算
  delete: (id: number) =>
    http.delete<ApiResponse<void>>(`/budget/${id}`),

  // 查询用户指定月份的预算
  getByMonth: (userId: number, month: string) =>
    http.get<ApiResponse<BudgetDto[]>>(`/budget/user/${userId}/month`, {
      params: { month }
    }),

  // 查询用户指定年份的预算
  getByYear: (userId: number, year: number) =>
    http.get<ApiResponse<BudgetDto[]>>(`/budget/user/${userId}/year`, {
      params: { year }
    }),

  // 查询用户指定分类的预算
  getByCategory: (userId: number, categoryId: number) =>
    http.get<ApiResponse<BudgetDto[]>>(`/budget/user/${userId}/category/${categoryId}`),

  // 更新预算使用金额
  updateUsedAmount: (id: number, usedAmount: number) =>
    http.put<ApiResponse<BudgetDto>>(`/budget/${id}/used-amount`, null, {
      params: { usedAmount }
    }),

  // 检查预算状态
  checkStatus: (id: number) =>
    http.put<ApiResponse<BudgetDto>>(`/budget/${id}/check-status`),

  // 获取预算提醒
  getAlerts: (userId: number) =>
    http.get<ApiResponse<BudgetDto[]>>(`/budget/user/${userId}/alerts`),
};
