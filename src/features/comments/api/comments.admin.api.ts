import { createServerFn } from "@tanstack/react-start";
import {
  DeleteCommentInputSchema,
  GetAllCommentsInputSchema,
  GetUserStatsInputSchema,
  ModerateCommentInputSchema,
} from "@/features/comments/comments.schema";
import * as CommentService from "@/features/comments/comments.service";
import { err } from "@/lib/errors";
import { hasSession, sessionMiddleware } from "@/lib/middlewares";

// Admin API - Get all comments with filters
export const getAllCommentsFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GetAllCommentsInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await CommentService.getAllComments(context, data);
  });

// Admin API - Moderate a comment (approve/reject)
export const moderateCommentFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(ModerateCommentInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await CommentService.moderateComment(
      context,
      data,
      context.session.user.id,
    );
  });

// Admin API - Hard delete a comment
export const adminDeleteCommentFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(DeleteCommentInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await CommentService.adminDeleteComment(context, data);
  });

// Admin API - Get user stats for hover card
export const getUserStatsFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GetUserStatsInputSchema)
  .handler(async ({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return await CommentService.getUserCommentStats(context, data.userId);
  });
