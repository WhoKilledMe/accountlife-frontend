import { http } from "../lib/http";

export const authApi = {
  login: (payload: any) => http.post(`/auth/login`, payload),
  logout: () => http.post(`/auth/logout`, {}),
};


