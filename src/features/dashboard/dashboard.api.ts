import { createServerFn } from "@tanstack/react-start";
import { err } from "@/lib/errors";
import { hasSession, sessionMiddleware } from "@/lib/middlewares";
import * as DashboardService from "@/features/dashboard/dashboard.service";
import * as CacheService from "@/features/cache/cache.service";
import { DASHBOARD_CACHE_KEYS } from "@/features/dashboard/dashboard.schema";

export const getDashboardStatsFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return DashboardService.getDashboardStats(context);
  });

export const refreshDashboardCacheFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    await CacheService.deleteKey(context, DASHBOARD_CACHE_KEYS.umamiStats);
    return DashboardService.getDashboardStats(context);
  });
