import { createServerFn } from "@tanstack/react-start";
import {
  ApproveFriendLinkInputSchema,
  CreateFriendLinkInputSchema,
  DeleteFriendLinkInputSchema,
  GetAllFriendLinksInputSchema,
  RejectFriendLinkInputSchema,
  UpdateFriendLinkInputSchema,
} from "../friend-links.schema";
import * as FriendLinkService from "../friend-links.service";
import { err } from "@/lib/errors";
import { hasSession, sessionMiddleware } from "@/lib/middlewares";

export const getAllFriendLinksFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GetAllFriendLinksInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await FriendLinkService.getAllFriendLinks(context, data);
  });

export const createFriendLinkFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(CreateFriendLinkInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await FriendLinkService.createFriendLink(context, data);
  });

export const updateFriendLinkFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(UpdateFriendLinkInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await FriendLinkService.updateFriendLink(context, data);
  });

export const approveFriendLinkFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(ApproveFriendLinkInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await FriendLinkService.approveFriendLink(context, data);
  });

export const rejectFriendLinkFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(RejectFriendLinkInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await FriendLinkService.rejectFriendLink(context, data);
  });

export const deleteFriendLinkFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(DeleteFriendLinkInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await FriendLinkService.deleteFriendLink(context, data);
  });
