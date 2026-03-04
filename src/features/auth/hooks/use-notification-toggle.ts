import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getReplyNotificationStatusFn,
  toggleReplyNotificationFn,
} from "@/features/email/email.api";
import { EMAIL_KEYS } from "@/features/email/queries";

export function useNotificationToggle(userId: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data: notificationStatus,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: EMAIL_KEYS.replyNotification(userId),
    queryFn: () => getReplyNotificationStatusFn(),
    enabled: !!userId,
  });
  const currentEnabled =
    !notificationStatus || notificationStatus.error
      ? undefined
      : notificationStatus.data.enabled;

  const mutation = useMutation({
    mutationFn: (enabled: boolean) =>
      toggleReplyNotificationFn({ data: { enabled } }),
    onSuccess: (result, enabled) => {
      if (result.error) {
        toast.error("请先登录后再操作");
        return;
      }
      queryClient.setQueryData(EMAIL_KEYS.replyNotification(userId), {
        data: { enabled },
        error: null,
      });
      toast.success(enabled ? "已开启通知" : "已关闭通知");
    },
    onError: () => {
      toast.error("操作失败，请重试");
    },
  });

  return {
    enabled: currentEnabled,
    isLoading,
    isPending: mutation.isPending,
    toggle: () => {
      if (isLoading) {
        toast.message("正在获取通知状态，请稍候");
        return;
      }
      if (queryError) {
        toast.error("获取通知状态失败，请重试");
        return;
      }
      if (notificationStatus?.error) {
        toast.error("请先登录后再操作");
        return;
      }
      if (currentEnabled === undefined) {
        toast.error("通知状态异常，请刷新后重试");
        return;
      }
      mutation.mutate(!currentEnabled);
    },
  };
}

export type UseNotificationToggleReturn = ReturnType<
  typeof useNotificationToggle
>;
