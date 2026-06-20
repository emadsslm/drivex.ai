"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Loader2, Bot, User, Mic } from "lucide-react";
import { useDriveX } from "@/lib/store";
import { useDriveXAssistant } from "@/hooks/use-assistant";
import { QUICK_COMMANDS } from "@/lib/intents";
import { cn } from "@/lib/utils";

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
}

export function AIChat() {
  const messages = useDriveX((s) => s.messages);
  const clearMessages = useDriveX((s) => s.clearMessages);
  const driving = useDriveX((s) => s.driving);
  const { sendText, startListening, stopListening, speechSupported } = useDriveXAssistant();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t) return;
    sendText(t);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--drivex-cyan)] to-[var(--drivex-blue)] grid place-items-center">
            <Bot className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-semibold">DriveX AI</div>
            <div className="text-[10px] text-muted-foreground">المساعد الذكي</div>
          </div>
        </div>
        <button
          onClick={clearMessages}
          className="text-muted-foreground hover:text-red-400 transition-colors p-2"
          aria-label="مسح المحادثة"
          title="مسح المحادثة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="dx-scroll flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m) => {
          const isUser = m.role === "user";
          const isThinking = m.role === "assistant" && m.content === "…";
          return (
            <div
              key={m.id}
              className={cn("flex gap-2.5 max-w-[88%] dx-fade-up", isUser ? "ml-auto flex-row-reverse" : "")}
            >
              <div
                className={cn(
                  "shrink-0 w-7 h-7 rounded-full grid place-items-center",
                  isUser
                    ? "bg-white/10 text-white"
                    : "bg-gradient-to-br from-[var(--drivex-cyan)] to-[var(--drivex-blue)] text-black"
                )}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-white/10 text-white rounded-tr-sm"
                    : "bg-[var(--drivex-panel-2)] border border-[var(--drivex-cyan)]/15 text-foreground rounded-tl-sm"
                )}
              >
                {isThinking ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> أفكّر...
                  </span>
                ) : (
                  <span className="whitespace-pre-wrap break-words">{m.content}</span>
                )}
                <div className="mt-1 text-[9px] text-muted-foreground/70 text-left">{fmtTime(m.ts)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* quick commands */}
      {driving && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto dx-scroll">
          {QUICK_COMMANDS.map((c) => (
            <button
              key={c.label}
              onClick={() => submit(c.text)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-[var(--drivex-cyan)]/20 text-[var(--drivex-cyan)] hover:bg-[var(--drivex-cyan)]/10 transition-colors"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="dx-safe-bottom flex items-center gap-2 px-3 py-3 border-t border-white/5 bg-black/30"
      >
        {speechSupported && (
          <button
            type="button"
            onClick={() => {
              if (useDriveX.getState().listening) {
                stopListening();
                useDriveX.setState({ listening: false });
              } else {
                useDriveX.setState({ listening: true });
                startListening();
              }
            }}
            className="shrink-0 w-11 h-11 rounded-full grid place-items-center bg-[var(--drivex-panel-2)] border border-[var(--drivex-cyan)]/30 text-[var(--drivex-cyan)] hover:bg-[var(--drivex-cyan)]/10 transition-colors"
            aria-label="إدخال صوتي"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالة أو اطلب نصيحة قيادة..."
          className="flex-1 h-11 rounded-full bg-[var(--drivex-panel)] border border-white/10 px-4 text-sm outline-none focus:border-[var(--drivex-cyan)]/50 placeholder:text-muted-foreground/60"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="shrink-0 w-11 h-11 rounded-full grid place-items-center bg-gradient-to-br from-[var(--drivex-cyan)] to-[var(--drivex-blue)] text-black disabled:opacity-40 transition-opacity"
          aria-label="إرسال"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
