import { http } from "../lib/http";

export const mailSyncApi = {
  sendEmail: (payload: any) => http.post(`/mailsync/email`, payload, { flags: { autoToast: true } } as any),
};


