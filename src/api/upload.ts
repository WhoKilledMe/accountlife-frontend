import { http } from "../lib/http";

export const uploadApi = {
  uploadFile: (form: FormData, params?: Record<string, any>) =>
    http.post(`/v1/file/upload`, form, { headers: { "Content-Type": "multipart/form-data" }, params, flags: { autoToast: true } } as any),
};


