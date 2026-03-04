import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getLinkedMediaKeysFn,
  getMediaFn,
  getTotalMediaSizeFn,
} from "../media.api";

export const MEDIA_KEYS = {
  all: ["media"] as const,

  // Parent keys (static arrays for prefix invalidation)
  lists: ["media", "list"] as const,
  totalSize: ["media", "total-size"] as const,
  linked: ["media", "linked-keys"] as const,

  // Child keys (functions for specific queries)
  list: (search: string = "", unusedOnly: boolean = false) =>
    ["media", "list", search, unusedOnly] as const,
  linkedKeys: (keys: string) => ["media", "linked-keys", keys] as const,
  linkedPosts: (key: string) => ["media", "linked-posts", key] as const,
};

export function mediaInfiniteQueryOptions(
  search: string = "",
  unusedOnly: boolean = false,
) {
  return infiniteQueryOptions({
    queryKey: MEDIA_KEYS.list(search, unusedOnly),
    queryFn: async ({ pageParam }) => {
      const result = await getMediaFn({
        data: {
          cursor: pageParam,
          search: search || undefined,
          unusedOnly: unusedOnly || undefined,
        },
      });
      if (result.error) {
        const reason = result.error.reason;
        switch (reason) {
          case "UNAUTHENTICATED":
            throw new Error("登录状态已失效，请重新登录");
          case "PERMISSION_DENIED":
            throw new Error("权限不足，仅管理员可访问媒体库");
          default: {
            reason satisfies never;
            throw new Error("获取媒体列表失败");
          }
        }
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as number | undefined,
  });
}

export function linkedMediaKeysQuery(keys: Array<string>) {
  // Stable key for linked media; use joined keys to avoid referential changes
  const joinedKeys = keys.join("|");
  return queryOptions({
    queryKey: MEDIA_KEYS.linkedKeys(joinedKeys),
    queryFn: async () => {
      const result = await getLinkedMediaKeysFn({ data: { keys } });
      if (result.error) {
        const reason = result.error.reason;
        switch (reason) {
          case "UNAUTHENTICATED":
            throw new Error("登录状态已失效，请重新登录");
          case "PERMISSION_DENIED":
            throw new Error("权限不足，仅管理员可访问媒体关联信息");
          default: {
            reason satisfies never;
            throw new Error("获取媒体关联信息失败");
          }
        }
      }
      return result.data;
    },
    staleTime: 30000,
  });
}

export const totalMediaSizeQuery = queryOptions({
  queryKey: MEDIA_KEYS.totalSize,
  queryFn: async () => {
    const result = await getTotalMediaSizeFn();
    if (result.error) {
      const reason = result.error.reason;
      switch (reason) {
        case "UNAUTHENTICATED":
          throw new Error("登录状态已失效，请重新登录");
        case "PERMISSION_DENIED":
          throw new Error("权限不足，仅管理员可访问媒体统计");
        default: {
          reason satisfies never;
          throw new Error("获取媒体统计失败");
        }
      }
    }
    return result.data;
  },
});
