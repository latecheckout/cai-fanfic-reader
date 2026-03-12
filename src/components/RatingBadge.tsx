import styles from '@/styles/components/RatingBadge.module.css';

interface Props {
  rating: string;
}

// Map canonical rating values to display abbreviations
const RATING_MAP: Record<string, string> = {
  'General Audiences': 'G',
  'Teen And Up Audiences': 'T',
  'Mature': 'M',
  'Explicit': 'E',
  'Not Rated': 'NR',
};

// Map canonical rating values to CSS class names
const RATING_CLASS: Record<string, string> = {
  'General Audiences': 'ratingG',
  'Teen And Up Audiences': 'ratingT',
  'Mature': 'ratingM',
  'Explicit': 'ratingE',
  'Not Rated': 'ratingNR',
};

export function RatingBadge({ rating }: Props) {
  const label = RATING_MAP[rating] ?? rating.slice(0, 2).toUpperCase();
  const cls = RATING_CLASS[rating] ?? 'ratingNR';
  return (
    <span
      className={`${styles.badge} ${styles[cls as keyof typeof styles] ?? ''}`}
      data-tooltip={rating}
      aria-label={`Rating: ${rating}`}
    >
      {label}
    </span>
  );
}
