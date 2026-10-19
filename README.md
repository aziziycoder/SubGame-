# SubGame — O‘zbekcha subtitrli videoo‘yinlar platformasi

Zamonaviy, premium darajadagi va to‘liq reaktiv videoo‘yinlar lokalizatsiya platformasi. Loyihaning asosiy maqsadi — o‘zbek geymerlariga mashhur o‘yinlarni o‘z ona tilida tushunib, hikoyasidan to‘liq zavq olish imkoniyatini taqdim etish.

Hozirda **A Plague Tale: Innocence** va **A Plague Tale: Requiem** o‘yinlari uchun to‘liq o‘zbekcha subtitrlar tayyorlangan.

---

## 🚀 Texnologiyalar

- **React 19 + Vite 8** — Tezkor va zamonaviy frontend arxitekturasi
- **TypeScript** — To‘liq tipizatsiyalangan, xatolarsiz data layer va komponentlar
- **Tailwind CSS v3** — Maxsus gaming palitrasi (`#0B0D12`, `#141821`, `#1A1F2A`, `#A3E635`)
- **React Router v7** — Dynamic routing (`/`, `/games`, `/games/:slug`, `/guide`, `/about`, `/favorites`, `404`)
- **Lucide React** — Zamonaviy gaming va UI ikonkalari
- **Local Storage API** — Sevimli o‘yinlarni saqlash mexanizmi

---

## 🎮 Asosiy imkoniyatlar

1. **Cinematic Hero**: *A Plague Tale: Requiem* atmosferasi, sifatli overlay gradient va premyera kartasi.
2. **Katalog & Qidiruv (`/games`)**:
   - Real-vaqt qidiruvi (nom, studiya va janr bo‘yicha)
   - Janrlar bo‘yicha tezkor filterlar
   - Subtitr holati bo‘yicha filterlar (*Tayyor*, *Tekshirilmoqda*, *Ishlab chiqilmoqda*, *Rejada*)
   - Yil va alifbo bo‘yicha saralash
   - Bo‘sh natijalar uchun interaktiv *Empty State*
3. **Batafsil o‘yin sahifalari (`/games/:slug`)**:
   - `/games/a-plague-tale-innocence`
   - `/games/a-plague-tale-requiem`
   - Rasmiy tizim talablari (Minimal va Tavsiya etilgan taqqoslash)
   - Skrinshotlar galereyasi va to‘liq ekranli **Lightbox** (klaviatura o‘qlari va miniaturalar bilan)
   - O‘zbekcha subtitr metama‘lumotlari (AI modeli, versiya, yangilangan sana, hajm, moslik)
   - Rasmiy do‘kon litsenziyasi va bepul subtitrni alohida yuklab olish bloki
   - Bosqichma-bosqich o‘rnatish yo‘riqnomasi (nusxa olish tugmasi bilan)
4. **Qo‘llanma sahifasi (`/guide`)**:
   - Steam, Epic Games Store va GOG uchun batafsil qo‘llanmalar
   - Zaxira nusxa (Backup) va xavfsizlik bo‘yicha 3 ta oltin qoida
5. **Biz haqimizda (`/about`)**:
   - Loyiha falsafasi va jamoa maqsadi
   - AI Lokalizatsiya jarayoni (4 bosqichli pipeline)
   - Mustaqil hamjamiyat prinsiplari
6. **Sevimlilar tizimi (`/favorites`)**:
   - Brauzer xotirasida saqlanuvchi yurakcha belgisi
   - Navbardagi hisoblagich indikatori
7. **Interaktiv modallar**:
   - Yangi o‘yin uchun subtitr taklif qilish formasi
   - Subtitrda xatolik yoki muammoni bildirish formasi
8. **FAQ**:
   - Ko‘p beriladigan savollar akkordeoni

---

## 🛠 Ishga tushirish

```bash
# Bog‘liqliklarni o‘rnatish
npm install

# Dasturchi rejimida ishga tushirish (Localhost: 5173)
npm run dev

# Ishlab chiqarish (Production) build qilish
npm run build
```

---

## 📁 Loyiha arxitekturasi

```
Game-sub/
├── src/
│   ├── components/
│   │   ├── common/         # Badge, Modal, Lightbox, ScrollToTop
│   │   ├── game/           # GameCard
│   │   ├── home/           # Hero, Featured, WhyUs, HowItWorks, Community, Faq, Modals
│   │   └── layout/         # Navbar, Footer
│   ├── config/             # site.ts (Telegram link, matnlar)
│   ├── context/            # FavoritesContext (localStorage)
│   ├── data/               # games.ts, faqs.ts (DRF ga ulashga tayyor ma‘lumotlar qatlami)
│   ├── pages/              # Home, Catalog, GameDetail, Guide, About, Favorites, NotFound
│   ├── types/              # game.ts (TypeScript interfeyslari)
│   ├── App.tsx             # Marshrutlar va layout
│   ├── index.css           # Tailwind va maxsus gaming uslublari
│   └── main.tsx            # Ilova kirish nuqtasi
├── public/                 # Favicon va statik aktivlar
├── tailwind.config.js      # Gaming mavzusi va ranglar
└── package.json
```
