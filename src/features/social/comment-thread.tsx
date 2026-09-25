"use client";

import { Flag, MessageCircle, MoreHorizontal, Pencil, Reply, Trash2 } from "lucide-react";
import * as React from "react";

import { EmptyState, ErrorState } from "@/components/patterns/states";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import type { Comment } from "@/data/schema/social";
import { getSocial } from "@/data/social";
import { formatRelative } from "@/lib/format";
import { cn, initials } from "@/lib/utils";

import { reportSocialError, useSocial } from "./provider";

const MAX = 2000;

type Pending = Comment & { pending?: boolean };

function Composer({
  id,
  placeholder,
  initial = "",
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  id: string;
  placeholder: string;
  initial?: string;
  submitLabel: string;
  onSubmit: (body: string) => Promise<boolean>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [body, setBody] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);
  const trimmed = body.trim();

  return (
    <form
      className="grid gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!trimmed) return;
        setBusy(true);
        const ok = await onSubmit(trimmed);
        setBusy(false);
        if (ok) setBody("");
      }}
    >
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <Textarea
        id={id}
        rows={2}
        value={body}
        maxLength={MAX}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
        }}
        className="min-h-20"
      />
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-xs tabular",
            body.length > MAX - 100 ? "text-warning" : "text-subtle-foreground",
          )}
        >
          {body.length > MAX - 300 ? `${MAX - body.length} characters left` : ""}
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" loading={busy} disabled={!trimmed}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  replies,
  onReply,
  onChanged,
}: {
  comment: Pending;
  replies: Pending[];
  onReply?: (parentId: string, body: string) => Promise<boolean>;
  onChanged: () => void;
}) {
  const { member, requestSignIn } = useSocial();
  const [replying, setReplying] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const mine = member?.id === comment.authorId;

  return (
    <li className={cn("grid gap-2", comment.pending && "opacity-60")}>
      <div className="flex gap-3">
        <span
          aria-hidden
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs font-bold text-muted-foreground"
        >
          {initials(comment.authorName)}
        </span>
        <div className="grid min-w-0 flex-1 gap-1">
          <div className="rounded-card bg-surface-muted px-3.5 py-2.5">
            <p className="text-sm font-semibold">
              {comment.authorName}
              <span className="ml-2 text-xs font-normal text-subtle-foreground">
                {comment.pending ? (
                  "Posting…"
                ) : (
                  <time dateTime={comment.createdAt}>{formatRelative(comment.createdAt)}</time>
                )}
                {comment.editedAt && " · edited"}
              </span>
            </p>
            {editing ? (
              <div className="mt-2">
                <Composer
                  id={`edit-${comment.id}`}
                  placeholder="Edit your comment"
                  initial={comment.body}
                  submitLabel="Save"
                  autoFocus
                  onCancel={() => setEditing(false)}
                  onSubmit={async (body) => {
                    try {
                      await getSocial().editComment(comment.id, body);
                      setEditing(false);
                      onChanged();
                      return true;
                    } catch (error) {
                      reportSocialError(error);
                      return false;
                    }
                  }}
                />
              </div>
            ) : (
              <p className="mt-0.5 text-sm leading-6 whitespace-pre-line text-foreground">{comment.body}</p>
            )}
          </div>
          {!comment.pending && !editing && (
            <div className="flex items-center gap-1 pl-1">
              {onReply && (
                <button
                  type="button"
                  className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-control px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => (member ? setReplying((r) => !r) : requestSignIn("Sign in to reply."))}
                >
                  <Reply aria-hidden className="size-3.5" /> Reply
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded-control text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  aria-label={`More actions for ${comment.authorName}'s comment`}
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {mine ? (
                    <>
                      <DropdownMenuItem onSelect={() => setEditing(true)}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={async () => {
                          try {
                            await getSocial().deleteComment(comment.id);
                            toast.success("Comment deleted");
                            onChanged();
                          } catch (error) {
                            reportSocialError(error);
                          }
                        }}
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onSelect={async () => {
                        if (!member) return requestSignIn("Sign in to report a comment.");
                        try {
                          await getSocial().report({ commentId: comment.id }, "abuse");
                          toast.success("Thanks. The media team will review this comment.");
                        } catch (error) {
                          reportSocialError(error);
                        }
                      }}
                    >
                      <Flag /> Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {replying && onReply && (
            <Composer
              id={`reply-${comment.id}`}
              placeholder={`Reply to ${comment.authorName}`}
              submitLabel="Reply"
              autoFocus
              onCancel={() => setReplying(false)}
              onSubmit={async (body) => {
                const ok = await onReply(comment.id, body);
                if (ok) setReplying(false);
                return ok;
              }}
            />
          )}
          {replies.length > 0 && (
            <ul className="mt-2 grid gap-3 border-l-2 border-border pl-4">
              {replies.map((r) => (
                <CommentItem key={r.id} comment={r} replies={[]} onChanged={onChanged} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

/** Threaded comments (one level of replies) with optimistic posting. */
export function CommentThread({ postId, title }: { postId: string; title: string }) {
  const { member, requestSignIn } = useSocial();
  const [comments, setComments] = React.useState<Pending[] | null>(null);
  const [failed, setFailed] = React.useState(false);

  const load = React.useCallback(async () => {
    setFailed(false);
    try {
      setComments(await getSocial().listComments(postId));
    } catch {
      setFailed(true);
    }
  }, [postId]);

  React.useEffect(() => {
    let active = true;
    getSocial()
      .listComments(postId)
      .then(
        (list) => active && setComments(list),
        () => active && setFailed(true),
      );
    return () => {
      active = false;
    };
  }, [postId, member]);

  const add = async (body: string, parentId: string | null = null) => {
    if (!member) {
      requestSignIn("Sign in to join the conversation.");
      return false;
    }
    const temp: Pending = {
      id: `pending-${Date.now()}`,
      postId,
      parentId,
      authorId: member.id,
      authorName: member.displayName,
      body,
      createdAt: new Date().toISOString(),
      editedAt: null,
      pending: true,
    };
    setComments((c) => [...(c ?? []), temp]);
    try {
      await getSocial().addComment(postId, body, parentId);
      await load();
      return true;
    } catch (error) {
      setComments((c) => (c ?? []).filter((x) => x.id !== temp.id));
      reportSocialError(error, "Your comment wasn't posted. Please try again.");
      return false;
    }
  };

  const top = (comments ?? []).filter((c) => !c.parentId);
  const repliesOf = (id: string) => (comments ?? []).filter((c) => c.parentId === id);

  return (
    <section aria-labelledby="comments-heading" className="grid gap-5">
      <h2 id="comments-heading" className="font-display text-xl font-extrabold">
        Comments
        {comments && comments.length > 0 && (
          <span className="ml-2 text-muted-foreground tabular">{comments.length}</span>
        )}
      </h2>

      {member ? (
        <Composer
          id={`comment-${postId}`}
          placeholder={`Add a comment on “${title}”`}
          submitLabel="Post"
          onSubmit={(b) => add(b)}
        />
      ) : (
        <button
          type="button"
          onClick={() => requestSignIn("Sign in to join the conversation.")}
          className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-card border border-border bg-surface px-4 text-left text-sm text-muted-foreground hover:border-border-strong"
        >
          <MessageCircle aria-hidden className="size-5" /> Sign in to add a comment
        </button>
      )}

      {failed ? (
        <ErrorState onRetry={load}>We couldn&apos;t load the comments.</ErrorState>
      ) : comments === null ? (
        <div className="grid gap-4" aria-busy="true" aria-label="Loading comments">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-16 flex-1 rounded-card" />
            </div>
          ))}
        </div>
      ) : top.length === 0 ? (
        <EmptyState compact title="No comments yet">
          Be the first to share a word of encouragement.
        </EmptyState>
      ) : (
        <ul className="grid gap-5">
          {top.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesOf(c.id)}
              onReply={(pid, body) => add(body, pid)}
              onChanged={load}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
