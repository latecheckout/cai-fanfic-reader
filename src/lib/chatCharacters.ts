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
