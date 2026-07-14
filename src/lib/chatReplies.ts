// @DUMMY — canned in-voice replies for the character chat modal. The real
// implementation streams responses from the c.ai backend; this pool exists so
// the chat feels alive in the static prototype. See .claude/docs/wiring-guide.md.

import type { Conversation } from '@/hooks/useChatHistory';

// Openers used when the last user message carries a highlighted quote.
const QUOTE_OPENERS = [
  "You caught that line too, then. I've read it back more times than I'd admit — say what you're thinking and I'll tell you what I know. Up to where you've read, anyway.",
  "That passage… yes. I remember how it felt from the inside, which is stranger than you'd think. Ask me anything about it — I'll keep to what's happened so far.",
];

// General pool — cycled so consecutive replies don't repeat.
const REPLIES = [
  "Careful is just afraid wearing a nicer coat. But go on — I want to hear how it reads from the outside.",
  "You're asking the right question. I don't have the whole answer — not at this point in the story — but here's what I can tell you.",
  "Ha. If you'd asked me that a few chapters ago I'd have lied to you. Now? Now I'm not so sure I can.",
  "Everyone in this story keeps something in their pocket they won't show. Mine's heavier than most. Keep reading and you'll see why.",
  "That's the thing nobody says out loud here — you noticed. Most readers rush past it.",
  "I can only speak to what's happened so far — no spoilers, even I don't get to know the ending early. But within that? Ask me anything.",
];

/** Pick the next canned reply for a conversation (@DUMMY). */
export function pickReply(conversation: Conversation): string {
  const lastUser = [...conversation.messages].reverse().find((m) => m.role === 'user');
  const characterCount = conversation.messages.filter((m) => m.role === 'character').length;
  if (lastUser?.quote && characterCount === 0) {
    return QUOTE_OPENERS[conversation.messages.length % QUOTE_OPENERS.length];
  }
  return REPLIES[characterCount % REPLIES.length];
}
