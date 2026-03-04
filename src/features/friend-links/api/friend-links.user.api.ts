import { createServerFn } from "@tanstack/react-start";
import { SubmitFriendLinkInputSchema } from "../friend-links.schema";
import * as FriendLinkService from "../friend-links.service";
import {
  createRateLimitMiddleware,
  dbMiddleware,
  hasSession,
  sessionMiddleware,
  turnstileMiddleware,
} from "@/lib/middlewares";
import { err } from "@/lib/errors";

export const submitFriendLinkFn = createServerFn({
  method: "POST",
})
  .middleware([
    createRateLimitMiddleware({
      capacity: 3,
      interval: "1h",
      key: "friend-links:submit",
    }),
    turnstileMiddleware,
    sessionMiddleware,
  ])
  .inputValidator(SubmitFriendLinkInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }

    return await FriendLinkService.submitFriendLink(context, data);
  });

export const getApprovedFriendLinksFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    return await FriendLinkService.getApprovedFriendLinks(context);
  });

export const getMyFriendLinksFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }

    return await FriendLinkService.getMyFriendLinks(context);
  });
