import { http } from "../lib/http";
import type { AccountConfigDto } from "../services/types";

export const accountConfigApi = {
  // 获取所有启用的账户配置
  getAll: (): Promise<{ data: AccountConfigDto[] }> => {
    return http.get("/accountconfig");
  },

  // 根据类型获取账户配置
  getByType: (type: number): Promise<{ data: AccountConfigDto[] }> => {
    return http.get(`/accountconfig/type/${type}`);
  },

  // 根据名称搜索账户配置
  search: (name?: string): Promise<{ data: AccountConfigDto[] }> => {
    const params = name ? `?name=${encodeURIComponent(name)}` : "";
    return http.get(`/accountconfig/search${params}`);
  },

  // 分页查询（数据库分页 + 条件筛选）
  page: (
    page: number,
    size: number,
    filter?: Partial<AccountConfigDto>
  ): Promise<{ data: { content: AccountConfigDto[]; totalElements: number } }> => {
    return http.post(`/accountconfig/page?page=${page}&size=${size}`, filter ?? {});
  },

  // 详情
  getById: (id: number): Promise<{ data: AccountConfigDto }> => {
    return http.get(`/accountconfig/${id}`);
  },

  // 新增
  create: (payload: Partial<AccountConfigDto>): Promise<{ data: AccountConfigDto }> => {
    return http.post(`/accountconfig`, payload);
  },

  // 更新
  update: (payload: Partial<AccountConfigDto>): Promise<{ data: AccountConfigDto }> => {
    return http.put(`/accountconfig`, payload);
  },

  // 删除
  remove: (id: number): Promise<void> => {
    return http.delete(`/accountconfig/${id}`);
  },
};
