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
    subtitleLastUpdated: '2025-02-15',
    subtitleCompatibility: 'Steam, Epic Games Store va PC Game Pass (v1.6.0+)',
    subtitleFormat: 'ZIP (.locres matn lokalizatsiyasi paketi)',
    subtitleSize: '28.6 MB',
    subtitleDownloadUrl: '#download-requiem-sub',
    subtitlePrice: 'Bepul',
    subtitleTranslationType: 'AI + Qo‘lda tekshirilgan',
    installationGuide: [
      {
        step: 1,
        title: 'Subtitr arxivini yuklab oling',
        description: 'Ushbu sahifadagi "Subtitrni yuklab olish" tugmasi orqali o‘zbekcha lokalizatsiya ZIP arxivini shaxsiy kompyuteringizga saqlang.'
      },
      {
        step: 2,
        title: 'O‘yin o‘rnatilgan papkani oching',
        description: 'Steam kutubxonasida A Plague Tale: Requiem ustiga o‘ng tugmani bosing -> "Boshqarish (Manage)" -> "Lokal fayllarni ko‘rish (Browse local files)" bo‘limini tanlang.',
        pathOrCommand: 'SteamLibrary/steamapps/common/APlagueTaleRequiem/'
      },
      {
        step: 3,
        title: 'Fayllarni almashtirish (yoki qo‘shish)',
        description: 'Yuklab olingan arxiv ichidagi `Content` yoki `Localization` papkasini o‘yinning asosiy papkasiga ko‘chirib o‘tkazing va kerak bo‘lsa almashtirishni tasdiqlang.',
        note: 'Eslatma: Har ehtimolga qarshi asl inglizcha til faylining zaxira (backup) nusxasini saqlab qo‘yish tavsiya etiladi.'
      },
      {
        step: 4,
        title: 'O‘yinda subtitrni faollashtiring',
        description: 'O‘yinni ishga tushiring. "Sozlamalar (Settings)" -> "Audio/Grafika" -> "Subtitrlar (Subtitles)" bo‘limidan subtitrni yoqing.'
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
    tags: ['Hit o‘yin', 'Tarixiy', 'Boy syujet', 'AI Tarjima']
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
    subtitleLastUpdated: '2025-01-20',
    subtitleCompatibility: 'Steam, Epic Games Store va GOG PC nashrlari',
    subtitleFormat: 'ZIP (.loc va matn fayllari)',
    subtitleSize: '14.2 MB',
    subtitleDownloadUrl: '#download-innocence-sub',
    subtitlePrice: 'Bepul',
    subtitleTranslationType: 'AI yordamida (Kontekstual tahrirlangan)',
    installationGuide: [
      {
        step: 1,
        title: 'Subtitr faylini yuklab oling',
        description: 'Tegishli tugmani bosib Innocence o‘yini uchun o‘zbekcha subtitr ZIP faylini yuklab oling.'
      },
      {
        step: 2,
        title: 'O‘yin o‘rnatilgan papkani toping',
        description: 'O‘yin joylashgan bosh papkaga o‘ting.',
        pathOrCommand: 'C:/Program Files (x86)/Steam/steamapps/common/A Plague Tale Innocence/'
      },
      {
        step: 3,
        title: 'Arxivni ochish va nusxalash',
        description: 'Arxiv ichidagi fayllarni o‘yin o‘rnatilgan papkadagi mos papkalarga nusxalang. Fayllarni almashtirish so‘ralsa, "Ha (Yes)" deb belgilang.'
      },
      {
        step: 4,
        title: 'O‘yinda tilni sozlash',
        description: 'O‘yinga kiring, Options -> Audio -> Subtitles yoqilganligini tekshiring va tilni Inglizcha/O‘zbekcha sifatida tanlang.'
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
    tags: ['Klassika', 'Yil o‘yini nomzodi', 'Inkvizitsiya', 'AI Tarjima']
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
  { label: 'Tayyor (Yuklab olish mumkin)', value: 'Tayyor' }
];
