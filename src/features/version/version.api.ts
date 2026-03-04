import { createServerFn } from "@tanstack/react-start";
import * as VersionService from "./version.service";
import { err } from "@/lib/errors";
import { hasSession, sessionMiddleware } from "@/lib/middlewares";

export const checkUpdateFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return VersionService.checkForUpdate(context);
  });

export const forceCheckUpdateFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return VersionService.checkForUpdate(context, true);
  });
