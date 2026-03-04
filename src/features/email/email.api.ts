import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { EMAIL_UNSUBSCRIBE_TYPES } from "@/lib/db/schema";
import {
  adminMiddleware,
  dbMiddleware,
  sessionMiddleware,
} from "@/lib/middlewares";
import { testEmailConnection } from "@/features/email/email.service";
import { TestEmailConnectionSchema } from "@/features/email/email.schema";
import * as EmailData from "@/features/email/data/email.data";
import { verifyUnsubscribeToken } from "@/features/email/email.utils";
import { serverEnv } from "@/lib/env/server.env";
import { err, ok } from "@/lib/error";

export const testEmailConnectionFn = createServerFn({
  method: "POST",
})
  .middleware([adminMiddleware])
  .inputValidator(TestEmailConnectionSchema)
  .handler(({ context, data }) => testEmailConnection(context, data));

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
  .handler(async ({ context, data }) => {
    const { BETTER_AUTH_SECRET } = serverEnv(context.env);
    const isValid = await verifyUnsubscribeToken(
      BETTER_AUTH_SECRET,
      data.userId,
      data.type,
      data.token,
    );

    if (!isValid) {
      return err({ reason: "INVALID_OR_EXPIRED_TOKEN" });
    }

    await EmailData.unsubscribe(context.db, data.userId, data.type);
    return ok({ success: true });
  });

export const getReplyNotificationStatusFn = createServerFn({
  method: "GET",
})
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) {
      return err({ reason: "UNAUTHENTICATED" });
    }

    const unsubscribed = await EmailData.isUnsubscribed(
      context.db,
      context.session.user.id,
      "reply_notification",
    );
    return ok({ enabled: !unsubscribed });
  });

export const toggleReplyNotificationFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(z.object({ enabled: z.boolean() }))
  .handler(async ({ context, data }) => {
    if (!context.session) {
      return err({ reason: "UNAUTHENTICATED" });
    }

    if (data.enabled) {
      await EmailData.subscribe(
        context.db,
        context.session.user.id,
        "reply_notification",
      );
    } else {
      await EmailData.unsubscribe(
        context.db,
        context.session.user.id,
        "reply_notification",
      );
    }
    return ok({ success: true });
  });
