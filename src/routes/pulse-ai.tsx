import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, Loader2, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/pulse-ai")({
  head: () => ({
    meta: [
      { title: "Pulse AI — Your confidential MzansiPulse companion" },
      {
        name: "description",
        content:
          "Chat with Pulse AI in your language. Spot the signs, draft the conversation, get a 24-hour plan.",
      },
    ],
  }),
  component: PulseAIPage,
});

const QUICK_PROMPTS = [
  "My 17-year-old son has become withdrawn and money keeps going missing. What should I look for?",
  "Help me write what to say to my brother. I think he's using nyaope.",
  "Give me a 24-hour action plan — I just found a vape pen in my daughter's bag.",
  "What's the difference between teenage moodiness and early warning signs?",
];

function PulseAIPage() {
  const { lang, t } = useI18n();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat({
    id: "pulse-ai",
    transport: new DefaultChatTransport({
      api: "/api/pulse-ai",
      body: () => ({ lang }),
    }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || status === "submitted" || status === "streaming") return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Pulse AI
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confidential. Multilingual. Built for South African families. Not a medical service.
          </p>
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-xl shadow-black/20">
        <div
          ref={scrollRef}
          className="flex max-h-[60vh] min-h-[420px] flex-col gap-4 overflow-y-auto p-4 md:p-6"
        >
          {messages.length === 0 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-surface-elevated p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> Welcome
                </div>
                <p className="mt-2 text-sm text-foreground">
                  I'm Pulse AI. Tell me what you've noticed about someone you care about — the small
                  things, the gut feeling. I'll help you spot the signs, draft what to say, and plan
                  your next 24 hours. Everything stays on this device.
                </p>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Try one of these
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => submit(p)}
                      className="rounded-lg border border-border bg-background p-3 text-left text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-surface-elevated"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} role={m.role}>
              {m.parts.map((part, i) =>
                part.type === "text" ? <span key={i}>{part.text}</span> : null,
              )}
            </Message>
          ))}

          {status === "submitted" && (
            <Message role="assistant">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </span>
            </Message>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              Something went wrong. Please try again.
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-end gap-2 border-t border-border p-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={1}
            placeholder={t("nav.pulseAI") + "…  e.g. 'My nephew has been hanging with a new crowd'"}
            className="min-h-[44px] max-h-40 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          )}
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        In a real emergency call <span className="text-foreground">10111</span> or SADAG{" "}
        <span className="text-foreground">0800 567 567</span> — Pulse AI is a guide, not an emergency
        service.
      </p>
    </div>
  );
}

function Message({ role, children }: { role: string; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          isUser ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary/15 text-foreground"
            : "bg-surface-elevated text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
