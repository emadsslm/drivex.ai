"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typings for the Web Speech API (not in TS DOM lib by default).
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechSupported() {
  return !!getRecognitionCtor();
}

export function isTTSSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * useSpeechRecognition — wraps Web Speech API for voice input.
 * Returns transcripts (final) and listening state.
 */
export function useSpeechRecognition(lang = "ar-SA") {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => isSpeechSupported());
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef<(t: string) => void>(() => {});

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) {
        setError("المتصفح لا يدعم التعرف على الصوت.");
        return;
      }
      finalRef.current = onFinal;
      setError(null);

      // Re-create each time to avoid stale handlers.
      const rec = new Ctor();
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onerror = (e: any) => {
        if (e?.error === "no-speech") {
          setError("لم أسمع أي كلام. حاول مجددًا.");
        } else if (e?.error === "not-allowed") {
          setError("تم رفض إذن الميكروفون.");
        } else if (e?.error === "aborted") {
          // user aborted, ignore
        } else {
          setError("حدث خطأ في التعرف على الصوت.");
        }
        setListening(false);
      };
      rec.onresult = (event: any) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        text = text.trim();
        if (text) finalRef.current(text);
      };

      recRef.current = rec;
      try {
        rec.start();
      } catch {
        /* sometimes start throws if called twice */
      }
    },
    [lang]
  );

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
    };
  }, []);

  return { supported, listening, error, start, stop, setError };
}

/**
 * useTTS — text-to-speech via Web Speech API.
 */
export function useTTS() {
  const [supported] = useState(() => isTTSSupported());
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, lang = "ar-SA") => {
      if (!supported || !text) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = 1;
        u.pitch = 1;
        const v =
          voicesRef.current.find((x) => x.lang?.toLowerCase().startsWith(lang.slice(0, 2))) ||
          voicesRef.current.find((x) => x.lang?.toLowerCase().startsWith("ar"));
        if (v) u.voice = v;
        window.speechSynthesis.speak(u);
      } catch {
        /* noop */
      }
    },
    [supported]
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }, [supported]);

  return { supported, speak, cancel };
}
