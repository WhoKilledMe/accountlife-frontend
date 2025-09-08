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
};
