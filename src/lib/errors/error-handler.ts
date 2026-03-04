import { toast } from "sonner";
import { parseRequestError } from "./request-errors";

let redirectingToLogin = false;

export function handleServerError(error: unknown): void {
  const parsed = parseRequestError(error);

  switch (parsed.code) {
    case "UNAUTHENTICATED": {
      if (typeof window !== "undefined" && !redirectingToLogin) {
        redirectingToLogin = true;
        window.location.href = "/login";
      }
      return;
    }
    case "PERMISSION_DENIED": {
      toast.error("权限不足", {
        description: "当前操作仅管理员可执行",
      });
      return;
    }
    case "RATE_LIMITED": {
      const seconds = Math.max(1, Math.ceil(parsed.retryAfterMs / 1000));
      toast.warning("请求过于频繁", {
        description: `请 ${seconds} 秒后重试`,
      });
      return;
    }
    case "TURNSTILE_FAILED": {
      toast.error("人机验证失败", {
        description: parsed.message,
      });
      return;
    }
    case "UNKNOWN":
    default: {
      toast.error("请求失败", {
        description: "发生了未预期的错误，请稍后重试",
      });
      return;
    }
  }
}
