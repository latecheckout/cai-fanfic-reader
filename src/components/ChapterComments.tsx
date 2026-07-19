'use client';

import { useState } from 'react';
import { getComments, Comment } from '@/data/comments';
import { HeartIcon } from './icons';

const PREVIEW_COUNT = 2;

// Underlined text-link button (reply toggle, show more/less). Call sites add
// their own opacity pair + spacing.
const TEXT_LINK_BTN =
  'cursor-pointer border-none bg-transparent p-0 font-mono text-[11px] text-secondary underline transition-opacity duration-[120ms] [transition-timing-function:ease] [text-underline-offset:2px]';

interface Props {
  slug: string;
  chapterIndex: number;
}

function CommentItem({ comment }: { comment: Comment }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="flex gap-3 py-3 [&_+_&]:border-t [&_+_&]:border-border">
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--text)_10%,transparent)] font-mono text-[10px] text-secondary"
        aria-hidden="true"
      >
        {comment.author[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-sans text-xs font-semibold text-text">{comment.author}</span>
          <span className="font-mono text-[10px] text-secondary">{comment.timestamp}</span>
        </div>
        <p className="font-sans text-[13px] leading-[1.55] text-text opacity-85">{comment.text}</p>
        <div className="mt-2 flex items-center gap-3">
          {/* Display-only like count — no handler yet (@WIRE), so no
              interactive affordances (cursor/hover) that promise one. */}
          <span className="flex items-center gap-1 p-0 font-mono text-[11px] text-secondary">
            <HeartIcon width={11} height={11} className="shrink-0" />
            {comment.likes.toLocaleString()}
            <span className="visually-hidden">likes</span>
          </span>
          {hasReplies && (
            <button
              className={`${TEXT_LINK_BTN} hover:text-text`}
              onClick={() => setRepliesOpen((o) => !o)}
              aria-expanded={repliesOpen}
            >
              {repliesOpen
                ? 'Hide replies'
                : `${comment.replies!.length} ${comment.replies!.length === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
        </div>
        {hasReplies && repliesOpen && (
          <div className="mt-2 ml-[calc(28px+var(--space-3))] border-l-2 border-border pl-3">
            {comment.replies!.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChapterComments({ slug, chapterIndex }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  // @WIRE — Replace getComments() with: GET /works/:slug/comments?chapter=:chapterIndex
  //         Add useEffect + fetch, loading skeleton, and error state.
  //         localComments can merge with API response on submit.
  //         See: .claude/docs/wiring-guide.md#3-comments
  const seededComments = getComments(slug, chapterIndex);
  const allComments = [...seededComments, ...localComments];
  const visibleComments = expanded ? allComments : allComments.slice(0, PREVIEW_COUNT);
  const hiddenCount = allComments.length - PREVIEW_COUNT;

  // @WIRE  — Wire handleSubmit to: POST /works/:slug/comments
  // @AUTH  — Requires authentication. Show login prompt if no session.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    const newComment: Comment = {
      id: `local-${Date.now()}`,
      author: 'you',
      text,
      timestamp: 'just now',
      likes: 0,
    };
    setLocalComments((prev) => [...prev, newComment]);
    setCommentText('');
    if (!expanded && allComments.length >= PREVIEW_COUNT) {
      setExpanded(true);
    }
  }

  return (
    <div className="mt-6 w-screen bg-[color-mix(in_srgb,var(--text)_3.5%,var(--bg))] pt-10 pb-16 [margin-inline:calc(50%-50vw)]">
      <div className="mx-auto max-w-[var(--reader-line-width)] px-6">
        <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.12em] text-secondary" aria-live="polite">
          <span>
            {allComments.length === 0
              ? 'comments'
              : `${allComments.length} ${allComments.length === 1 ? 'comment' : 'comments'}`}
          </span>
        </div>

        {allComments.length === 0 ? (
          <p className="pt-7 pb-3 text-center font-mono text-[11px] tracking-[0.08em] text-secondary">· be the first to comment ·</p>
        ) : (
          <div>
            {visibleComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {!expanded && hiddenCount > 0 && (
          <button
            className={`${TEXT_LINK_BTN} pt-3 hover:text-text`}
            onClick={() => setExpanded(true)}
          >
            Show {hiddenCount} more {hiddenCount === 1 ? 'comment' : 'comments'}
          </button>
        )}

        {expanded && allComments.length > PREVIEW_COUNT && (
          <button
            className={`${TEXT_LINK_BTN} pt-3 hover:text-text`}
            onClick={() => setExpanded(false)}
          >
            Show less
          </button>
        )}

        {/* Add comment form — always visible */}
        {/* @TODO-DEV — When wiring to a real API, add a submission error state and
            announce it via role="alert" so screen readers pick it up:
            {error && <p role="alert">{error}</p>} */}
        <form className="mt-10 flex flex-col gap-3" onSubmit={handleSubmit}>
          <textarea
            className="box-border min-h-[80px] w-full resize-none rounded-2xl border border-border bg-bg px-4 py-[14px] font-sans text-[13px] leading-[1.6] text-text transition-[border-color] duration-150 [transition-timing-function:ease] placeholder:text-secondary placeholder:opacity-50 focus:border-border-strong focus:outline-none"
            placeholder="Leave a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            aria-label="Write a comment"
          />
          <button
            type="submit"
            className="cursor-pointer self-end rounded-full border border-border-strong bg-none px-5 py-2 font-mono text-[11px] tracking-[0.06em] text-text opacity-70 transition-[opacity,background] duration-[120ms] [transition-timing-function:ease] hover:bg-[color-mix(in_srgb,var(--text)_5%,transparent)] hover:opacity-100 disabled:cursor-default disabled:opacity-30"
            disabled={!commentText.trim()}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
