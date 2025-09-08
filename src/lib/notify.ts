import { message, NotificationPlacement } from "antd";

type NotifyType = "success" | "error" | "info" | "warning";

export const notify = {
  success(text: string) {
    message.success(text);
  },
  error(text: string) {
    message.error(text);
  },
  info(text: string) {
    message.info(text);
  },
  warning(text: string) {
    message.warning(text);
  },
  // unified handler for API boolean-like results
  fromBoolean(ok: boolean, successText: string, errorText: string) {
    if (ok) {
      message.success(successText);
    } else {
      message.error(errorText);
    }
  },
};

export type { NotifyType };


