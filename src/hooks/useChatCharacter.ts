'use client';

import { useEffect, useState } from 'react';
import {
  CHAT_CHARACTERS,
  CHAT_CHARACTER_KEY,
  type ChatCharacter,
} from '@/lib/chatCharacters';

/**
 * The selected chat character, persisted to localStorage. The stored value is
 * read after mount (not in the initial state) to avoid an SSR/hydration
 * mismatch — first paint always renders the default, then corrects.
 */
export function useChatCharacter() {
  const [charId, setCharId] = useState(CHAT_CHARACTERS[0].id);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_CHARACTER_KEY);
      if (saved && CHAT_CHARACTERS.some((c) => c.id === saved)) setCharId(saved);
    } catch {
      // ignore — private mode / disabled storage
    }
  }, []);

  function selectCharacter(id: string) {
    setCharId(id);
    try {
      localStorage.setItem(CHAT_CHARACTER_KEY, id);
    } catch {
      // ignore
    }
  }

  const activeCharacter: ChatCharacter =
    CHAT_CHARACTERS.find((c) => c.id === charId) ?? CHAT_CHARACTERS[0];

  return { charId, activeCharacter, selectCharacter };
}
