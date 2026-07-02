'use client';

import { useState } from 'react';
import { getComments, Comment } from '@/data/comments';
import styles from '@/styles/components/ChapterComments.module.css';

const PREVIEW_COUNT = 2;

interface Props {
  slug: string;
  chapterIndex: number;
}

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={styles.comment}>
      <div className={styles.avatar} aria-hidden="true">
        {comment.author[0].toUpperCase()}
      </div>
      <div className={styles.commentBody}>
        <div className={styles.commentMeta}>
          <span className={styles.author}>{comment.author}</span>
          <span className={styles.date}>{comment.timestamp}</span>
        </div>
        <p className={styles.text}>{comment.text}</p>
        <div className={styles.commentActions}>
          <span className={styles.likeBtn}>
            <span aria-hidden="true">♥</span>
            <span className="visually-hidden">likes </span>
            {comment.likes.toLocaleString()}
          </span>
          {hasReplies && (
            <button
              className={styles.replyToggle}
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
          <div className={styles.replies}>
            {comment.replies!.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
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
  const [error, setError] = useState('');

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
    if (!text) {
      setError('Please write a comment before posting.');
      return;
    }
    setError('');
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
    <div className={styles.zone}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span>
            {allComments.length === 0
              ? 'comments'
              : `${allComments.length} ${allComments.length === 1 ? 'comment' : 'comments'}`}
          </span>
        </div>

        {allComments.length === 0 ? (
          <p className={styles.emptyState}>· be the first to comment ·</p>
        ) : (
          <div>
            {visibleComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {!expanded && hiddenCount > 0 && (
          <button
            className={styles.showMore}
            onClick={() => setExpanded(true)}
          >
            Show {hiddenCount} more {hiddenCount === 1 ? 'comment' : 'comments'}
          </button>
        )}

        {expanded && allComments.length > PREVIEW_COUNT && (
          <button
            className={styles.showMore}
            onClick={() => setExpanded(false)}
          >
            Show less
          </button>
        )}

        {/* Add comment form — always visible */}
        <form className={styles.commentForm} onSubmit={handleSubmit}>
          {error && <p id="comment-error" role="alert" className={styles.formError}>{error}</p>}
          <textarea
            className={styles.commentInput}
            placeholder="Leave a comment..."
            value={commentText}
            onChange={(e) => { setCommentText(e.target.value); if (error) setError(''); }}
            rows={3}
            aria-label="Write a comment"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'comment-error' : undefined}
          />
          <button
            type="submit"
            className={styles.commentSubmit}
            disabled={!commentText.trim()}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
