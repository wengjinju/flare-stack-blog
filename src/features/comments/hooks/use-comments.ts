import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCommentFn, deleteCommentFn } from "../api/comments.public.api";
import {
  adminDeleteCommentFn,
  moderateCommentFn,
} from "../api/comments.admin.api";
import { COMMENTS_KEYS } from "@/features/comments/queries";

export function useComments(postId?: number) {
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async (input: Parameters<typeof createCommentFn>[0]) => {
      const result = await createCommentFn(input);
      if (result.error) {
        const reason = result.error.reason;
        switch (reason) {
          case "UNAUTHENTICATED":
            throw new Error("请先登录后再评论");
          case "ROOT_COMMENT_NOT_FOUND":
          case "REPLY_TO_COMMENT_NOT_FOUND":
            throw new Error("该评论已被删除，请刷新页面");
          case "INVALID_ROOT_ID":
          case "ROOT_COMMENT_POST_MISMATCH":
          case "REPLY_TO_COMMENT_ROOT_MISMATCH":
          case "ROOT_COMMENT_CANNOT_HAVE_REPLY_TO":
            throw new Error("评论结构异常，请刷新页面重试");
          default: {
            reason satisfies never;
            throw new Error("未知错误");
          }
        }
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate both root comments and all replies queries for this post
      if (postId) {
        queryClient.invalidateQueries({
          queryKey: COMMENTS_KEYS.roots(postId),
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: COMMENTS_KEYS.repliesLists(postId),
          exact: false,
        });
      }
      // Also invalidate admin view queries
      queryClient.invalidateQueries({
        queryKey: COMMENTS_KEYS.admin,
        exact: false,
      });
      // Also invalidate user's own comments list
      queryClient.invalidateQueries({
        queryKey: COMMENTS_KEYS.mine,
        exact: false,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (input: Parameters<typeof deleteCommentFn>[0]) => {
      const result = await deleteCommentFn(input);
      if (result.error) {
        const reason = result.error.reason;
        switch (reason) {
          case "UNAUTHENTICATED":
            throw new Error("请先登录后再操作");
          case "COMMENT_NOT_FOUND":
            throw new Error("评论不存在或已删除");
          case "PERMISSION_DENIED":
            throw new Error("无权限删除该评论");
          default: {
            reason satisfies never;
            throw new Error("未知错误");
          }
        }
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate both root comments and all replies queries for this post
      if (postId) {
        queryClient.invalidateQueries({
          queryKey: COMMENTS_KEYS.roots(postId),
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: COMMENTS_KEYS.repliesLists(postId),
          exact: false,
        });
      }
      // NEW: Also invalidate admin view queries
      queryClient.invalidateQueries({
        queryKey: COMMENTS_KEYS.admin,
        exact: false,
      });
      // Also invalidate user's own comments list
      queryClient.invalidateQueries({
        queryKey: COMMENTS_KEYS.mine,
        exact: false,
      });
      toast.success("评论已删除");
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  return {
    createComment: createCommentMutation.mutateAsync,
    isCreating: createCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutateAsync,
    isDeleting: deleteCommentMutation.isPending,
  };
}

export function useAdminComments() {
  const queryClient = useQueryClient();

  const moderateMutation = useMutation({
    mutationFn: async (input: Parameters<typeof moderateCommentFn>[0]) => {
      const result = await moderateCommentFn(input);
      if (result.error) {
        const reason = result.error.reason;
        switch (reason) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          case "COMMENT_NOT_FOUND":
            throw new Error("评论不存在");
          default: {
            reason satisfies never;
            throw new Error("未知错误");
          }
        }
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate all comment related queries to be safe since moderation
      // affects visibility in both admin and public views
      queryClient.invalidateQueries({ queryKey: COMMENTS_KEYS.all });
      toast.success("审核操作成功");
    },
    onError: (error) => {
      toast.error("操作失败: " + error.message);
    },
  });

  const adminDeleteMutation = useMutation({
    mutationFn: async (input: Parameters<typeof adminDeleteCommentFn>[0]) => {
      const result = await adminDeleteCommentFn(input);
      if (result.error) {
        const reason = result.error.reason;
        switch (reason) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          case "COMMENT_NOT_FOUND":
            throw new Error("评论不存在");
          default: {
            reason satisfies never;
            throw new Error("未知错误");
          }
        }
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMENTS_KEYS.all });
      toast.success("评论已永久删除");
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  return {
    moderate: moderateMutation.mutateAsync,
    isModerating: moderateMutation.isPending,
    adminDelete: adminDeleteMutation.mutateAsync,
    isAdminDeleting: adminDeleteMutation.isPending,
  };
}
