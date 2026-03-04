import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { EMAIL_UNSUBSCRIBE_TYPES } from "@/lib/db/schema";
import { dbMiddleware, hasSession, sessionMiddleware } from "@/lib/middlewares";
import * as EmailService from "@/features/email/email.service";
import { TestEmailConnectionSchema } from "@/features/email/email.schema";
import { err } from "@/lib/errors";

export const testEmailConnectionFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(TestEmailConnectionSchema)
  .handler(({ context, data }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return EmailService.testEmailConnection(context, data);
  });

export const unsubscribeByTokenFn = createServerFn({
  method: "POST",
})
  .middleware([dbMiddleware])
  .inputValidator(
    z.object({
      userId: z.string(),
      type: z.enum(EMAIL_UNSUBSCRIBE_TYPES),
      token: z.string(),
    }),
  )
  .handler(({ context, data }) =>
    EmailService.unsubscribeByToken(context, data),
  );

export const getReplyNotificationStatusFn = createServerFn({
  method: "GET",
})
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }

    return EmailService.getReplyNotificationStatus(
      context,
      context.session.user.id,
    );
  });

export const toggleReplyNotificationFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(z.object({ enabled: z.boolean() }))
  .handler(({ context, data }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }

    return EmailService.toggleReplyNotification(context, {
      userId: context.session.user.id,
      enabled: data.enabled,
    });
  });
