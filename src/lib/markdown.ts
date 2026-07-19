import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

// Built once at module scope — frozen unified processors are reusable, and
// rebuilding the five-plugin pipeline per chapter was pure waste at build time.
const processor = remark()
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize)
  .use(rehypeStringify)
  .freeze();

/**
 * Converts a markdown string to sanitized HTML using the remark/rehype pipeline.
 * Runs server-side only.
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await processor.process(markdown);
  return result.toString();
}
