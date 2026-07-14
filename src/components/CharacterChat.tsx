'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useReading, useReadingUI } from '@/context/ReadingContext';
import { useChatHistory, type ChatMessage, type Conversation } from '@/hooks/useChatHistory';
import { useChatCharacter } from '@/hooks/useChatCharacter';
import { CHAT_CHARACTERS, resolveCharacterName } from '@/lib/chatCharacters';
import { pickReply } from '@/lib/chatReplies';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { MENU_ROW, ICON_BUTTON } from './popoverChrome';
import { isTypingTarget, relativeTime } from '@/lib/utils';
import { QuoteBlock } from './QuoteBlock';
import {
  ComposeIcon,
  ArrowUpRightIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
} from './icons';

// @DUMMY — no user-persona asset exists yet; reuses the creator placeholder.
const PERSONA_PLACEHOLDER = '/creators/placeholder.png';


/**
 * Character chat — a Codex-companion-style floating card, bottom-right of the
 * reading page. No scrim: the story stays lit and scrollable beside it.
 * Static-site prototype: canned in-voice replies (@DUMMY chatReplies), real
 * per-work conversation history in localStorage.
 */
export function CharacterChat() {
  const { workMeta, slug } = useReading();
  const { chatOpen, setChatOpen, chatSeed, setChatSeed } = useReadingUI();
  const { conversations, createConversation, appendMessage } = useChatHistory(slug);
  const { activeCharacter } = useChatCharacter();
  const reduce = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  // History overlays a conversation (hover the title to enter, back to leave).
  const [historyOpen, setHistoryOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const active: Conversation | null =
    conversations.find((c) => c.id === activeId) ?? null;
  const characterName = active
    ? active.characterName
    : resolveCharacterName(activeCharacter.id, workMeta.characters);
  const characterSrc =
    CHAT_CHARACTERS.find((c) => c.id === active?.characterId)?.src ?? activeCharacter.src;

  const startConversation = useCallback(() => {
    const conversation = createConversation(
      activeCharacter.id,
      resolveCharacterName(activeCharacter.id, workMeta.characters)
    );
    setActiveId(conversation.id);
    return conversation;
  }, [activeCharacter.id, createConversation, workMeta.characters]);

  // Consume a one-shot seed (quote from the selection toolbar) on open: the
  // quote is sent as the user's message immediately and the character replies.
  useEffect(() => {
    if (!chatOpen || !chatSeed) return;
    const conversation = startConversation();
    const message: Omit<ChatMessage, 'id'> = {
      role: 'user',
      text: '',
      quote: { text: chatSeed.quote, chapterIndex: chatSeed.chapterIndex },
    };
    appendMessage(conversation.id, message);
    scheduleReply({
      ...conversation,
      messages: [...conversation.messages, { ...message, id: 'pending' }],
    });
    setChatSeed(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen, chatSeed]);

  // On open without a seed: land on the "New chat" screen (recents inline),
  // unless a conversation from this session is still selected.
  useEffect(() => {
    if (!chatOpen || chatSeed) return;
    if (activeId && conversations.some((c) => c.id === activeId)) return;
    setActiveId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  // Escape closes the chat (not while typing in the composer).
  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isTypingTarget(e)) {
        e.stopPropagation();
        setChatOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [chatOpen, setChatOpen]);

  // Clear any in-flight reply on unmount only — NOT on conversation switch:
  // send() may have just created the conversation (activeId changes in the
  // same tick), and an [activeId] cleanup would kill the fresh reply timer.
  // appendMessage targets a conversation id, so a reply landing after a
  // switch still files into the right conversation.
  useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    },
    []
  );

  function scheduleReply(preview: Conversation) {
    setTyping(true);
    replyTimer.current = setTimeout(() => {
      appendMessage(preview.id, { role: 'character', text: pickReply(preview) });
      setTyping(false);
    }, 900 + Math.random() * 500);
  }

  function send(draft: string) {
    const text = draft.trim();
    if (!text || typing) return;
    let conversation = active;
    if (!conversation) conversation = startConversation();
    const message: Omit<ChatMessage, 'id'> = { role: 'user', text };
    appendMessage(conversation.id, message);
    scheduleReply({
      ...conversation,
      messages: [...conversation.messages, { ...message, id: 'pending' }],
    });
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {chatOpen && (
        <motion.section
          role="dialog"
          aria-modal={false}
          aria-label="Character chat"
          initial={reduce ? false : { opacity: 0, scale: 0.82, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 6, transition: { duration: 0.14, ease: 'easeIn' } }
          }
          transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
          style={{ transformOrigin: 'bottom right' }}
          // Sidebar-matched chrome: 32px radius, faint hairline, site-bg surface
          // (the white token is reserved for the composer pill inside).
          className="fixed bottom-3 right-3 z-[var(--z-modal)] flex h-[min(640px,calc(100dvh-24px))] w-[min(420px,90vw)] flex-col overflow-hidden rounded-[32px] border border-[var(--image-outline-faint)] bg-bg text-text shadow-float max-md:hidden"
        >
          <ChatHeader
            title={active?.title ?? 'New chat'}
            isNewChat={!active}
            historyOpen={historyOpen}
            onCompose={() => {
              setActiveId(null);
              setHistoryOpen(false);
            }}
            onOpenHistory={() => setHistoryOpen(true)}
            onBack={() => setHistoryOpen(false)}
            onClose={() => setChatOpen(false)}
          />

          {active && historyOpen ? (
            <HistoryList
              conversations={conversations}
              activeId={activeId}
              onSelect={(id) => {
                setActiveId(id);
                setHistoryOpen(false);
              }}
            />
          ) : !active ? (
            <RecentChats
              conversations={conversations}
              onSelect={(id) => setActiveId(id)}
              characterName={characterName}
            />
          ) : (
            <Messages
              conversation={active}
              characterName={characterName}
              characterSrc={characterSrc}
              typing={typing}
            />
          )}
          <Composer characterName={characterName} typing={typing} onSend={send} />
        </motion.section>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ChatHeader({
  title,
  isNewChat,
  historyOpen,
  onCompose,
  onOpenHistory,
  onBack,
  onClose,
}: {
  title: string;
  isNewChat: boolean;
  historyOpen: boolean;
  onCompose: () => void;
  onOpenHistory: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <header className="shrink-0">
      <div className="flex items-center gap-1 px-2.5 pb-1 pt-2.5">
        {/* New-chat screen: bare title only. Conversation: compose | topic
            (hovering the topic snaps to History, where the compose icon
            morphs into a back chevron and the title reads "History"). */}
        {isNewChat ? (
          <span className="truncate px-2 py-1 font-sans text-[14px] font-medium text-text">
            New chat
          </span>
        ) : (
          <>
            <button
              type="button"
              aria-label={historyOpen ? 'Back to chat' : 'New chat'}
              onClick={historyOpen ? onBack : onCompose}
              className={`relative ${ICON_BUTTON}`}
            >
                {/* Icon morph — both stay mounted, cross-fade + scale. */}
                <motion.span
                  className="absolute inset-0 flex items-center justify-center"
                  animate={reduce ? { opacity: historyOpen ? 0 : 1 } : { opacity: historyOpen ? 0 : 1, scale: historyOpen ? 0.25 : 1 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                  <ComposeIcon width={18} height={18} />
                </motion.span>
                <motion.span
                  className="absolute inset-0 flex items-center justify-center"
                  animate={reduce ? { opacity: historyOpen ? 1 : 0 } : { opacity: historyOpen ? 1 : 0, scale: historyOpen ? 1 : 0.25 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                <ChevronLeftIcon width={18} height={18} />
              </motion.span>
            </button>
            <span className="h-4 w-px shrink-0 bg-border-strong" aria-hidden="true" />
            {historyOpen ? (
              <span className="truncate px-2 py-1 font-sans text-[14px] font-medium text-secondary">
                History
              </span>
            ) : (
              /* Hover darkens the title and reveals the chevron; CLICK opens History. */
              <button
                type="button"
                onClick={onOpenHistory}
                aria-label="Chat history"
                // h-8 matches the icon buttons; after:-inset-1 = 40px hit area.
                className="group relative flex h-8 min-w-0 items-center gap-1 rounded-xl px-2 text-left after:absolute after:-inset-1"
              >
                <span className="truncate font-sans text-[14px] font-medium text-secondary transition-colors group-hover:text-text">
                  {title}
                </span>
                <ChevronRightIcon
                  width={18}
                  height={18}
                  className="shrink-0 text-secondary opacity-0 transition-opacity duration-150 group-hover:opacity-55"
                />
              </button>
            )}
          </>
        )}
        <a
          href="https://character.ai"
          target="_blank"
          rel="noreferrer"
          // h-8 matches the compose/close icon buttons so all header fills align.
          className="group ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 font-sans text-[13px] text-secondary no-underline transition-colors hover:bg-overlay-soft hover:text-text"
        >
          Open on c.ai
          <ArrowUpRightIcon width={14} height={14} className="opacity-55 transition-opacity group-hover:opacity-100" />
        </a>
        <button type="button" aria-label="Close chat" onClick={onClose} className={ICON_BUTTON}>
          <MinusIcon width={18} height={18} />
        </button>
      </div>
    </header>
  );
}

/** One history/recents row: character avatar, short topic, relative time. */
function ConversationRow({ c, onSelect }: { c: Conversation; onSelect: (id: string) => void }) {
  const src = CHAT_CHARACTERS.find((ch) => ch.id === c.characterId)?.src;
  return (
    <button type="button" onClick={() => onSelect(c.id)} className={MENU_ROW}>
      <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-border">
        {src && <Image src={src} alt="" fill sizes="24px" className="object-cover" />}
        <span
          className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_0_0_1px_var(--image-outline)]"
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 flex-1 truncate font-sans text-[14px] text-text">{c.title}</span>
      <span className="shrink-0 font-mono text-[11px] text-secondary">
        {relativeTime(c.updatedAt)}
      </span>
    </button>
  );
}

/** The "New chat" screen body — empty space, then recent chats above the composer. */
function RecentChats({
  conversations,
  onSelect,
  characterName,
}: {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  characterName: string;
}) {
  const recents = conversations.filter((c) => c.messages.length > 0).slice(0, 5);

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-end overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {recents.length === 0 ? (
        <p className="m-auto max-w-[26ch] text-center font-sans text-[13px] leading-[1.6] text-secondary">
          Ask {characterName} about the story — they only know it up to where you&rsquo;ve read.
        </p>
      ) : (
        <>
          <span className="px-2.5 pb-1 font-sans text-[13px] text-secondary">Recent chats</span>
          {recents.map((c) => (
            <ConversationRow key={c.id} c={c} onSelect={onSelect} />
          ))}
        </>
      )}
    </div>
  );
}

/** Full history — snapped to from a conversation by hovering its title. */
function HistoryList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const items = conversations.filter((c) => c.messages.length > 0 || c.id === activeId);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {items.map((c) => (
        <ConversationRow key={c.id} c={c} onSelect={onSelect} />
      ))}
    </div>
  );
}

function Messages({
  conversation,
  characterName,
  characterSrc,
  typing,
}: {
  conversation: Conversation | null;
  characterName: string;
  characterSrc: string;
  typing: boolean;
}) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const count = (conversation?.messages.length ?? 0) + (typing ? 1 : 0);

  // Messages present when a conversation is (re)opened are hydrated state —
  // they must not replay the entrance animation; only new appends animate.
  const hydrated = useRef<{ id: string | null; count: number }>({ id: null, count: 0 });
  if (conversation && hydrated.current.id !== conversation.id) {
    hydrated.current = { id: conversation.id, count: conversation.messages.length };
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [count, reduce]);

  return (
    <div
      ref={scrollRef}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {conversation?.messages.map((m, i) => {
        const entrance = i >= hydrated.current.count;
        return m.role === 'character' ? (
          <CharacterBubble
            key={m.id}
            text={m.text}
            name={characterName}
            src={characterSrc}
            entrance={entrance}
          />
        ) : (
          <div key={m.id} className="flex flex-col gap-2">
            {m.quote && <QuoteBlock quote={m.quote.text} chapterIndex={m.quote.chapterIndex} />}
            {m.text ? (
              <motion.div
                initial={reduce || !entrance ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                className="ml-auto max-w-[85%] rounded-[20px] bg-overlay-medium px-5 py-4"
              >
                <p className="font-sans text-[15px] leading-[1.6] text-text">{m.text}</p>
              </motion.div>
            ) : null}
          </div>
        );
      })}

      {typing && <TypingIndicator name={characterName} src={characterSrc} />}

      {!conversation?.messages.length && !typing && (
        <p className="m-auto max-w-[26ch] text-center font-sans text-[13px] leading-[1.6] text-secondary">
          Ask {characterName} about the story — they only know it up to where you&rsquo;ve read.
        </p>
      )}
    </div>
  );
}

/** AuthorNote's received bubble, minus the thought-dots; square-rounded avatar. */
function CharacterBubble({
  text,
  name,
  src,
  entrance = true,
}: {
  text: string;
  name: string;
  src: string;
  /** False for hydrated (stored) messages — no entrance replay. */
  entrance?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce || !entrance ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
      className="flex flex-col gap-1.5"
    >
      <span className="pl-[40px] font-sans text-[12px] font-medium text-text">{name}</span>
      <div className="relative pl-[40px]">
        {/* Bottom-left radius at half — the bubble points toward the avatar. */}
        <div className="rounded-[20px] rounded-bl-[10px] bg-author-bubble px-4 py-3">
          <p className="font-sans text-[15px] leading-[1.6] text-author-bubble-fg">{text}</p>
        </div>
        {/* h-8 w-8 matches the user persona avatar in the composer. */}
        <span className="absolute bottom-0 left-0 block h-8 w-8 overflow-hidden rounded-lg bg-border">
          <Image src={src} alt="" fill sizes="32px" className="object-cover" />
          <span
            className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_0_1px_var(--image-outline)]"
            aria-hidden="true"
          />
        </span>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ name, src }: { name: string; src: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="pl-[40px] font-sans text-[12px] font-medium text-text">{name}</span>
      <div className="relative pl-[40px]">
        <div className="inline-flex items-center gap-1 rounded-[20px] rounded-bl-[10px] bg-author-bubble px-4 py-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-author-bubble-fg opacity-60 motion-safe:animate-[caiTypingDot_1.2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.15}s` }}
              aria-hidden="true"
            />
          ))}
          <span className="sr-only">{name} is typing</span>
        </div>
        <span className="absolute bottom-0 left-0 block h-8 w-8 overflow-hidden rounded-lg bg-border">
          <Image src={src} alt="" fill sizes="32px" className="object-cover" />
          <span
            className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_0_1px_var(--image-outline)]"
            aria-hidden="true"
          />
        </span>
      </div>
    </div>
  );
}

