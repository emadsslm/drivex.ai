"use client";

import { useCallback, useRef } from "react";
import { useDriveX } from "@/lib/store";
import { useSpeechRecognition, useTTS } from "@/hooks/use-speech";
import { detectIntent, intentReply } from "@/lib/intents";
import { askAssistant } from "@/lib/assistant";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * useDriveXAssistant — the brain that wires voice input → intent detection →
 * action execution → AI fallback → TTS reply.
 */
export function useDriveXAssistant() {
  const addMessage = useDriveX((s) => s.addMessage);
  const setListening = useDriveX((s) => s.setListening);
  const setLastTranscript = useDriveX((s) => s.setLastTranscript);
  const ttsEnabled = useDriveX((s) => s.ttsEnabled);
  const voiceResponse = useDriveX((s) => s.voiceResponse);
  const setView = useDriveX((s) => s.setView);
  const setMediaPlaying = useDriveX((s) => s.setMediaPlaying);
  const stopDriving = useDriveX((s) => s.stopDriving);
  const driving = useDriveX((s) => s.driving);
  const speedKmh = useDriveX((s) => s.speedKmh);
  const coords = useDriveX((s) => s.coords);
  const homeAddress = useDriveX((s) => s.homeAddress);
  const messages = useDriveX((s) => s.messages);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const { supported: speechSupported, start, stop, error, setError } = useSpeechRecognition("ar-SA");
  const { speak, cancel } = useTTS();

  const say = useCallback(
    (text: string) => {
      if (voiceResponse && ttsEnabled) speak(text);
    },
    [voiceResponse, ttsEnabled, speak]
  );

  const handleUserInput = useCallback(
    async (text: string, viaVoice: boolean) => {
      const clean = text.trim();
      if (!clean) return;
      setLastTranscript(clean);
      addMessage({ id: uid(), role: "user", content: clean, ts: Date.now() });

      const { intent, arg } = detectIntent(clean);

      // Execute known intents immediately (offline, fast).
      if (intent !== "unknown") {
        switch (intent) {
          case "navigate_home":
          case "navigate_to":
            setView("map");
            break;
          case "open_maps":
            setView("map");
            break;
          case "play_music":
            setMediaPlaying(true);
            setView("media");
            break;
          case "stop_music":
            setMediaPlaying(false);
            break;
          case "exit_drive":
            stopDriving();
            break;
          case "help":
            // handled by reply below
            break;
        }
        const reply = intentReply(intent, { speedKmh, homeAddress, coords });
        if (reply) {
          addMessage({ id: uid(), role: "assistant", content: reply, ts: Date.now() });
          say(reply);
        }
        return;
      }

      // Unknown intent → ask the AI.
      const thinkingId = uid();
      addMessage({
        id: thinkingId,
        role: "assistant",
        content: "…",
        ts: Date.now(),
      });

      const aiReply = await askAssistant(clean, messagesRef.current.slice(-8), {
        driving,
        speedKmh,
        coords,
        homeAddress,
      });

      // Replace the thinking bubble (filter out placeholder then append).
      useDriveX.setState((s) => ({
        messages: [
          ...s.messages.filter((m) => m.id !== thinkingId),
          { id: uid(), role: "assistant" as const, content: aiReply, ts: Date.now() },
        ],
      }));
      say(aiReply);
    },
    [
      addMessage,
      coords,
      driving,
      homeAddress,
      say,
      setLastTranscript,
      setMediaPlaying,
      setView,
      speedKmh,
      stopDriving,
    ]
  );

  const startListening = useCallback(() => {
    cancel(); // stop any ongoing TTS so mic is clean
    start((transcript) => {
      void handleUserInput(transcript, true);
    });
  }, [cancel, handleUserInput, start]);

  const sendText = useCallback(
    (text: string) => {
      void handleUserInput(text, false);
    },
    [handleUserInput]
  );

  return {
    speechSupported,
    listening: useDriveX.getState().listening,
    startListening,
    stopListening: stop,
    error,
    setError,
    sendText,
    speak,
    cancelTTS: cancel,
  };
}
