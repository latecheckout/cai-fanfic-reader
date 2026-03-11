export interface WorkMeta {
  title: string;
  author: string;
  rating: string;
  warnings: string[];
  category: string[];
  fandom: string[];
  relationships: string[];
  characters: string[];
  tags: string[];
  summary: string;
  language: string;
  status: string;
  chapters: number;
  chaptersPosted?: number;  // posted count for WIPs; if absent, assume all chapters posted
  series?: { name: string; position: number; total?: number };
  words: number;
  published: string;
  updated: string;
  kudos: number;
  bookmarks: number;
  hits: number;
  comments: number;
}

export interface Chapter {
  title: string;
  summary?: string;
  notesBegin?: string;
  notesEnd?: string;
  content: string; // raw markdown
  index: number;
}

export interface Work {
  meta: WorkMeta;
  chapters: Chapter[];
  slug: string;
}

export interface WorkSummary {
  meta: WorkMeta;
  slug: string;
}

export interface FilterState {
  fandom?: string;
  relationship?: string;
  tag?: string;
  character?: string;
  rating?: string;
  status?: string;
  warnings?: string;
  category?: string;
  language?: string;
  warning?: string;
  minWords?: number;
  maxWords?: number;
  sort?: 'updated' | 'published' | 'words' | 'kudos' | 'hits' | 'bookmarks' | 'comments';
  order?: 'asc' | 'desc';
  q?: string;
  // Exclude filters — remove works matching these values
  exFandom?: string;
  exRelationship?: string;
  exTag?: string;
  exCharacter?: string;
  exRating?: string;
  exStatus?: string;
  exCategory?: string;
  exWarning?: string;
}
