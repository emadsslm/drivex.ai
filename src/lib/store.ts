import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DxView = "home" | "drive" | "chat" | "map" | "media" | "settings";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
};

export type VoiceIntent =
  | "navigate_home"
  | "navigate_to"
  | "open_maps"
  | "play_music"
  | "stop_music"
  | "distance"
  | "speed"
  | "time"
  | "weather"
  | "call"
  | "help"
  | "exit_drive"
  | "unknown";

type DxState = {
  // Driving state
  view: DxView;
  driving: boolean;
  autoDriveDetected: boolean;
  speedKmh: number;
  speedLimit: number;
  heading: number;
  coords: { lat: number; lng: number } | null;
  accuracy: number | null;
  locationError: string | null;

  // Voice
  listening: boolean;
  lastTranscript: string;
  ttsEnabled: boolean;

  // Chat
  messages: ChatMessage[];

  // Media
  mediaPlaying: boolean;
  mediaStation: string;

  // Settings
  homeAddress: string;
  voiceResponse: boolean;
  largeTextMode: boolean;

  // actions
  setView: (v: DxView) => void;
  startDriving: () => void;
  stopDriving: () => void;
  setAutoDriveDetected: (v: boolean) => void;
  setSpeed: (kmh: number) => void;
  setHeading: (deg: number) => void;
  setCoords: (c: { lat: number; lng: number } | null) => void;
  setAccuracy: (a: number | null) => void;
  setLocationError: (e: string | null) => void;
  setListening: (v: boolean) => void;
  setLastTranscript: (t: string) => void;
  addMessage: (m: ChatMessage) => void;
  clearMessages: () => void;
  setMediaPlaying: (v: boolean) => void;
  setMediaStation: (s: string) => void;
  setHomeAddress: (s: string) => void;
  setTtsEnabled: (v: boolean) => void;
  setVoiceResponse: (v: boolean) => void;
  setLargeTextMode: (v: boolean) => void;
};

export const useDriveX = create<DxState>()(
  persist(
    (set) => ({
      view: "home",
      driving: false,
      autoDriveDetected: false,
      speedKmh: 0,
      speedLimit: 0,
      heading: 0,
      coords: null,
      accuracy: null,
      locationError: null,

      listening: false,
      lastTranscript: "",
      ttsEnabled: true,

      messages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "مرحبًا، أنا DriveX AI — مساعدك الذكي أثناء القيادة. اضغط زر الميكروفون وتحدث، أو اسألني أي سؤال. قيادة آمنة!",
          ts: Date.now(),
        },
      ],

      mediaPlaying: false,
      mediaStation: "Lo-Fi Drive",

      homeAddress: "",
      voiceResponse: true,
      largeTextMode: false,

      setView: (v) => set({ view: v }),
      startDriving: () => set({ driving: true, view: "drive" }),
      stopDriving: () =>
        set((s) => ({ driving: false, view: s.view === "drive" ? "home" : s.view })),
      setAutoDriveDetected: (v) => set({ autoDriveDetected: v }),
      setSpeed: (kmh) => set({ speedKmh: kmh }),
      setHeading: (deg) => set({ heading: deg }),
      setCoords: (c) => set({ coords: c }),
      setAccuracy: (a) => set({ accuracy: a }),
      setLocationError: (e) => set({ locationError: e }),
      setListening: (v) => set({ listening: v }),
      setLastTranscript: (t) => set({ lastTranscript: t }),
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      clearMessages: () =>
        set({
          messages: [
            {
              id: "welcome",
              role: "assistant",
              content: "تم مسح المحادثة. كيف يمكنني مساعدتك؟",
              ts: Date.now(),
            },
          ],
        }),
      setMediaPlaying: (v) => set({ mediaPlaying: v }),
      setMediaStation: (s) => set({ mediaStation: s }),
      setHomeAddress: (s) => set({ homeAddress: s }),
      setTtsEnabled: (v) => set({ ttsEnabled: v }),
      setVoiceResponse: (v) => set({ voiceResponse: v }),
      setLargeTextMode: (v) => set({ largeTextMode: v }),
    }),
    {
      name: "drivex-store",
      partialize: (s) => ({
        homeAddress: s.homeAddress,
        voiceResponse: s.voiceResponse,
        ttsEnabled: s.ttsEnabled,
        largeTextMode: s.largeTextMode,
        mediaStation: s.mediaStation,
      }),
    }
  )
);
