import { createServerFn } from "@tanstack/react-start";
import {
  DeletePostInputSchema,
  FindPostByIdInputSchema,
  FindPostBySlugInputSchema,
  GenerateSlugInputSchema,
  GetPostsCountInputSchema,
  GetPostsInputSchema,
  PreviewSummaryInputSchema,
  StartPostProcessInputSchema,
  UpdatePostInputSchema,
} from "@/features/posts/posts.schema";
import * as PostService from "@/features/posts/posts.service";
import { err } from "@/lib/errors";
import { hasSession, sessionMiddleware } from "@/lib/middlewares";

export const generateSlugFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GenerateSlugInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.generateSlug(context, data);
  });

export const createEmptyPostFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.createEmptyPost(context);
  });

export const getPostsFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GetPostsInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.getPosts(context, data);
  });

export const getPostsCountFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GetPostsCountInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.getPostsCount(context, data);
  });

export const findPostBySlugFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(FindPostBySlugInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.findPostBySlugAdmin(context, data);
  });

export const findPostByIdFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(FindPostByIdInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.findPostById(context, data);
  });

export const updatePostFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(UpdatePostInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.updatePost(context, data);
  });

export const deletePostFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(DeletePostInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.deletePost(context, data);
  });

export const previewSummaryFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(PreviewSummaryInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.previewSummary(context, data);
  });

export const startPostProcessWorkflowFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(StartPostProcessInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return PostService.startPostProcessWorkflow(context, data);
  });
