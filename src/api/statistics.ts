import { http } from "../lib/http";
import type { StatisticsDto, ApiResponse } from "../services/types";

export const statisticsApi = {
  // 获取用户总资产统计
  getTotalAssets: () =>
    http.get<ApiResponse<StatisticsDto>>(`/statistics/total-assets`),

  // 获取月度收支统计
  getMonthlyStatistics: (month: string) =>
    http.get<ApiResponse<StatisticsDto>>(`/statistics/monthly`, {
      params: { month }
    }),

  // 获取年度收支统计
  getYearlyStatistics: (year: number) =>
    http.get<ApiResponse<StatisticsDto>>(`/statistics/yearly`, {
      params: { year }
    }),

  // 获取分类统计
  getCategoryStatistics: (startDate: string, endDate: string) =>
    http.get<ApiResponse<StatisticsDto[]>>(`/statistics/category`, {
      params: { startDate, endDate }
    }),

  // 获取账户余额统计
  getAccountBalanceStatistics: () =>
    http.get<ApiResponse<StatisticsDto[]>>(`/statistics/account-balance`),

  // 获取投资资产统计
  getInvestmentStatistics: () =>
    http.get<ApiResponse<StatisticsDto[]>>(`/statistics/investment`),

  // 获取固定资产统计
  getFixedAssetStatistics: () =>
    http.get<ApiResponse<StatisticsDto[]>>(`/statistics/fixed-asset`),

  // 获取趋势统计
  getTrendStatistics: (startDate: string, endDate: string) =>
    http.get<ApiResponse<any>>(`/statistics/trend`, {
      params: { startDate, endDate }
    }),

  // 获取预算执行情况
  getBudgetExecution: (month: string) =>
    http.get<ApiResponse<StatisticsDto>>(`/statistics/budget`, {
      params: { month }
    }),
};
