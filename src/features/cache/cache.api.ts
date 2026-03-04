import { createServerFn } from "@tanstack/react-start";
import * as CacheService from "@/features/cache/cache.service";
import { err } from "@/lib/errors";
import { hasSession, sessionMiddleware } from "@/lib/middlewares";

export const invalidateSiteCacheFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return CacheService.invalidateSiteCache(context);
  });
