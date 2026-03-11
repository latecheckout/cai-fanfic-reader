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
    <div className={`${styles.comment} ${depth > 0 ? styles.reply : ''}`}>
      <div className={styles.commentAvatar} aria-hidden="true">
        {comment.author[0].toUpperCase()}
      </div>
      <div className={styles.commentBody}>
        <div className={styles.commentMeta}>
          <span className={styles.commentAuthor}>{comment.author}</span>
          {comment.isAuthor && (
            <span className={styles.authorBadge}>Author</span>
          )}
          <span className={styles.commentDate}>{comment.timestamp}</span>
        </div>
        <p className={styles.commentText}>{comment.text}</p>
        <div className={styles.commentActions}>
          <span className={styles.commentLikes}>♥ {comment.likes.toLocaleString()}</span>
          {hasReplies && (
            <button
              className={styles.repliesToggle}
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
          <div className={styles.repliesContainer}>
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
  const allComments = getComments(slug, chapterIndex);

  // No comments for this chapter — render nothing
  if (allComments.length === 0) return null;

  const visibleComments = expanded ? allComments : allComments.slice(0, PREVIEW_COUNT);
  const hiddenCount = allComments.length - PREVIEW_COUNT;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>
          {allComments.length} {allComments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      <div className={styles.commentList}>
        {visibleComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

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
    </div>
  );
}
