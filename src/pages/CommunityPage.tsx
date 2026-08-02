import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Pin, Lock, Unlock, ArrowLeft, Send, Trash2,
  Plus, MoreVertical, Loader2,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "../components/ui/DropdownMenu";
import { discussionService } from "../services/discussionService";
import { getUser } from "../services/tokenService";
import type { Discussion, DiscussionWithReplies } from "../services/types/discussion.types";

type View = { type: "list" } | { type: "thread"; id: number } | { type: "new" };

const PAGE_SIZE = 20;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function CommunityPage() {
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [view, setView] = useState<View>({ type: "list" });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-6 py-10">
          {view.type === "list" && (
            <DiscussionListView
              isAdmin={isAdmin}
              onOpenThread={(id) => setView({ type: "thread", id })}
              onNewDiscussion={() => setView({ type: "new" })}
            />
          )}
          {view.type === "new" && (
            <NewDiscussionView
              onCancel={() => setView({ type: "list" })}
              onCreated={(id) => setView({ type: "thread", id })}
            />
          )}
          {view.type === "thread" && (
            <ThreadView
              discussionId={view.id}
              isAdmin={isAdmin}
              currentUserId={user?.id}
              onBack={() => setView({ type: "list" })}
              onDeleted={() => setView({ type: "list" })}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// List view
// ────────────────────────────────────────────────────────────

function DiscussionListView({
  isAdmin,
  onOpenThread,
  onNewDiscussion,
}: {
  isAdmin: boolean;
  onOpenThread: (id: number) => void;
  onNewDiscussion: () => void;
}) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (pageNum: number, replace: boolean) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);
    setError(false);
    try {
      const data = await discussionService.listDiscussions({ page: pageNum, limit: PAGE_SIZE });
      setDiscussions((prev) => (replace ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageNum);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(1, true);
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-800 font-headline text-tertiary-500 tracking-tight">
            Community
          </h1>
          <p className="text-sm font-body text-neutral-600 mt-1">
            Ask questions, share ideas, and hear from fellow school leaders.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={onNewDiscussion}>
          <Plus size={16} /> New discussion
        </Button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={28} className="animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500 font-body">Loading discussions...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-sm font-600 text-red-600 mb-3">Couldn't load discussions.</p>
          <Button variant="outlined" size="sm" onClick={() => load(1, true)}>Retry</Button>
        </div>
      )}

      {!loading && !error && discussions.length === 0 && (
        <div className="text-center py-20 bg-white border border-neutral-200 rounded-xl">
          <MessageSquare size={36} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-sm font-600 text-neutral-600 mb-1">No discussions yet</p>
          <p className="text-xs text-neutral-400 mb-4">Be the first to start a conversation.</p>
          <Button variant="primary" size="sm" onClick={onNewDiscussion}>Start a discussion</Button>
        </div>
      )}

      {!loading && !error && discussions.length > 0 && (
        <div className="flex flex-col gap-3">
          {discussions.map((d) => (
            <button
              key={d.id}
              onClick={() => onOpenThread(d.id)}
              className="text-left bg-white border border-neutral-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-sm transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {d.isPinned && <Badge color="dark"><Pin size={10} className="inline mr-1" />Pinned</Badge>}
                    {d.isLocked && <Badge color="neutral"><Lock size={10} className="inline mr-1" />Locked</Badge>}
                  </div>
                  <h3 className="text-[15px] font-700 font-headline text-tertiary-500 truncate">
                    {d.title}
                  </h3>
                  <p className="text-[13px] text-neutral-500 font-body mt-1 line-clamp-2">
                    {d.body}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1 text-neutral-400 text-xs font-600">
                    <MessageSquare size={13} /> {d.replyCount ?? 0}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-body mt-3">
                <span className="font-600 text-neutral-600">{d.author?.fullName || "Unknown"}</span>
                <span>•</span>
                <span>{timeAgo(d.createdAt)}</span>
              </div>
            </button>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outlined" size="sm" disabled={loadingMore} onClick={() => load(page + 1, false)}>
                {loadingMore ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// New discussion form
// ────────────────────────────────────────────────────────────

function NewDiscussionView({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (id: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Please add both a title and a message.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await discussionService.createDiscussion({ title: title.trim(), body: body.trim() });
      onCreated(created.id);
    } catch (err) {
      setError((err as { message?: string })?.message || "Couldn't post your discussion. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm font-600 text-neutral-600 hover:text-primary-500 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to discussions
      </button>

      <h1 className="text-2xl font-800 font-headline text-tertiary-500 tracking-tight mb-6">
        Start a discussion
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5 font-body">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-700 text-neutral-800 block font-body">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question or topic?"
            className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body outline-none rounded-sm px-4 py-3"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-700 text-neutral-800 block font-body">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share the details..."
            rows={6}
            className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body outline-none rounded-sm px-4 py-3 resize-none"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" size="md" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Posting..." : "Post discussion"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Thread view
// ────────────────────────────────────────────────────────────

function ThreadView({
  discussionId,
  isAdmin,
  currentUserId,
  onBack,
  onDeleted,
}: {
  discussionId: number;
  isAdmin: boolean;
  currentUserId?: string;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const [discussion, setDiscussion] = useState<DiscussionWithReplies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await discussionService.getDiscussion(discussionId);
      setDiscussion(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [discussionId]);

  useEffect(() => {
    load();
  }, [load]);

  const canManage = (authorId?: number) =>
    isAdmin || (currentUserId != null && String(authorId) === String(currentUserId));

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setPosting(true);
    setReplyError(null);
    try {
      await discussionService.postReply(discussionId, { body: replyBody.trim() });
      setReplyBody("");
      await load();
    } catch (err) {
      setReplyError((err as { message?: string })?.message || "Couldn't post your reply.");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    setBusyAction(true);
    try {
      await discussionService.deleteReply(discussionId, replyId);
      await load();
    } catch {
      // swallow — thread stays as-is, user can retry
    } finally {
      setBusyAction(false);
    }
  };

  const handleTogglePin = async () => {
    if (!discussion) return;
    setBusyAction(true);
    try {
      const updated = await discussionService.pinDiscussion(discussionId, { isPinned: !discussion.isPinned });
      setDiscussion((prev) => (prev ? { ...prev, isPinned: updated.isPinned } : prev));
    } finally {
      setBusyAction(false);
    }
  };

  const handleToggleLock = async () => {
    if (!discussion) return;
    setBusyAction(true);
    try {
      const updated = await discussionService.lockDiscussion(discussionId, { isLocked: !discussion.isLocked });
      setDiscussion((prev) => (prev ? { ...prev, isLocked: updated.isLocked } : prev));
    } finally {
      setBusyAction(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    setBusyAction(true);
    try {
      await discussionService.deleteDiscussion(discussionId);
      onDeleted();
    } catch {
      setBusyAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="animate-spin text-primary-500" />
        <p className="text-sm text-neutral-500 font-body">Loading discussion...</p>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-600 text-red-600 mb-3">Couldn't load this discussion.</p>
        <Button variant="outlined" size="sm" onClick={onBack}>Back to discussions</Button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-600 text-neutral-600 hover:text-primary-500 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to discussions
      </button>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {discussion.isPinned && <Badge color="dark"><Pin size={10} className="inline mr-1" />Pinned</Badge>}
            {discussion.isLocked && <Badge color="neutral"><Lock size={10} className="inline mr-1" />Locked</Badge>}
          </div>

          {canManage(discussion.author?.id) && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreVertical size={18} className="text-neutral-400 hover:text-neutral-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem onClick={handleTogglePin}>
                    <span className="flex items-center gap-2">
                      <Pin size={14} /> {discussion.isPinned ? "Unpin" : "Pin"} discussion
                    </span>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={handleToggleLock}>
                    <span className="flex items-center gap-2">
                      {discussion.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                      {discussion.isLocked ? "Unlock" : "Lock"} discussion
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDeleteDiscussion}>
                  <span className="flex items-center gap-2 text-red-600">
                    <Trash2 size={14} /> Delete discussion
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <h1 className="text-xl font-800 font-headline text-tertiary-500 tracking-tight mb-2">
          {discussion.title}
        </h1>
        <p className="text-sm text-neutral-700 font-body leading-relaxed whitespace-pre-wrap mb-4">
          {discussion.body}
        </p>
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-body">
          <span className="font-600 text-neutral-600">{discussion.author?.fullName || "Unknown"}</span>
          <span>•</span>
          <span>{timeAgo(discussion.createdAt)}</span>
        </div>
      </div>

      <h2 className="text-sm font-700 text-neutral-700 font-body mb-3">
        {(discussion.replies ?? []).length} {(discussion.replies ?? []).length === 1 ? "Reply" : "Replies"}
      </h2>

      <div className="flex flex-col gap-3 mb-6">
        {(discussion.replies ?? []).map((r) => (
          <div key={r.id} className="bg-white border border-neutral-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-neutral-700 font-body leading-relaxed whitespace-pre-wrap flex-1">
                {r.body}
              </p>
              {canManage(r.author?.id) && (
                <button
                  onClick={() => handleDeleteReply(r.id)}
                  disabled={busyAction}
                  aria-label="Delete reply"
                  className="text-neutral-300 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-body mt-2">
              <span className="font-600 text-neutral-600">{r.author?.fullName || "Unknown"}</span>
              <span>•</span>
              <span>{timeAgo(r.createdAt)}</span>
            </div>
          </div>
        ))}
        {(discussion.replies ?? []).length === 0 && (
          <p className="text-sm text-neutral-400 font-body text-center py-6">
            No replies yet — be the first to respond.
          </p>
        )}
      </div>

      {discussion.isLocked ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500 font-body bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-3">
          <Lock size={15} /> This discussion is locked. New replies aren't allowed.
        </div>
      ) : (
        <form onSubmit={handleReply} className="flex flex-col gap-3">
          {replyError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 font-body">
              {replyError}
            </div>
          )}
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body outline-none rounded-sm px-4 py-3 resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" disabled={posting || !replyBody.trim()}>
              <Send size={14} /> {posting ? "Posting..." : "Reply"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
