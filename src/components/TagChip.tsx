import styles from '@/styles/components/TagChip.module.css';

export type TagCategory =
  | 'fandom'
  | 'relationship'
  | 'character'
  | 'additional'
  | 'warning'
  | 'category';

interface Props {
  tag: string;
  category: TagCategory;
  /** If true, renders as a filter link (adds underline on hover) */
  clickable?: boolean;
  href?: string;
}

export function TagChip({ tag, category, clickable, href }: Props) {
  const className = [
    styles.chip,
    styles[category],
    clickable ? styles.clickable : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (clickable && href) {
    return (
      <a href={href} className={className}>
        {tag}
      </a>
    );
  }

  return <span className={className}>{tag}</span>;
}
