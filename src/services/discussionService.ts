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

// The exact response wrapper wasn't confirmed against the live API, so this
// tolerates a couple of shapes instead of assuming { success, data }:
// - { success, data: [...] }
// - { data: [...] }
// - [...] directly
function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  const data = (res as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as T[];
  return [];
}

function unwrapItem<T>(res: unknown): T | null {
  const data = (res as { data?: unknown })?.data;
  if (data && typeof data === "object") return data as T;
  if (res && typeof res === "object" && !("success" in (res as object))) return res as T;
  return null;
}

function normalizeDiscussion(raw: unknown): Discussion {
  const d = (raw ?? {}) as Partial<Discussion>;
  return {
    id: d.id ?? 0,
    title: d.title ?? "",
    body: d.body ?? "",
    unitId: d.unitId ?? null,
    moduleId: d.moduleId ?? null,
    author: d.author ?? { id: 0, fullName: "Unknown" },
    replyCount: d.replyCount ?? 0,
    isPinned: d.isPinned ?? false,
    isLocked: d.isLocked ?? false,
    createdAt: d.createdAt ?? new Date().toISOString(),
    updatedAt: d.updatedAt ?? d.createdAt ?? new Date().toISOString(),
  };
}

function normalizeThread(raw: unknown): DiscussionWithReplies {
  const base = normalizeDiscussion(raw);
  const replies = (raw as { replies?: unknown })?.replies;
  return {
    ...base,
    replies: Array.isArray(replies) ? (replies as DiscussionReply[]) : [],
  };
}

function normalizeReply(raw: unknown): DiscussionReply {
  const r = (raw ?? {}) as Partial<DiscussionReply>;
  return {
    id: r.id ?? 0,
    body: r.body ?? "",
    author: r.author ?? { id: 0, fullName: "Unknown" },
    createdAt: r.createdAt ?? new Date().toISOString(),
  };
}

export const discussionService = {
  /** GET /discussions — filterable by unitId/moduleId, paginated, pinned-first. */
  listDiscussions: async (params: ListDiscussionsParams = {}): Promise<Discussion[]> => {
    const res = await apiRequest<DiscussionListResponse>(`/discussions?${buildQuery(params)}`);
    return unwrapList<unknown>(res).map(normalizeDiscussion);
  },

  /** POST /discussions — starts a new thread. */
  createDiscussion: async (payload: CreateDiscussionPayload): Promise<DiscussionWithReplies> => {
    const res = await apiRequest<DiscussionResponse>("/discussions", {
      method: "POST",
      body: payload,
    });
    return normalizeThread(unwrapItem(res));
  },

  /** GET /discussions/{id} — thread with all replies. */
  getDiscussion: async (id: number): Promise<DiscussionWithReplies> => {
    const res = await apiRequest<DiscussionResponse>(`/discussions/${id}`);
    return normalizeThread(unwrapItem(res));
  },

  /** PATCH /discussions/{id} — author or admin only. */
  updateDiscussion: async (id: number, payload: UpdateDiscussionPayload): Promise<DiscussionWithReplies> => {
    const res = await apiRequest<DiscussionResponse>(`/discussions/${id}`, {
      method: "PATCH",
      body: payload,
    });
    return normalizeThread(unwrapItem(res));
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
    return normalizeReply(unwrapItem(res));
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
    return normalizeDiscussion(unwrapItem(res));
  },

  /** PATCH /discussions/{id}/lock — admin only. */
  lockDiscussion: async (id: number, payload: LockDiscussionPayload): Promise<Discussion> => {
    const res = await apiRequest<DiscussionResponse>(`/discussions/${id}/lock`, {
      method: "PATCH",
      body: payload,
    });
    return normalizeDiscussion(unwrapItem(res));
  },
};
