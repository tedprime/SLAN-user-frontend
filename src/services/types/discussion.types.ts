// NOTE: the full Discussion/Reply schema wasn't visible in the Swagger
// screenshot (only SuccessResponse/ErrorResponse/UserPayload/AuthTokens
// were expanded). These shapes are inferred from the example request
// bodies and standard REST conventions — adjust field names here if the
// real API differs, everything else keys off this one file.

export interface DiscussionAuthor {
  id: number;
  fullName: string;
}

export interface DiscussionReply {
  id: number;
  body: string;
  author: DiscussionAuthor;
  createdAt: string;
}

export interface Discussion {
  id: number;
  title: string;
  body: string;
  unitId: number | null;
  moduleId: number | null;
  author: DiscussionAuthor;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionWithReplies extends Discussion {
  replies: DiscussionReply[];
}

export interface DiscussionListResponse {
  success: boolean;
  data: Discussion[];
}

export interface DiscussionResponse {
  success: boolean;
  data: DiscussionWithReplies;
}

export interface ReplyResponse {
  success: boolean;
  data: DiscussionReply;
}

// ── Requests ───────────────────────────────────────────────
export interface ListDiscussionsParams {
  unitId?: number;
  moduleId?: number;
  page?: number;
  limit?: number;
}

export interface CreateDiscussionPayload {
  title: string;
  body: string;
  unitId?: number;
  moduleId?: number;
}

export interface UpdateDiscussionPayload {
  title?: string;
  body?: string;
}

export interface CreateReplyPayload {
  body: string;
}

export interface PinDiscussionPayload {
  isPinned: boolean;
}

export interface LockDiscussionPayload {
  isLocked: boolean;
}
