import type { Game } from '../types/game';

export const GAMES_DATA: Game[] = [
  {
    id: 'a-plague-tale-requiem',
    slug: 'a-plague-tale-requiem',
    title: 'A Plague Tale: Requiem',
    cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/library_600x900.jpg',
    cardImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/header.jpg',
    heroImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/ss_9cbcd6b81cc32ecf75b36f40b92157da78a19598.1920x1080.jpg',
    torrentUrl: 'https://itorrents-igruha.org/7079-a-plague-tale-requiem.html',
    screenshots: [
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/ss_9cbcd6b81cc32ecf75b36f40b92157da78a19598.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/ss_1429300fd4c86bac7a5abfd31c3e14a4115bf641.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/ss_a8ce48e34efa5b0bbb4fbe6efa601ed7a33f6c23.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/ss_3a36ec0873d4c9be584c99a2a62a41e712bb5e6a.1920x1080.jpg'
    ],
    shortDescription: 'Amitsiya va Gyugoning vabo epidemiyasi va qora kalamushlar qurshovidagi ta‘sirli, dramatik sarguzashtining davomi. Janubiy Fransiyaning sehrli, ammo xavfli go‘shalarida omon qolish kurashi.',
    fullDescription: 'Vatanlaridan qochib qutulgan Amitsiya va Gyugo janub tomon — yangi mintaqalar va gavjum shaharlarga yo‘l oladilar. U yerda yangi hayot boshlashga va Gyugoning la‘natini nazorat ostiga olishga harakat qiladilar. Biroq, Gyugoning kuchi qayta uyg‘onganda, o‘lim va vayronagarchilik kalamushlar to‘dasi shaklida yana qaytadi. O‘z ukasini qutqarish uchun boshqa iloj qolmagan birodarlar afsonaviy orolga — Gyugoning najot kaliti bo‘lishi mumkin bo‘lgan manzilga yashirincha yo‘l oladilar.',
    releaseYear: 2022,
    developer: 'Asobo Studio',
    publisher: 'Focus Entertainment',
    genres: ['Sarguzasht', 'Action', 'Stealth', 'Dramatik hikoya'],
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S'],
    officialStoreLinks: [
      {
        name: 'Steam',
        url: 'https://store.steampowered.com/app/1182900/A_Plague_Tale_Requiem/',
        priceNote: 'Narx do‘konda rasmiy valyutada ko‘rsatiladi'
      },
      {
        name: 'Epic Games',
        url: 'https://store.epicgames.com/p/a-plague-tale-requiem',
        priceNote: 'Epic Games rasmiy do‘koni'
      }
    ],
    price: 'Do‘konda tekshirish',
    priceNote: 'O‘yin narxi rasmiy platformalarda alohida belgilanadi. O‘zbekcha subtitr esa SubGame loyihasi tomonidan bepul taqdim etiladi.',
    subtitleStatus: 'Tayyor',
    subtitleLanguage: 'O‘zbekcha (Lotin)',
    subtitleVersion: 'v1.0.2',
    subtitleLastUpdated: '2026-10-20',
    subtitleCompatibility: 'Steam, Epic Games Store va PC Game Pass (v1.6.0+)',
    subtitleFormat: '.pc lokalizatsiya fayli (tt01.pc)',
    subtitleSize: '1.9 MB',
    subtitleDownloadUrl: '/downloads/requiem/tt01.pc',
    subtitlePrice: 'Bepul',
    subtitleTranslationType: 'Professional adabiy tarjima',
    installationGuide: [
      {
        step: 1,
        title: 'tt01.pc subtitr faylini yuklab oling',
        description: 'Ushbu sahifadagi "Subtitrni yuklab olish" tugmasi orqali A Plague Tale: Requiem uchun tt01.pc o‘zbekcha lokalizatsiya faylini shaxsiy kompyuteringizga saqlang.'
      },
      {
        step: 2,
        title: 'O‘yin o‘rnatilgan papkani oching',
        description: 'Steam kutubxonasida A Plague Tale: Requiem ustiga o‘ng tugmani bosing -> "Boshqarish (Manage)" -> "Lokal fayllarni ko‘rish (Browse local files)" bo‘limini tanlang.',
        pathOrCommand: 'SteamLibrary/steamapps/common/APlagueTaleRequiem/'
      },
      {
        step: 3,
        title: 'tt01.pc faylini nusxalang va almashtiring',
        description: 'Yuklab olingan tt01.pc faylini o‘yin o‘rnatilgan papkaga ko‘chirib o‘tkazing va mavjud fayl ustiga almashtirishni ("Replace the file in the destination") tasdiqlang.',
        note: 'Eslatma: Har ehtimolga qarshi asl inglizcha tt01.pc faylining zaxira (backup) nusxasini saqlab qo‘yish tavsiya etiladi.'
      },
      {
        step: 4,
        title: 'O‘yinda subtitrni faollashtiring',
        description: 'O‘yinni ishga tushiring. "Sozlamalar (Settings)" -> "Audio/Grafika" -> "Subtitrlar (Subtitles)" bo‘limidan subtitrni yoqing va o‘zbekcha dialoglardan bahramand bo‘ling!'
      }
    ],
    knownIssues: [
      'Ba‘zi tezkor dialoglarda subtitr vaqti (timing) soniyaning yuzdan bir qismiga o‘zgarishi mumkin.',
      'O‘yin ichidagi ba‘zi maxsus belgilar (UI ikonkalari) original ingliz tilida qoldirilgan.'
    ],
    minimumRequirements: {
      os: 'Windows 10 (20H1 64-bit)',
      processor: 'Intel Core i5-4690K (3.5 GHz) / AMD FX-8300 (3.3 GHz)',
      memory: '16 GB RAM',
      graphics: '4 GB, GeForce GTX 970 / Radeon RX 590',
      directX: 'Versiya 12',
      storage: '55 GB bo‘sh joy',
      additionalNotes: 'Minimal 1080p 30 FPS sozlamalari uchun mo‘ljallangan.'
    },
    recommendedRequirements: {
      os: 'Windows 10 / 11 (64-bit)',
      processor: 'Intel Core i7-8700K (3.7 GHz) / AMD Ryzen 5 3600 (3.6 GHz)',
      memory: '16 GB RAM',
      graphics: '8 GB, GeForce RTX 3070 / Radeon RX 6800 XT',
      directX: 'Versiya 12',
      storage: '55 GB bo‘sh joy (SSD tavsiya etiladi)',
      additionalNotes: '1080p 60 FPS va ultra grafik sozlamalari uchun tavsiya qilinadi.'
    },
    isFeatured: true,
    tags: ['Hit o‘yin', 'Tarixiy', 'Boy syujet', 'O‘zbekcha subtitr']
  },
  {
    id: 'a-plague-tale-innocence',
    slug: 'a-plague-tale-innocence',
    title: 'A Plague Tale: Innocence',
    cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/library_600x900.jpg',
    cardImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/header.jpg',
    heroImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/ss_8433438bf03b7f524e6cf3ac81e99e96be2188c8.1920x1080.jpg',
    torrentUrl: 'https://itorrents-igruha.org/2035-a-plague-tale-innocence.html',
    screenshots: [
      '/images/innocence/uzbek_sub_1.png',
      '/images/innocence/uzbek_sub_2.jpg',
      '/images/innocence/uzbek_sub_3.png',
      '/images/innocence/uzbek_sub_4.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/ss_8775c109d7303faf8aa94c532905107b75064d48.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/ss_8433438bf03b7f524e6cf3ac81e99e96be2188c8.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/ss_a1025722ac0dce88a3e63e88a34352fb73a403db.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/ss_d61367be06a8f92ca4331e58bd51dc1b45c9984a.1920x1080.jpg'
    ],
    shortDescription: '1349-yil. Fransiyada vabo epidemiyasi va inkvizitsiya avjida. Yosh Amitsiya va uning ukasi Gyugo shafqatsiz taqdir changalida omon qolish uchun jangga kirishadilar.',
    fullDescription: 'Tarixning eng qorong‘i davrlaridan biri bo‘lgan Yuz yillik urush davridagi Fransiyaga sayohat qiling. Inkivizitsiya askarlari tomonidan quvg‘in qilingan va hech qachon to‘ymaydigan kalamushlar to‘dasi bilan o‘ralgan Amitsiya va Gyugo bir-birlarini tushunishni va ishonishni o‘rganadilar. Qiyinchiliklarga qaramay, ular bu zolim dunyoda omon qolish va o‘z taqdirlari ortidagi sirni ochish uchun kurashadilar.',
    releaseYear: 2019,
    developer: 'Asobo Studio',
    publisher: 'Focus Home Interactive',
    genres: ['Sarguzasht', 'Action', 'Stealth', 'Tarixiy drama'],
    platforms: ['PC', 'PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S'],
    officialStoreLinks: [
      {
        name: 'Steam',
        url: 'https://store.steampowered.com/app/752590/A_Plague_Tale_Innocence/',
        priceNote: 'Steam rasmiy sahifasi'
      },
      {
        name: 'GOG',
        url: 'https://www.gog.com/en/game/a_plague_tale_innocence',
        priceNote: 'DRM-free versiyasi'
      }
    ],
    price: 'Do‘konda tekshirish',
    priceNote: 'O‘yin rasmiy do‘konlardan xarid qilinadi. O‘zbekcha subtitr to‘plami bepul yuklab olinadi.',
    subtitleStatus: 'Tayyor',
    subtitleLanguage: 'O‘zbekcha (Lotin)',
    subtitleVersion: 'v1.2.0',
    subtitleLastUpdated: '2026-10-20',
    subtitleCompatibility: 'Steam, Epic Games Store, GOG va barcha PC nashrlari',
    subtitleFormat: '.pc lokalizatsiya fayli (tt01.pc)',
    subtitleSize: '1.1 MB',
    subtitleDownloadUrl: '/downloads/innocence/tt01.pc',
    subtitlePrice: 'Bepul',
    subtitleTranslationType: 'To‘liq adabiy tahrirlangan',
    installationGuide: [
      {
        step: 1,
        title: 'tt01.pc subtitr faylini yuklab oling',
        description: 'Ushbu sahifadagi "Subtitrni yuklab olish" tugmasi orqali tt01.pc o‘zbekcha lokalizatsiya faylini kompyuteringizga saqlang.'
      },
      {
        step: 2,
        title: 'O‘yin o‘rnatilgan papkani oching',
        description: 'Steam kutubxonasida "A Plague Tale: Innocence" ustiga o‘ng tugmani bosing -> "Boshqarish (Manage)" -> "Lokal fayllarni ko‘rish (Browse local files)" bo‘limini tanlang.',
        pathOrCommand: 'SteamLibrary/steamapps/common/A Plague Tale Innocence/'
      },
      {
        step: 3,
        title: 'tt01.pc faylini nusxalang va almashtiring',
        description: 'Yuklab olingan tt01.pc faylini o‘yin o‘rnatilgan papkaga ko‘chirib o‘tkazing va mavjud fayl ustiga almashtirishni ("Replace the file in the destination") tasdiqlang.',
        note: 'Eslatma: Asl inglizcha tt01.pc faylining zaxira nusxasini (backup) saqlab qo‘yishingiz mumkin.'
      },
      {
        step: 4,
        title: 'O‘yinda subtitrni faollashtiring',
        description: 'O‘yinga kiring, "Sozlamalar (Options)" -> "Audio" -> "Subtitrlar (Subtitles)" bo‘limidan subtitrlarni yoqing va o‘zbekcha dialoglardan bahramand bo‘ling!'
      }
    ],
    knownIssues: [
      'DLC yoki qo‘shimcha kostyumlar tavsifida ayrim jumlalar ingliz tilida qolgan bo‘lishi mumkin.'
    ],
    minimumRequirements: {
      os: 'Windows 7/8/10 (64-bit)',
      processor: 'Intel Core i3-2120 (3.3 GHz) / AMD FX-4100 X4 (3.6 GHz)',
      memory: '8 GB RAM',
      graphics: '2 GB, GeForce GTX 660 / Radeon HD 7870',
      directX: 'Versiya 11',
      storage: '50 GB bo‘sh joy',
      additionalNotes: 'Minimal grafik sozlamalari va 720p/1080p 30 FPS uchun.'
    },
    recommendedRequirements: {
      os: 'Windows 10 (64-bit)',
      processor: 'Intel Core i5-4690 (3.5 GHz) / AMD FX-8300 (3.3 GHz)',
      memory: '16 GB RAM',
      graphics: '4 GB, GeForce GTX 970 / Radeon RX 480',
      directX: 'Versiya 11',
      storage: '50 GB bo‘sh joy',
      additionalNotes: '1080p 60 FPS sifatli tajriba uchun.'
    },
    isFeatured: true,
    tags: ['Klassika', 'Yil o‘yini nomzodi', 'Inkvizitsiya', 'O‘zbekcha subtitr']
  },
  {
    id: 'a-plague-tale-legacy',
    slug: 'a-plague-tale-legacy',
    title: 'A Plague Tale: Legacy',
    cover: '/images/legacy/cover.jpg',
    cardImage: '/images/legacy/header.jpg',
    heroImage: '/images/legacy/hero.jpg',
    screenshots: [
      '/images/legacy/ss_1.jpg',
      '/images/legacy/ss_2.jpg',
      '/images/legacy/ss_3.jpg',
      '/images/legacy/ss_4.jpg',
      '/images/legacy/ss_5.jpg',
      '/images/legacy/ss_6.jpg'
    ],
    shortDescription: 'Mashhur A Plague Tale olamining yangi sahifasi. Jasur kontrabandachi Sofiya (Sophia) ning Requiem voqealaridan 15 yil avvalgi xavfli, jangovar va sirli sarguzashtlari.',
    fullDescription: 'Resonance: A Plague Tale Legacy — Asobo Studio va Focus Entertainment tomonidan yaratilgan yangi rasmiy sarguzasht. O‘yin A Plague Tale: Requiem voqealaridan 15 yil oldin bo‘lib o‘tadi va bosh qahramon sifatida jasur kontrabandachi ayol Sofiya (Sophia) gavdalanadi. U afsonaviy Minotavr oroli (Krit)ga yo‘l olib, o‘zining o‘tmishidan qochishga va qadimiy Makula la‘natining sirli ildizlarini ochishga intiladi. Yangilangan jang mexanikasi (xanjarlar, qilichlar, parriylar) va ekshn-sarguzasht uslubi bilan boyitilgan ushbu o‘yin uchun o‘zbekcha subtitrlar tez kunda SubGame platformasida taqdim etiladi.',
    releaseYear: 2026,
    developer: 'Asobo Studio',
    publisher: 'Focus Entertainment',
    genres: ['Sarguzasht', 'Action', 'Jangari', 'Tarixiy drama'],
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S'],
    officialStoreLinks: [
      {
        name: 'Steam',
        url: 'https://store.steampowered.com/app/2713000/Resonance_A_Plague_Tale_Legacy/',
        priceNote: 'Steam rasmiy do‘koni sahifasi'
      }
    ],
    price: 'Tez kunda',
    priceNote: 'O‘yin rasmiy sotuvga chiqishi bilan uning o‘zbekcha subtitri SubGame platformasida bepul taqdim etiladi.',
    subtitleStatus: 'Tez kunda',
    subtitleLanguage: 'O‘zbekcha (Lotin)',
    subtitleVersion: 'v1.0 (Tez kunda)',
    subtitleLastUpdated: 'Kutilmoqda',
    subtitleCompatibility: 'Steam, Epic Games va PC platformalari',
    subtitleFormat: 'ZIP (.locres matn lokalizatsiyasi)',
    subtitleSize: 'Kutilmoqda',
    subtitleDownloadUrl: '',
    subtitlePrice: 'Tez kunda',
    subtitleTranslationType: 'Kutilmoqda (Adabiy tahrir)',
    installationGuide: [
      {
        step: 1,
        title: 'O‘yin anonsi va chiqarilishi',
        description: 'Asobo Studio va Focus Entertainment tomonidan o‘yin rasman chiqarilishi kutilmoqda.'
      },
      {
        step: 2,
        title: 'Subtitr tayyorlanishi',
        description: 'O‘yin chiqarilishi bilan SubGame jamoasi o‘zbekcha subtitrlarni tezkorlik bilan mahalliylashtiradi va saytga yuklaydi.'
      }
    ],
    knownIssues: [
      'O‘yin hozirda tayyorlanish bosqichida.'
    ],
    minimumRequirements: {
      os: 'Windows 10 / 11 (64-bit)',
      processor: 'Intel Core i5 (10-avlod) / AMD Ryzen 5',
      memory: '16 GB RAM',
      graphics: 'GeForce RTX 2060 / Radeon RX 5600 XT',
      directX: 'Versiya 12',
      storage: '60 GB bo‘sh joy',
      additionalNotes: 'Minimal 1080p sozlamalari uchun mo‘ljallangan.'
    },
    recommendedRequirements: {
      os: 'Windows 11 (64-bit)',
      processor: 'Intel Core i7 (12-avlod) / AMD Ryzen 7',
      memory: '16 GB RAM',
      graphics: 'GeForce RTX 3070 / Radeon RX 6700 XT',
      directX: 'Versiya 12',
      storage: 'SSD (Tezkor xotira tavsiya etiladi)',
      additionalNotes: 'Ultra grafik sozlamalari va nurlar treysingi (Ray Tracing) uchun.'
    },
    isFeatured: true,
    tags: ['Premyera', 'Kutilmoqda', 'Sofiya', 'Tez kunda']
  }
];

export const GENRES = [
  'Barchasi',
  'Sarguzasht',
  'Action',
  'Stealth',
  'Dramatik hikoya',
  'Tarixiy drama'
];

export const SUBTITLE_STATUSES: { label: string; value: string }[] = [
  { label: 'Barcha holatlar', value: 'Barchasi' },
  { label: 'Tayyor (Yuklab olish mumkin)', value: 'Tayyor' },
  { label: 'Tez kunda (Kutilmoqda)', value: 'Tez kunda' }
];
