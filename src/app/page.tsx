"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDriveX } from "@/lib/store";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useTTS } from "@/hooks/use-speech";

import { StatusBar } from "@/components/drivex/StatusBar";
import { BottomNav } from "@/components/drivex/BottomNav";
import { HomeScreen } from "@/components/drivex/HomeScreen";
import { DriveScreen } from "@/components/drivex/DriveScreen";
import { AIChat } from "@/components/drivex/AIChat";
import { MapsScreen } from "@/components/drivex/MapsScreen";
import { Entertainment } from "@/components/drivex/Entertainment";
import { SettingsPanel } from "@/components/drivex/SettingsPanel";

export default function Home() {
  const view = useDriveX((s) => s.view);
  const driving = useDriveX((s) => s.driving);
  const speed = useDriveX((s) => s.speedKmh);
  const autoDriveDetected = useDriveX((s) => s.autoDriveDetected);
  const setView = useDriveX((s) => s.setView);
  const startDriving = useDriveX((s) => s.startDriving);
  const largeTextMode = useDriveX((s) => s.largeTextMode);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Always-on GPS watch for speed + location.
  useGeolocation(15);
  // Pre-load TTS voices.
  useTTS();

  // Auto-enable driving mode when GPS speed crosses 15 km/h.
  // Only auto-enter once the user has seen the home screen; don't override
  // if the user is actively in chat/settings.
  useEffect(() => {
    if (autoDriveDetected && !driving && view === "home") {
      startDriving();
    }
  }, [autoDriveDetected]);

  // Apply large-text root class.
  useEffect(() => {
    const root = document.documentElement;
    if (largeTextMode) root.classList.add("dx-large");
    else root.classList.remove("dx-large");
  }, [largeTextMode]);

  // The "effective" view: when driving, home maps to the drive dashboard.
  const effectiveView = driving && view === "home" ? "drive" : view;

  return (
    <div className="flex flex-col min-h-screen h-screen bg-[var(--drivex-bg)] text-foreground overflow-hidden">
      <StatusBar />

      <main className="relative flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {effectiveView === "home" && <HomeScreen onOpenSettings={() => setSettingsOpen(true)} />}
            {effectiveView === "drive" && <DriveScreen />}
            {effectiveView === "chat" && <AIChat />}
            {effectiveView === "map" && <MapsScreen />}
            {effectiveView === "media" && <Entertainment />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav onOpenSettings={() => setSettingsOpen(true)} />

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SettingsPanel onClose={() => setSettingsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
