import { WorkSummary } from '@/types';
import { WorkCardCover } from './WorkCardCover';
import { WorkCardGrid } from './WorkCardGrid';

interface Props {
  slug: string;
  recommendations: WorkSummary[];
}

export function EndOfStory({ recommendations }: Props) {
  return (
    <div className="mx-auto max-w-[var(--reader-line-width)] px-6">
      {/* Recommendations — respect the site-wide mode (html[data-mode]): visual
          shows the image grid card, text shows the list card. Both are rendered
          and CSS picks one, so this stays a server component. */}
      {recommendations.length > 0 && (
        <div className="mt-[60px] grid grid-cols-2 gap-4 border-t border-border pt-6 [html[data-mode=text]_&]:flex [html[data-mode=text]_&]:flex-col">
          {recommendations.map((work) => (
            <div key={work.slug}>
              <div className="[html[data-mode=text]_&]:hidden">
                <WorkCardGrid work={work} />
              </div>
              <div className="hidden [html[data-mode=text]_&]:block">
                <WorkCardCover work={work} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom padding */}
      <div className="h-[120px]" />
    </div>
  );
}
