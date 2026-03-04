import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import {
  GetMediaListInputSchema,
  UpdateMediaNameInputSchema,
  UploadMediaInputSchema,
} from "@/features/media/media.schema";
import * as MediaService from "@/features/media/media.service";
import { err } from "@/lib/errors";
import { hasSession, sessionMiddleware } from "@/lib/middlewares";

export const uploadImageFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(UploadMediaInputSchema)
  .handler(({ data: file, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return MediaService.upload(context, file);
  });

export const deleteImageFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    }),
  )
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return MediaService.deleteImage(context, data.key);
  });

export const getMediaFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GetMediaListInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return MediaService.getMediaList(context, data);
  });

export const getLinkedPostsFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    }),
  )
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return MediaService.getLinkedPosts(context, data.key);
  });

export const getLinkedMediaKeysFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(
    z.object({
      keys: z.array(z.string()),
    }),
  )
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return MediaService.getLinkedMediaKeys(context, data.keys);
  });

export const getTotalMediaSizeFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return MediaService.getTotalMediaSize(context);
  });

export const updateMediaNameFn = createServerFn({
  method: "POST",
})
  .middleware([sessionMiddleware])
  .inputValidator(UpdateMediaNameInputSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }
    return MediaService.updateMediaName(context, data);
  });
