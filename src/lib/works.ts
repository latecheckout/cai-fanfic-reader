import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Work, WorkMeta, WorkSummary } from '@/types';
import { parseChapters } from './chapters';
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
    chapters: Number(data.chapters ?? 1),
    words: Number(data.words ?? 0),
    published: String(data.published ?? ''),
    updated: String(data.updated ?? ''),
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(WORKS_DIR)) return [];
  return fs
    .readdirSync(WORKS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map(slugFromFilename);
}

export function getWorkSummaries(): WorkSummary[] {
  const slugs = getAllSlugs();
  return slugs.map((slug) => {
    const filePath = path.join(WORKS_DIR, `${slug}.md`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    return {
      slug,
      meta: normalizeWorkMeta(data),
    };
  });
}

export function getWork(slug: string): Work | null {
  const filePath = path.join(WORKS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    slug,
    meta: normalizeWorkMeta(data),
    chapters: parseChapters(content),
  };
}
