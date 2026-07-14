// Swappable "chat" characters shown in the text-selection toolbar.
// Avatars only for now (no names); add names/personas later.
export interface ChatCharacter {
  id: string;
  src: string;
}

export const CHAT_CHARACTERS: ChatCharacter[] = [
  { id: 'character-1', src: '/characters/character-1.png' },
  { id: 'character-2', src: '/characters/character-2.png' },
  { id: 'character-3', src: '/characters/character-3.png' },
];

export const CHAT_CHARACTER_KEY = 'fanfic-chat-character';

// @DUMMY — maps the global avatars onto the current work's character list by
// index so chat names stay story-relevant. Real character data (per-work
// avatars + names) replaces this when the backend exists.
export function resolveCharacterName(charId: string, characters: string[]): string {
  const index = CHAT_CHARACTERS.findIndex((c) => c.id === charId);
  return characters[index] ?? `Character ${index + 1}`;
}
