"use client";

import { Home, MessageSquare, Map as MapIcon, Music, Settings, Power } from "lucide-react";
import { useDriveX, type DxView } from "@/lib/store";
import { cn } from "@/lib/utils";

const ITEMS: { view: DxView; label: string; icon: React.ReactNode }[] = [
  { view: "home", label: "الرئيسية", icon: <Home className="w-5 h-5" /> },
  { view: "chat", label: "المساعد", icon: <MessageSquare className="w-5 h-5" /> },
  { view: "map", label: "الخريطة", icon: <MapIcon className="w-5 h-5" /> },
  { view: "media", label: "الترفيه", icon: <Music className="w-5 h-5" /> },
];

export function BottomNav({ onOpenSettings }: { onOpenSettings: () => void }) {
  const view = useDriveX((s) => s.view);
  const setView = useDriveX((s) => s.setView);
  const driving = useDriveX((s) => s.driving);
  const stopDriving = useDriveX((s) => s.stopDriving);

  return (
    <nav className="dx-safe-bottom shrink-0 border-t border-white/5 bg-black/60 backdrop-blur-lg">
      <div className="grid grid-cols-5">
        {ITEMS.map((it) => {
          const active = view === it.view || (it.view === "home" && view === "drive");
          return (
            <button
              key={it.view}
              onClick={() => setView(it.view)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 transition-colors",
                active ? "text-[var(--drivex-cyan)]" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className={cn("transition-transform", active && "scale-110")}>{it.icon}</span>
              <span className="text-[10px] font-medium">{it.label}</span>
            </button>
          );
        })}

        {driving ? (
          <button
            onClick={stopDriving}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-red-400 hover:text-red-300 transition-colors"
          >
            <Power className="w-5 h-5" />
            <span className="text-[10px] font-medium">إنهاء</span>
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground hover:text-[var(--drivex-cyan)] transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">الإعدادات</span>
          </button>
        )}
      </div>
    </nav>
  );
}
