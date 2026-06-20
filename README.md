# 🚗 DriveX AI – Smart Driving Assistant

تطبيق ويب احترافي (PWA) يعمل كمساعد قيادة ذكي — صوت، خرائط، ذكاء اصطناعي، وكشف سرعة GPS في تجربة واحدة آمنة. قابل للتثبيت على الهاتف بدون متجر تطبيقات.

![DriveX AI](public/icon-512.png)

---

## ✨ المميزات

- 🧠 **مساعد ذكاء اصطناعي** — ردود قصيرة وآمنة أثناء القيادة (عبر `z-ai-web-dev-sdk`)
- 🎤 **تحكم صوتي** — Web Speech API يدعم العربية: "خذني للمنزل"، "افتح الخرائط"، "كم السرعة؟"
- 🗺️ **خرائط حية** — OpenStreetMap + Leaflet بثيم داكن، تتبّع الموقع ودائرة الدقة
- 📊 **كشف السرعة** — عدّاد دائري SVG + بوصلة + تنبيه تجاوز السرعة
- 🚦 **وضع القيادة التلقائي** — يُفعّل عند تجاوز 15 كم/س
- 🎵 **ترفيه** — راديو إنترنت (SomaFM) أثناء القيادة
- 📱 **PWA قابل للتثبيت** — يعمل standalone على الهاتف، مع offline UI cache
- 🎨 **تصميم Tesla / Android Auto** — أسود + أزرق كهربائي، أزرار كبيرة

---

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|-----------|
| Next.js 16 (App Router) | الإطار الأساسي |
| TypeScript | الأمان النوعي |
| Tailwind CSS 4 + shadcn/ui | التصميم |
| `z-ai-web-dev-sdk` | المساعد الذكي (LLM) |
| Web Speech API | الإدخال الصوتي + النطق (TTS) |
| Geolocation API | الموقع + السرعة |
| Leaflet + OpenStreetMap | الخرائط |
| Zustand | إدارة الحالة |
| Framer Motion | الأنيميشن |
| Service Worker | PWA + offline cache |

---

## 📦 التشغيل محليًا

```bash
# تثبيت الحزم
bun install

# تشغيل بيئة التطوير
bun run dev

# فحص الكود
bun run lint

# البناء للإنتاج
bun run build
```

ثم افتح [localhost:3000](http://localhost:3000).

> ⚠️ GPS والميكروفون يتطلبان **HTTPS** — يعملان فقط بعد النشر على Vercel/Netlify أو عبر `https` محلي.

---

## 🚀 النشر

راجع **[DEPLOYMENT.md](./DEPLOYMENT.md)** للحصول على دليل خطوة بخطوة لنشر التطبيق على Vercel وتثبيته على الهاتف.

### مسار سريع:

```bash
git init && git branch -M main
git add . && git commit -m "DriveX AI"
git remote add origin https://github.com/USERNAME/drivex-ai.git
git push -u origin main
```

ثم على [vercel.com](https://vercel.com) → **Import** → **Deploy** → افتح الرابط على هاتفك → **تثبيت التطبيق**.

---

## 🎯 الأوامر الصوتية المدعومة

| الأمر | الإجراء |
|-------|---------|
| "خذني إلى المنزل" | يفتح الخريطة باتجاه منزلك |
| "افتح الخرائط" | يفتح شاشة الخريطة |
| "شغل الموسيقى" | يبدأ راديو الإنترنت |
| "كم المسافة؟" | معلومات عن الموقع والمسافة |
| "كم السرعة؟" | يقرأ سرعتك الحالية |
| "كم الساعة؟" | يقرأ الوقت الحالي |
| أي سؤال آخر | يُرسل للذكاء الاصطناعي |

---

## 📁 بنية المشروع

```
src/
├─ app/
│  ├─ layout.tsx              # metadata PWA + SW register
│  ├─ page.tsx                # موحّد الواجهات
│  ├─ globals.css             # ثيم DriveX الأسود/الأزرق
│  └─ api/assistant/route.ts  # DriveX AI Brain (z-ai-web-dev-sdk)
├─ components/drivex/         # كل مكوّنات الواجهة
├─ hooks/                     # geolocation, speech, assistant
└─ lib/                       # store, intents, assistant helper
public/
├─ manifest.json · sw.js · icon-*.png
vercel.json                   # إعدادات النشر + headers الأمان
DEPLOYMENT.md                 # دليل النشر الكامل
```

---

## 🔐 الأمان

- ردود الذكاء الاصطناعي **قصيرة (1-3 جمل)** لعدم تشتيت السائق
- كشف الأوامر المحلي سريع **بدون شبكة**
- `Permissions-Policy` محصور في `geolocation` و `microphone` فقط
- `X-Frame-Options: DENY` لمنع التضمين الخارجي

---

**قيادة آمنة! 🚗**
