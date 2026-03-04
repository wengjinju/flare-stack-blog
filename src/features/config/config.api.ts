import { createServerFn } from "@tanstack/react-start";
import * as ConfigService from "@/features/config/config.service";
import { err } from "@/lib/errors";
import { hasSession, sessionMiddleware } from "@/lib/middlewares";
import { SystemConfigSchema } from "@/features/config/config.schema";

export const getSystemConfigFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return ConfigService.getSystemConfig(context);
  });

export const updateSystemConfigFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(SystemConfigSchema)
  .handler(({ context, data }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return ConfigService.updateSystemConfig(context, data);
  });
