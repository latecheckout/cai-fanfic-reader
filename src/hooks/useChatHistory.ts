'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_HISTORY_KEY } from '@/lib/constants';

export interface ChatMessage {
  id: string;
  role: 'user' | 'character';
  text: string;
  /** Highlighted excerpt that seeded the message (user messages only). */
  quote?: { text: string; chapterIndex: number };
}

export interface Conversation {
  id: string;
  characterId: string;
  /** Frozen at creation so history rows keep their name across works. */
  characterName: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

/** Short topic (1–2 words) from the first user message, ChatGPT-recents style.
    Seeded conversations start with a text-less quote message — use the quote. */
function deriveTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New chat';
  const source = first.text.trim() || first.quote?.text.trim() || '';
  const words = source.replace(/[.!?,;:"']+/g, '').split(/\s+/).filter(Boolean);
  return words.slice(0, 2).join(' ') || 'New chat';
}

function readStore(): Record<string, Conversation[]> {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Per-work chat conversations, persisted to localStorage under one map keyed
 * by slug (`fanfic-bookmarks` style). Loaded after mount to avoid an
 * SSR/hydration mismatch — first paint always renders empty, then corrects.
 * Conversations that never got a user message are pruned on load.
 */
export function useChatHistory(slug: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // Mirror of the latest list — lets update() compute the next value
  // synchronously (create-then-append in one tick) and keeps the localStorage
  // write OUT of the setState updater (updaters must stay pure; StrictMode
  // runs them twice, which double-wrote storage before).
  const latest = useRef<Conversation[]>([]);

  useEffect(() => {
    const store = readStore();
    const list = (store[slug] ?? [])
      .filter((c) => c.messages.some((m) => m.role === 'user'))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    latest.current = list;
    setConversations(list);
  }, [slug]);

  const update = useCallback(
    (fn: (prev: Conversation[]) => Conversation[]) => {
      const next = fn(latest.current);
      latest.current = next;
      setConversations(next);
      try {
        const store = readStore();
        // Only persist conversations with at least one user message.
        store[slug] = next.filter((c) => c.messages.some((m) => m.role === 'user'));
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(store));
      } catch {
        // ignore — private mode / disabled storage
      }
    },
    [slug]
  );

  const createConversation = useCallback(
    (characterId: string, characterName: string): Conversation => {
      const now = Date.now();
      const conversation: Conversation = {
        id: crypto.randomUUID(),
        characterId,
        characterName,
        title: 'New chat',
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      update((prev) => [conversation, ...prev]);
      return conversation;
    },
    [update]
  );

  const appendMessage = useCallback(
    (conversationId: string, message: Omit<ChatMessage, 'id'>) => {
      update((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const messages = [...c.messages, { ...message, id: crypto.randomUUID() }];
          return { ...c, messages, title: deriveTitle(messages), updatedAt: Date.now() };
        })
      );
    },
    [update]
  );

  return { conversations, createConversation, appendMessage };
}
