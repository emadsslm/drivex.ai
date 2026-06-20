"use client";

import { useState } from "react";
import { Home, Volume2, Type, MapPin, X, Save, Info } from "lucide-react";
import { useDriveX } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const homeAddress = useDriveX((s) => s.homeAddress);
  const setHomeAddress = useDriveX((s) => s.setHomeAddress);
  const voiceResponse = useDriveX((s) => s.voiceResponse);
  const setVoiceResponse = useDriveX((s) => s.setVoiceResponse);
  const ttsEnabled = useDriveX((s) => s.ttsEnabled);
  const setTtsEnabled = useDriveX((s) => s.setTtsEnabled);
  const largeTextMode = useDriveX((s) => s.largeTextMode);
  const setLargeTextMode = useDriveX((s) => s.setLargeTextMode);

  const [addr, setAddr] = useState(homeAddress);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setHomeAddress(addr.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-[var(--drivex-panel)] border border-white/10 rounded-t-3xl sm:rounded-3xl dx-safe-bottom max-h-[92vh] overflow-y-auto dx-scroll">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[var(--drivex-panel)]">
          <h2 className="text-base font-semibold">الإعدادات</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full grid place-items-center bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* Home address */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-[var(--drivex-cyan)]" />
              <label className="text-sm font-medium">عنوان المنزل</label>
            </div>
            <div className="flex gap-2">
              <input
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                placeholder="مثال: حي النخيل، الرياض"
                className="flex-1 h-11 rounded-xl bg-[var(--drivex-panel-2)] border border-white/10 px-3 text-sm outline-none focus:border-[var(--drivex-cyan)]/50"
              />
              <button
                onClick={save}
                className="shrink-0 h-11 px-4 rounded-xl bg-gradient-to-br from-[var(--drivex-cyan)] to-[var(--drivex-blue)] text-black text-sm font-medium flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {saved ? "تم" : "حفظ"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              يُستخدم عند قول "خذني إلى المنزل" لفتح الطريق على الخريطة.
            </p>
          </section>

          {/* Toggles */}
          <section className="space-y-3">
            <ToggleRow
              icon={<Volume2 className="w-4 h-4 text-[var(--drivex-cyan)]" />}
              title="الرد الصوتي"
              desc="ينطق المساعد ردوده بصوت مسموع."
              checked={voiceResponse}
              onChange={setVoiceResponse}
            />
            <ToggleRow
              icon={<Volume2 className="w-4 h-4 text-[var(--drivex-cyan)]" />}
              title="تحويل النص لصوت (TTS)"
              desc="تفعيل نطق الردود عبر Web Speech API."
              checked={ttsEnabled}
              onChange={setTtsEnabled}
            />
            <ToggleRow
              icon={<Type className="w-4 h-4 text-[var(--drivex-cyan)]" />}
              title="نص كبير"
              desc="تكبير الخط أثناء القيادة لسهولة القراءة."
              checked={largeTextMode}
              onChange={setLargeTextMode}
            />
          </section>

          {/* Permissions helper */}
          <section className="rounded-2xl p-4 bg-[var(--drivex-panel-2)] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-[var(--drivex-cyan)]" />
              <h3 className="text-sm font-medium">الأذونات المطلوبة</h3>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pr-4">
              <li><b>الموقع</b>: للخرائط وكشف السرعة وتفعيل وضع القيادة تلقائيًا.</li>
              <li><b>الميكروفون</b>: للأوامر الصوتية والتعرف على الكلام.</li>
              <li>الأفضل استخدام HTTPS وتثبيت التطبيق على الهاتف.</li>
            </ul>
          </section>

          <button
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(() => {}, () => {});
              }
            }}
            className="w-full h-11 rounded-xl border border-[var(--drivex-cyan)]/30 text-[var(--drivex-cyan)] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[var(--drivex-cyan)]/10 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            طلب إذن الموقع
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-3.5 bg-[var(--drivex-panel-2)] border border-white/5">
      <div className="w-9 h-9 rounded-xl grid place-items-center bg-white/5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-12 h-7 rounded-full transition-colors shrink-0",
          checked ? "bg-[var(--drivex-cyan)]" : "bg-white/15"
        )}
      >
        <span
          className={cn(
            "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
