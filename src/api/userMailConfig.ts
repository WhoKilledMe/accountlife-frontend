import { http } from "../lib/http";

export const userMailConfigApi = {
  // 当前用户或按用户查询配置
  queryByUser: (userId?: number) => http.post(`/usermailconfig/query`, { userId }),
  me: () => http.get(`/usermailconfig/me`),

  // 新增或更新
  create: (payload: any) => http.post(`/usermailconfig`, payload, { flags: { autoToast: true } } as any),
  update: (payload: any) => http.put(`/usermailconfig`, payload, { flags: { autoToast: true } } as any),

  // 管理端分页
  page: (page: number, size: number, filter?: any) => http.post(`/usermailconfig/page?page=${page}&size=${size}`, filter ?? {}),

  // 删除
  remove: (id: number) => http.delete(`/usermailconfig/${id}`, { flags: { autoToast: true } } as any),

  // 测试
  test: (payload: any) => http.post(`/usermailconfig/test`, payload),
};


