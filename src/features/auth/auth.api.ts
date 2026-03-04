import { createServerFn } from "@tanstack/react-start";
import * as AuthService from "@/features/auth/auth.service";
import { dbMiddleware, hasSession, sessionMiddleware } from "@/lib/middlewares";
import { err, ok } from "@/lib/error";

export const getSessionFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(({ context }) => AuthService.getSession(context));

export const userHasPasswordFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }

    return ok(await AuthService.userHasPassword(context));
  });

export const getIsEmailConfiguredFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(({ context }) => AuthService.getIsEmailConfigured(context));
