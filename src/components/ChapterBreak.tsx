interface Props {
  chapterNumber: number;
}

export function ChapterBreak({ chapterNumber }: Props) {
  return (
    <div className="pt-[120px]" aria-hidden="true" />
  );
}
