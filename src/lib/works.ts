import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Work, WorkMeta, WorkSummary } from '@/types';
import { parseChapters } from './chapters';
import { resolveCover } from './covers';
// Re-export for Server Components that import utils via works
export { readingTime, formatWords } from './utils';

const WORKS_DIR = path.join(process.cwd(), 'content', 'works');

function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, '');
}

function normalizeWorkMeta(data: Record<string, unknown>): WorkMeta {
  return {
    title: String(data.title ?? 'Untitled'),
    author: String(data.author ?? 'Anonymous'),
    rating: String(data.rating ?? 'Not Rated'),
    warnings: Array.isArray(data.warnings) ? data.warnings.map(String) : [],
    category: Array.isArray(data.category) ? data.category.map(String) : [],
    fandom: Array.isArray(data.fandom) ? data.fandom.map(String) : [],
    relationships: Array.isArray(data.relationships) ? data.relationships.map(String) : [],
    characters: Array.isArray(data.characters) ? data.characters.map(String) : [],
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    summary: String(data.summary ?? ''),
    language: String(data.language ?? 'English'),
    status: String(data.status ?? 'Complete'),
    cover: data.cover != null ? String(data.cover) : undefined,
    // chapters: 0 is sentinel for "unknown total" (YAML null → 0)
    chapters: data.chapters == null ? 0 : Number(data.chapters),
    chaptersPosted: data.chaptersPosted != null ? Number(data.chaptersPosted) : undefined,
    series: data.series && typeof data.series === 'object' && !Array.isArray(data.series)
      ? {
          name: String((data.series as Record<string, unknown>).name ?? ''),
          position: Number((data.series as Record<string, unknown>).position ?? 1),
          total: (data.series as Record<string, unknown>).total != null
            ? Number((data.series as Record<string, unknown>).total)
            : undefined,
        }
      : undefined,
    words: Number(data.words ?? 0),
    published: String(data.published ?? ''),
    updated: String(data.updated ?? ''),
    kudos: Number(data.kudos ?? 0),
    bookmarks: Number(data.bookmarks ?? 0),
    hits: Number(data.hits ?? 0),
    comments: Number(data.comments ?? 0),
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(WORKS_DIR)) return [];
  return fs
    .readdirSync(WORKS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map(slugFromFilename);
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')      // headings
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')  // bold/italic
    .replace(/_([^_]+)_/g, '$1')      // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links
    .replace(/`[^`]+`/g, '')          // inline code
    .replace(/^\s*[-*+>]\s*/gm, '')   // list items, blockquotes
    .replace(/\n{2,}/g, ' ')         // multi-newlines → space
    .replace(/\s+/g, ' ')            // normalize whitespace
    .trim();
}

export function getWorkSummaries(): WorkSummary[] {
  const slugs = getAllSlugs();
  return slugs.map((slug) => {
    const filePath = path.join(WORKS_DIR, `${slug}.md`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Extract text chunks: split on :::chapter markers, strip markdown, take first 800 chars
    const textChunks = content
      .split(/:::chapter\s*/)
      .filter(Boolean)
      .map((section) => {
        const lines = section.split('\n');
        const chapterTitle = lines[0].trim();
        // Take body up to :::end-chapter
        const body = lines.slice(1).join('\n');
        const endIdx = body.indexOf(':::end-chapter');
        const chapterBody = endIdx >= 0 ? body.slice(0, endIdx) : body;
        // Strip DSL blocks (summary, notes)
        const stripped = stripMarkdown(
          chapterBody
            .replace(/:::summary[\s\S]*?:::end-summary/g, '')
            .replace(/:::notes-begin[\s\S]*?:::notes-end/g, '')
            .replace(/:::notes-bottom[\s\S]*?:::notes-bottom-end/g, '')
        );
        return {
          chapter: chapterTitle,
          text: stripped.slice(0, 3000),
        };
      })
      .filter((c) => c.text.length > 0);

    const meta = normalizeWorkMeta(data);
    meta.cover = resolveCover(meta.cover);

    return {
      slug,
      meta,
      textChunks: textChunks.length > 0 ? textChunks : undefined,
    };
  });
}

export function getWork(slug: string): Work | null {
  const filePath = path.join(WORKS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  const meta = normalizeWorkMeta(data);
  meta.cover = resolveCover(meta.cover);

  return {
    slug,
    meta,
    chapters: parseChapters(content),
  };
}
