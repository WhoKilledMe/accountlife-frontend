import { http } from "../lib/http";

export const businessApi = {
  page: (page: number, size: number, filter?: any) => http.post(`/businesstransaction/page?page=${page}&size=${size}`, filter ?? {}),
};


