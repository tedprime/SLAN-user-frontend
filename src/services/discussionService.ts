import { apiRequest } from "./api";
import type {
  Discussion,
  DiscussionWithReplies,
  DiscussionReply,
  DiscussionListResponse,
  DiscussionResponse,
  ReplyResponse,
  ListDiscussionsParams,
  CreateDiscussionPayload,
  UpdateDiscussionPayload,
  CreateReplyPayload,
  PinDiscussionPayload,
  LockDiscussionPayload,
} from "./types/discussion.types";

function buildQuery(params: ListDiscussionsParams): string {
  const search = new URLSearchParams();
  if (params.unitId !== undefined) search.set("unitId", String(params.unitId));
  if (params.moduleId !== undefined) search.set("moduleId", String(params.moduleId));
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 20));
  return search.toString();
}

export const discussionService = {
  /** GET /discussions — filterable by unitId/moduleId, paginated, pinned-first. */
  listDiscussions: async (params: ListDiscussionsParams = {}): Promise<Discussion[]> => {
    const res = await apiRequest<DiscussionListResponse>(`/discussions?${buildQuery(params)}`);
    return res.data;
  },

  /** POST /discussions — starts a new thread. */
  createDiscussion: async (payload: CreateDiscussionPayload): Promise<DiscussionWithReplies> => {
    const res = await apiRequest<DiscussionResponse>("/discussions", {
      method: "POST",
      body: payload,
    });
    return res.data;
  },

  /** GET /discussions/{id} — thread with all replies. */
  getDiscussion: async (id: number): Promise<DiscussionWithReplies> => {
    const res = await apiRequest<DiscussionResponse>(`/discussions/${id}`);
    return res.data;
  },

  /** PATCH /discussions/{id} — author or admin only. */
  updateDiscussion: async (id: number, payload: UpdateDiscussionPayload): Promise<DiscussionWithReplies> => {
    const res = await apiRequest<DiscussionResponse>(`/discussions/${id}`, {
      method: "PATCH",
      body: payload,
    });
    return res.data;
  },

  /** DELETE /discussions/{id} — author or admin only. */
  deleteDiscussion: (id: number) =>
    apiRequest<{ success: boolean }>(`/discussions/${id}`, { method: "DELETE" }),

  /** POST /discussions/{discussionId}/replies — 400s if the thread is locked. */
  postReply: async (discussionId: number, payload: CreateReplyPayload): Promise<DiscussionReply> => {
    const res = await apiRequest<ReplyResponse>(`/discussions/${discussionId}/replies`, {
      method: "POST",
      body: payload,
    });
    return res.data;
  },

  /** DELETE /discussions/{discussionId}/replies/{replyId} — author or admin only. */
  deleteReply: (discussionId: number, replyId: number) =>
    apiRequest<{ success: boolean }>(`/discussions/${discussionId}/replies/${replyId}`, {
      method: "DELETE",
    }),

  /** PATCH /discussions/{id}/pin — admin only. */
  pinDiscussion: async (id: number, payload: PinDiscussionPayload): Promise<Discussion> => {
    const res = await apiRequest<DiscussionResponse>(`/discussions/${id}/pin`, {
      method: "PATCH",
      body: payload,
    });
    return res.data;
  },

  /** PATCH /discussions/{id}/lock — admin only. */
  lockDiscussion: async (id: number, payload: LockDiscussionPayload): Promise<Discussion> => {
    const res = await apiRequest<DiscussionResponse>(`/discussions/${id}/lock`, {
      method: "PATCH",
      body: payload,
    });
    return res.data;
  },
};

