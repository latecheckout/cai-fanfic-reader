import { Chapter } from '@/types';

/**
 * Parses the :::chapter DSL used in the skeleton's markdown files.
 *
 * Format:
 *   :::chapter Chapter Title
 *   :::summary ... :::end-summary
 *   :::notes-begin ... :::notes-end
 *   [body content]
 *   :::notes-bottom ... :::notes-bottom-end
 *   :::locked            (optional — chapter is paywalled)
 *   :::end-chapter
 */
export function parseChapters(rawContent: string): Chapter[] {
  const chapters: Chapter[] = [];

  // Split on :::chapter markers
  const chapterBlocks = rawContent.split(/:::chapter\s*/);

  // First element before any :::chapter is preamble — skip if empty
  for (let i = 1; i < chapterBlocks.length; i++) {
    const block = chapterBlocks[i];

    // Extract chapter title (first line before any newline)
    const firstNewline = block.indexOf('\n');
    const title = firstNewline >= 0
      ? block.slice(0, firstNewline).trim()
      : block.trim();

    const body = firstNewline >= 0 ? block.slice(firstNewline + 1) : '';

    // End of chapter
    const endChapterIdx = body.indexOf(':::end-chapter');
    const chapterBody = endChapterIdx >= 0 ? body.slice(0, endChapterIdx) : body;

    // Extract summary
    const summary = extractBlock(chapterBody, ':::summary', ':::end-summary');

    // Extract author notes (beginning)
    const notesBegin = extractBlock(chapterBody, ':::notes-begin', ':::notes-end');

    // Extract author notes (end)
    const notesEnd = extractBlock(chapterBody, ':::notes-bottom', ':::notes-bottom-end');

    // Locked marker — standalone line, presence flags the chapter as paywalled
    const locked = /^:::locked\s*$/m.test(chapterBody);

    // Extract main content — everything not in the special blocks
    let content = chapterBody;
    content = removeBlock(content, ':::summary', ':::end-summary');
    content = removeBlock(content, ':::notes-begin', ':::notes-end');
    content = removeBlock(content, ':::notes-bottom', ':::notes-bottom-end');
    content = content.replace(/^:::locked\s*$/m, '');
    content = content.trim();

    chapters.push({
      title,
      summary: summary || undefined,
      notesBegin: notesBegin || undefined,
      notesEnd: notesEnd || undefined,
      content,
      index: i - 1,
      locked: locked || undefined,
    });
  }

  // If no :::chapter markers found, treat the whole file as a single chapter
  if (chapters.length === 0 && rawContent.trim()) {
    chapters.push({
      title: 'Chapter 1',
      content: rawContent.trim(),
      index: 0,
    });
  }

  return chapters;
}

function extractBlock(text: string, startMarker: string, endMarker: string): string {
  const startIdx = text.indexOf(startMarker);
  if (startIdx < 0) return '';
  const afterStart = text.indexOf('\n', startIdx);
  if (afterStart < 0) return '';
  const endIdx = text.indexOf(endMarker, afterStart);
  if (endIdx < 0) return '';
  return text.slice(afterStart + 1, endIdx).trim();
}

function removeBlock(text: string, startMarker: string, endMarker: string): string {
  const startIdx = text.indexOf(startMarker);
  if (startIdx < 0) return text;
  const endIdx = text.indexOf(endMarker, startIdx);
  if (endIdx < 0) return text;
  return text.slice(0, startIdx) + text.slice(endIdx + endMarker.length);
}
