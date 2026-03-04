import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { statusFilterToApi } from "../types";
import type {
  PostListItem,
  SortDirection,
  SortField,
  StatusFilter,
} from "../types";
import {
  deletePostFn,
  getPostsCountFn,
  getPostsFn,
} from "@/features/posts/api/posts.admin.api";

import { ADMIN_ITEMS_PER_PAGE } from "@/lib/constants";
import { POSTS_KEYS } from "@/features/posts/queries";

interface UsePostsOptions {
  page: number;
  status: StatusFilter;
  sortDir: SortDirection;
  sortBy: SortField;
  search: string;
}

function getErrorReason(result: unknown): string | null {
  if (!result || typeof result !== "object" || !("error" in result)) {
    return null;
  }
  const error = (result as { error?: { reason?: string } | null }).error;
  return error?.reason ?? null;
}

function unwrapResultData<T>(result: unknown): T {
  if (result && typeof result === "object" && "data" in result) {
    return (result as { data: T }).data;
  }
  return result as T;
}

export function usePosts({
  page,
  status,
  sortDir,
  sortBy,
  search,
}: UsePostsOptions) {
  const apiStatus = statusFilterToApi(status);

  const listParams = {
    offset: (page - 1) * ADMIN_ITEMS_PER_PAGE,
    limit: ADMIN_ITEMS_PER_PAGE,
    status: apiStatus,
    sortDir,
    sortBy,
    search: search || undefined,
  };

  const countParams = {
    status: apiStatus,
    search: search || undefined,
  };

  const postsQuery = useQuery({
    queryKey: POSTS_KEYS.adminList(listParams),
    queryFn: async () => {
      const result = await getPostsFn({ data: listParams });
      const reason = getErrorReason(result);
      if (reason) {
        switch (reason) {
          case "UNAUTHENTICATED":
            throw new Error("登录状态已失效，请重新登录");
          case "PERMISSION_DENIED":
            throw new Error("权限不足，仅管理员可访问");
          default:
            throw new Error("获取文章列表失败");
        }
      }
      return unwrapResultData<Array<PostListItem>>(result);
    },
  });

  const countQuery = useQuery({
    queryKey: POSTS_KEYS.count(countParams),
    queryFn: async () => {
      const result = await getPostsCountFn({ data: countParams });
      const reason = getErrorReason(result);
      if (reason) {
        switch (reason) {
          case "UNAUTHENTICATED":
            throw new Error("登录状态已失效，请重新登录");
          case "PERMISSION_DENIED":
            throw new Error("权限不足，仅管理员可访问");
          default:
            throw new Error("获取文章统计失败");
        }
      }
      return unwrapResultData<number>(result);
    },
  });

  const totalPages = Math.ceil((countQuery.data ?? 0) / ADMIN_ITEMS_PER_PAGE);

  return {
    posts: postsQuery.data ?? [],
    totalCount: countQuery.data ?? 0,
    totalPages,
    isPending: postsQuery.isPending,
    error: postsQuery.error,
  };
}

interface UseDeletePostOptions {
  onSuccess?: () => void;
}

export function useDeletePost({ onSuccess }: UseDeletePostOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: PostListItem) => deletePostFn({ data: { id: post.id } }),
    onSuccess: (result, post) => {
      const reason = getErrorReason(result);
      if (reason) {
        switch (reason) {
          case "UNAUTHENTICATED":
            toast.error("登录状态已失效，请重新登录");
            return;
          case "PERMISSION_DENIED":
            toast.error("权限不足，仅管理员可删除文章");
            return;
          default:
            toast.error("删除条目失败");
            return;
        }
      }
      queryClient.invalidateQueries({ queryKey: POSTS_KEYS.adminLists });
      queryClient.invalidateQueries({ queryKey: POSTS_KEYS.counts });
      toast.success("条目已删除", {
        description: `条目 "${post.title}" 已删除成功`,
      });
      onSuccess?.();
    },
    onError: (_error, post) => {
      toast.error("删除条目失败", {
        description: `删除条目 "${post.title}" 失败`,
      });
    },
  });
}
