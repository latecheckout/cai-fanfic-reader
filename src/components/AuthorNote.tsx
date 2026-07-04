import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CREATOR_PLACEHOLDER = '/creators/placeholder.png';

/**
 * Author's note as a received-style iMessage bubble: username label on the top
 * left, the bubble indented to leave a left gutter, the profile picture just
 * outside the bubble's bottom-left corner (~6px away), and two thought-bubble
 * circles trailing off the bottom-left corner toward the avatar.
 */
export function AuthorNote({
  author,
  children,
  className = '',
}: {
  author?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside className={`flex flex-col gap-1.5 ${className}`}>
      {/* Username — aligned with the bubble's left edge */}
      <span className="pl-[38px] font-sans text-[12px] font-medium text-text">
        {author ? (
          <Link
            href={`/?q=${encodeURIComponent(author)}`}
            className="hover:underline hover:underline-offset-2"
          >
            {author}
          </Link>
        ) : (
          'Author'
        )}
      </span>

      {/* Left gutter holds the avatar; the bubble fills the rest (30px avatar + 8px gap) */}
      <div className="relative pl-[38px]">
        <div className="relative rounded-[20px] bg-author-bubble px-5 py-4">
          <p className="font-sans text-[15px] leading-[1.6] text-author-bubble-fg">{children}</p>
          {/* Thought-bubble circles — trailing off the bottom-left corner */}
          <span
            className="absolute bottom-0 left-0 h-6 w-6 translate-x-[calc(-50%+10px)] translate-y-[calc(50%-10px)] rounded-full bg-author-bubble"
            aria-hidden="true"
          />
          <span
            className="absolute bottom-0 left-0 h-2 w-2 translate-x-[calc(-50%-3px)] translate-y-[calc(50%+3px)] rounded-full bg-author-bubble"
            aria-hidden="true"
          />
        </div>
        {/* Profile picture — bottom-left, outside the bubble (~6px gutter) */}
        <span className="absolute bottom-0 left-0 block h-[30px] w-[30px] overflow-hidden rounded-full bg-border">
          <Image src={CREATOR_PLACEHOLDER} alt="" fill sizes="30px" className="object-cover" />
        </span>
      </div>
    </aside>
  );
}
