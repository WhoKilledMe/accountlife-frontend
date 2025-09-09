import { http } from "../lib/http";
import type { AssetAccountDto } from "../services/types";

export const accountsApi = {
  page: (page: number, size: number, filter?: Partial<AssetAccountDto>) =>
    http.post(`/assetaccount/page?page=${page}&size=${size}`, filter ?? {}),

  list: () => http.get(`/assetaccount`),

  get: (id: number) => http.get(`/assetaccount/${id}`),

  create: (payload: Partial<AssetAccountDto>) =>
    http.post(`/assetaccount`, payload, { flags: { autoToast: true } } as any),

  update: (payload: Partial<AssetAccountDto>) =>
    http.put(`/assetaccount`, payload, { flags: { autoToast: true } } as any),

  remove: (id: number) => http.delete(`/assetaccount/${id}`, { flags: { autoToast: true } } as any),

  batchCreate: (payload: Partial<AssetAccountDto>[]) =>
    http.post(`/assetaccount/batch`, payload, { flags: { autoToast: true } } as any),
};


