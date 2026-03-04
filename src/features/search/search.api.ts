import { createServerFn } from "@tanstack/react-start";
import {
  DeleteSearchDocSchema,
  UpsertSearchDocSchema,
} from "@/features/search/search.schema";
import * as SearchService from "@/features/search/search.service";
import { err } from "@/lib/errors";
import { dbMiddleware, hasSession, sessionMiddleware } from "@/lib/middlewares";

export const buildSearchIndexFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return SearchService.rebuildIndex(context);
  });

export const upsertSearchDocFn = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .inputValidator(UpsertSearchDocSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return SearchService.upsert(context, data);
  });

export const deleteSearchDocFn = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .inputValidator(DeleteSearchDocSchema)
  .handler(({ data, context }) => {
    if (!hasSession(context)) {
      return err({ reason: "UNAUTHENTICATED" });
    }
    if (context.session.user.role !== "admin") {
      return err({ reason: "PERMISSION_DENIED" });
    }

    return SearchService.deleteIndex(context, data);
  });

export const getIndexVersionFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(({ context }) => SearchService.getIndexVersion(context));