function Composer({
  characterName,
  typing,
  onSend,
}: {
  characterName: string;
  typing: boolean;
  onSend: (draft: string) => void;
}) {
  const [draft, setDraft] = useState('');

  function submit() {
    if (!draft.trim() || typing) return;
    onSend(draft);
    setDraft('');
  }

  return (
    <div className="shrink-0 p-2 pt-1">
      {/* One stroke only: shadow-bubble carries its own 1px ring, so the pill
          uses the faint border alone (no shadow) — white token surface. */}
      <div className="flex items-center gap-2 rounded-full border border-[var(--image-outline-faint)] bg-bubble py-1.5 pl-1.5 pr-1.5 transition-[border-color] focus-within:border-border-active">
        {/* @DUMMY — user persona avatar; no persona asset exists yet.
            h-8 w-8 mirrors the send button so the pill's ends match. */}
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-border">
          <Image src={PERSONA_PLACEHOLDER} alt="" fill sizes="32px" className="object-cover" />
          <span
            className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_var(--image-outline)]"
            aria-hidden="true"
          />
        </span>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder={`Message ${characterName}…`}
          aria-label={`Message ${characterName}`}
          className="min-w-0 flex-1 bg-transparent font-sans text-[15px] text-text outline-none placeholder:text-secondary"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim() || typing}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-text text-bg transition-[opacity,transform] active:scale-[0.96] disabled:cursor-default disabled:opacity-35"
        >
          <ArrowUpIcon width={16} height={16} />
        </button>
      </div>
    </div>
  );
}
