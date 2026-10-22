import type { Game } from '../types/game';

export const GAMES_DATA: Game[] = [
  {
    id: 'a-plague-tale-requiem',
    slug: 'a-plague-tale-requiem',
    title: 'A Plague Tale: Requiem',
    cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/library_600x900.jpg',
    cardImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/header.jpg',
    heroImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/ss_9cbcd6b81cc32ecf75b36f40b92157da78a19598.1920x1080.jpg',
    gameplayVideoUrl: 'https://www.youtube.com/embed/3PTwPKnUYnY',
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
    price: 'Tekin',
    priceNote: 'O‘yin va o‘zbekcha subtitr SubGame platformasida bepul taqdim etiladi.',
    subtitleStatus: 'Tayyor',
    subtitleLanguage: 'O‘zbekcha (Lotin)',
    subtitleVersion: 'v1.0.0',
    subtitleLastUpdated: '2026-10-20',
    subtitleCompatibility: 'Steam, Epic Games Store va PC Game Pass (v1.6.0+)',
    subtitleFormat: 'SubGame Launcher himoyalangan lokalizatsiyasi',
    subtitleSize: '1.9 MB',
    subtitleDownloadUrl: '/launcher',
    subtitlePrice: 'Bepul',
    subtitleTranslationType: 'Professional adabiy tarjima',
    installationGuide: [
      {
        step: 1,
        title: 'SubGame Launcherni yuklab oling',
        description: 'Ushbu sahifadagi "Launcherni yuklab olish" tugmasi orqali dasturni kompyuteringizga saqlang. O‘rnatish talab etilmaydi.'
      },
      {
        step: 2,
        title: 'O‘yin ijro faylini (.exe) tanlang',
        description: 'Launcherni oching, A Plague Tale: Requiem kartasidagi "O‘ynash" tugmasini bosing va o‘rnatilgan papkadagi APlagueTaleRequiem_x64.exe faylini ko‘rsating.',
        pathOrCommand: 'SteamLibrary/steamapps/common/APlagueTaleRequiem/APlagueTaleRequiem_x64.exe'
      },
      {
        step: 3,
        title: 'Litsenziyani kiriting va o‘ynang',
        description: 'Litsenziya kalitini kiriting va "O‘yinni boshlash" tugmasini bosing. Subtitrlar avtomatik ulanadi va o‘yin o‘zbek tilida ochiladi!'
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
    tags: ['Hit o‘yin', 'Tarixiy', 'Boy syujet', 'O‘zbekcha subtitr'],
    defaultExeName: 'APlagueTaleRequiem_x64.exe',
    targetFileName: 'tt01.pc',
    targetRelativeDir: 'TRTEXT',
    keyPrefix: 'SUB-REQU',
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
      'https://www.subgame.uz/images/innocence/uzbek_sub_1.png',
      'https://www.subgame.uz/images/innocence/uzbek_sub_2.jpg',
      'https://www.subgame.uz/images/innocence/uzbek_sub_3.png',
      'https://www.subgame.uz/images/innocence/uzbek_sub_4.jpg',
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
    price: 'Tekin',
    priceNote: 'O‘yin va o‘zbekcha subtitr SubGame platformasida bepul taqdim etiladi.',
    subtitleStatus: 'Tayyor',
    subtitleLanguage: 'O‘zbekcha (Lotin)',
    subtitleVersion: 'v1.0.0',
    subtitleLastUpdated: '2026-10-20',
    subtitleCompatibility: 'Steam, Epic Games Store, GOG va barcha PC nashrlari',
    subtitleFormat: 'SubGame Launcher himoyalangan lokalizatsiyasi',
    subtitleSize: '1.1 MB',
    subtitleDownloadUrl: '/launcher',
    subtitlePrice: 'Bepul',
    subtitleTranslationType: 'To‘liq adabiy tahrirlangan',
    installationGuide: [
      {
        step: 1,
        title: 'SubGame Launcherni yuklab oling',
        description: 'Saytimizdan SubGame Launcher (.exe) dasturini yuklab oling. O‘rnatish shart emas, to‘g‘ridan-to‘g‘ri ochiladi.'
      },
      {
        step: 2,
        title: 'O‘yin ijro faylini (.exe) tanlang',
        description: 'Launcherdan A Plague Tale: Innocence o‘yinini oching va kompyuteringizdagi APlagueTaleInnocence_x64.exe faylini ko‘rsating.',
        pathOrCommand: 'SteamLibrary/steamapps/common/A Plague Tale Innocence/APlagueTaleInnocence_x64.exe'
      },
      {
        step: 3,
        title: '1 bosishda o‘zbek tilida o‘ynang',
        description: 'Faollashtirish kalitini kiriting va "O‘yinni boshlash" tugmasini bosing. Subtitrlar avtomatik ulanadi!'
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
    tags: ['Klassika', 'Yil o‘yini nomzodi', 'Inkvizitsiya', 'O‘zbekcha subtitr'],
    defaultExeName: 'APlagueTaleInnocence_x64.exe',
    targetFileName: 'tt01.pc',
    targetRelativeDir: 'TRTEXT',
    keyPrefix: 'SUB-INNO',
  },
  {
    id: 'a-plague-tale-legacy',
    slug: 'a-plague-tale-legacy',
    title: 'A Plague Tale: Legacy',
    cover: 'https://www.subgame.uz/images/legacy/cover.jpg',
    cardImage: 'https://www.subgame.uz/images/legacy/header.jpg',
    heroImage: 'https://www.subgame.uz/images/legacy/hero.jpg',
    gameplayVideoUrl: 'https://www.youtube.com/embed/L9M9aAjH02Y',
    screenshots: [
      'https://www.subgame.uz/images/legacy/ss_1.jpg',
      'https://www.subgame.uz/images/legacy/ss_2.jpg',
      'https://www.subgame.uz/images/legacy/ss_3.jpg',
      'https://www.subgame.uz/images/legacy/ss_4.jpg',
      'https://www.subgame.uz/images/legacy/ss_5.jpg',
      'https://www.subgame.uz/images/legacy/ss_6.jpg'
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
    priceNote: 'O‘yin chiqarilishi kutilmoqda, narxi tez kunda e’lon qilinadi.',
    subtitleStatus: 'Tez kunda',
    subtitleLanguage: 'O‘zbekcha (Lotin)',
    subtitleVersion: 'v1.0.0',
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
    tags: ['Premyera', 'Kutilmoqda', 'Sofiya', 'Tez kunda'],
    defaultExeName: 'Game.exe',
    keyPrefix: 'SUB-LEGA',
  },
  {
    id: 'outward-2',
    slug: 'outward-2',
    title: 'Outward 2',
    cover: 'https://www.subgame.uz/images/outward2/cover.jpg',
    cardImage: 'https://www.subgame.uz/images/outward2/header.jpg',
    heroImage: 'https://www.subgame.uz/images/outward2/hero.jpg',
    torrentUrl: 'https://itorrents-igruha.org/16725-outward-2.html',
    screenshots: [
      'https://www.subgame.uz/images/outward2/ss_1.jpg',
      'https://www.subgame.uz/images/outward2/ss_2.jpg',
      'https://www.subgame.uz/images/outward2/ss_3.jpg',
      'https://www.subgame.uz/images/outward2/ss_4.jpg'
    ],
    shortDescription: 'Mashhur hardcore RPG ning uzoq kutilgan davomi. Sehr-jodu, xavfli maxluqlar, omon qolish sinovlari va unutilmas sarguzashtlarga boy ochiq dunyo.',
    fullDescription: 'Outward 2 — Nine Dots Studio tomonidan yaratilayotgan betakror hardcore Action-RPG o‘yini. Birinchi qismning barcha o‘ziga xos jihatlari — xalta ko‘tarib sayohat qilish, murakkab va jiddiy sehr tizimi, tabiat injiqliklari va jarohatlar bilan omon qolish sinovlari yangilangan ilg‘or grafik dvigatel va takomillashgan jang mexanikasi bilan qaytmoqda. Bu yerda siz tanlangan qahramon emassiz, balki o‘z yo‘lini o‘zi tanlaydigan oddiy sayohatchisiz. Har bir harakatingiz va qaroringiz o‘yin olamiga jiddiy ta‘sir ko‘rsatadi. SubGame jamoasi ayni paytda Outward 2 o‘yinining to‘liq o‘zbekcha subtitrlari ustida faol ish olib bormoqda.',
    releaseYear: 2026,
    developer: 'Nine Dots Studio',
    publisher: 'Nine Dots Publishing',
    genres: ['RPG', 'Omon qolish', 'Sarguzasht', 'Action'],
    platforms: ['PC'],
    officialStoreLinks: [
      {
        name: 'Steam',
        url: 'https://store.steampowered.com/app/2849490/Outward_2/',
        priceNote: 'Steam rasmiy sahifasi'
      }
    ],
    price: 'Tekin',
    priceNote: 'O‘yin va o‘zbekcha subtitr SubGame platformasida bepul taqdim etiladi.',
    subtitleStatus: 'Tayyor',
    subtitleLanguage: 'O‘zbekcha (Lotin)',
    subtitleVersion: 'v1.0.0',
    subtitleLastUpdated: '2026-10-21',
    subtitleCompatibility: 'Steam Playtest va barcha PC nashrlari',
    subtitleFormat: 'SubGame Launcher himoyalangan lokalizatsiyasi (.pak)',
    subtitleSize: '1.5 MB',
    subtitleDownloadUrl: '/launcher',
    subtitlePrice: 'Bepul',
    subtitleTranslationType: 'To‘liq o‘zbekcha interfeys va dialoglar',
    installationGuide: [
      {
        step: 1,
        title: 'SubGame Launcherni oching',
        description: 'Kompyuteringizda SubGame Launcherni ishga tushiring.'
      },
      {
        step: 2,
        title: 'O‘yin ijro faylini (otw2_ue.exe) tanlang',
        description: 'Outward 2 kartasidagi "O‘ynash" tugmasini bosing va o‘rnatilgan papkadagi otw2_ue.exe faylini ko‘rsating.',
        pathOrCommand: 'Outward.2.Playtest/otw2_ue.exe'
      },
      {
        step: 3,
        title: 'O‘yinni boshlash',
        description: '"O‘yinni boshlash" tugmasini bosing. SubGame o‘zbekcha subtitr paketini avtomatik ulaydi va o‘yin to‘liq o‘zbek tilida ochiladi!'
      }
    ],
    knownIssues: [
      'O‘yin dialoglarida to‘liq ovozli aktyorlik mavjud emas (original o‘yin dizayni bo‘yicha dialoglar faqat matnli subtitr ko‘rinishida ishlaydi).'
    ],
    minimumRequirements: {
      os: 'Windows 10 (64-bit)',
      processor: 'Intel Core i5-6600K / AMD Ryzen 5 1600',
      memory: '16 GB RAM',
      graphics: 'GeForce GTX 1060 / Radeon RX 580',
      directX: 'Versiya 12',
      storage: '40 GB bo‘sh joy',
      additionalNotes: 'Minimal 1080p 30 FPS sozlamalari uchun.'
    },
    recommendedRequirements: {
      os: 'Windows 11 (64-bit)',
      processor: 'Intel Core i7-10700K / AMD Ryzen 7 3700X',
      memory: '16 GB RAM',
      graphics: 'GeForce RTX 3060 / Radeon RX 6600 XT',
      directX: 'Versiya 12',
      storage: 'SSD tavsiya etiladi (40 GB)',
      additionalNotes: '1080p 60 FPS yuqori sifatli tajriba uchun.'
    },
    isFeatured: true,
    tags: ['RPG', 'Omon qolish', 'Tayyor', 'Yangi', 'O‘zbekcha subtitr'],
    defaultExeName: 'otw2_ue.exe',
    targetFileName: 'otw2_ue-Windows_Uzbek_P.pak',
    targetRelativeDir: 'otw2_ue/Content/Paks',
    keyPrefix: 'SUB-OUTW',
  },
  {
    id: 'resident-evil-2-remake',
    slug: 'resident-evil-2-remake',
    title: 'Resident Evil 2 Remake',
    cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/library_600x900.jpg',
    cardImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/header.jpg',
    heroImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/ss_1392581cd29817e44099cf05416b70ffb159c58b.1920x1080.jpg',
    gameplayVideoUrl: 'https://www.youtube.com/embed/u3wS-Q2KBpk',
    torrentUrl: 'https://itorrents-igruha.org/168-resident-evil-2-remake.html',
    screenshots: [
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/ss_1392581cd29817e44099cf05416b70ffb159c58b.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/ss_153bd5afa0b45e74b0242a3805dc29aab9f1685e.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/ss_cb998634747b70bbcf2dba34a2aef34808d039bf.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/ss_cd289d2e809b3fcb236a4f193a43a16787c6bc87.1920x1080.jpg',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/ss_bfbd61cde09efcfa36f6bc0b976b1ce5fda77bfe.1920x1080.jpg'
    ],
    shortDescription: 'Rakkun-Siti (Raccoon City)dagi dahshatli biologik falokat. Yosh politsiyachi Leon Kennedi va talaba Kler Redfild halokat yoqasidagi zombi to‘la shaharda tirik qolish uchun kurashadi.',
    fullDescription: '1998-yil sentyabr. Rakkun-Siti shahrida yuz bergan halokatli virus tarqalishi aholini qonga tashna zombilarga aylantiradi. Shaharga birinchi ish kunida kelgan yangi politsiyachi Leon S. Kennedi va bedarak yo‘qolgan akasini qidirayotgan talaba Kler Redfild kutilmaganda dahshatli qabristonga aylangan Rakkun politsiya mahkamasida o‘zlarini ko‘radilar. Capcom kompaniyasining ilg‘or RE Engine dvigatelida qayta yaratilgan o‘yin zamonaviy vizual ko‘rinish, dahshatli atmosfera, cheklangan o‘q-dorilar va murakkab boshqotirmalarni o‘z ichiga oladi. SubGame jamoasi hozirda ushbu durdona o‘yin uchun to‘liq o‘zbekcha subtitrlarni faol tarjima qilmoqda!',
    releaseYear: 2019,
    developer: 'Capcom',
    publisher: 'Capcom',
    genres: ['Qo‘rqinchli (Horror)', 'Omon qolish', 'Action', 'Zombi'],
    platforms: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One'],
    officialStoreLinks: [
      {
        name: 'Steam',
        url: 'https://store.steampowered.com/app/883710/Resident_Evil_2/',
        priceNote: 'Steam rasmiy sahifasi'
      }
    ],
    price: 'Tez kunda',
    priceNote: 'O‘yin subtitrlari tayyorlanmoqda, narxi tez kunda e’lon qilinadi.',
    subtitleStatus: 'Jarayonda',
    subtitleLanguage: 'O‘zbekcha (Lotin)',
    subtitleVersion: 'v0.5.0 (Beta)',
    subtitleLastUpdated: '2026-10-22',
    subtitleCompatibility: 'Steam, Epic Games va barcha PC nashrlari',
    subtitleFormat: 'SubGame Launcher himoyalangan lokalizatsiyasi (.pak)',
    subtitleSize: '15 MB',
    subtitleDownloadUrl: '/launcher',
    subtitlePrice: 'Tez kunda',
    subtitleTranslationType: 'To‘liq adabiy o‘zbekcha tarjima',
    installationGuide: [
      {
        step: 1,
        title: 'Tarjima jarayoni',
        description: 'Hozirda SubGame jamoasi tomonidan o‘yin dialoglari, eslatmalar va foydalanuvchi interfeysi matnlari o‘zbek tiliga o‘girilmoqda.'
      },
      {
        step: 2,
        title: 'Launcherdan 1 bosishda o‘rnatish',
        description: 'Subtitr tayyor bo‘lishi bilan SubGame Launcherda avtomatik faollashadi va birgina bosish orqali o‘yiningizga ulanadi.'
      }
    ],
    knownIssues: [
      'Subtitrlar ayni vaqtda faol tarjima va testdan o‘tkazish bosqichida.'
    ],
    minimumRequirements: {
      os: 'Windows 10 (64-bit)',
      processor: 'Intel Core i5-4460 / AMD FX-6300',
      memory: '8 GB RAM',
      graphics: 'NVIDIA GeForce GTX 760 / AMD Radeon R7 260x (2GB)',
      directX: 'Versiya 11',
      storage: '26 GB bo‘sh joy',
      additionalNotes: '1080p 30 FPS sozlamalari uchun.'
    },
    recommendedRequirements: {
      os: 'Windows 10/11 (64-bit)',
      processor: 'Intel Core i7-3770 / AMD FX-9590',
      memory: '8 GB RAM',
      graphics: 'NVIDIA GeForce GTX 1060 / AMD Radeon RX 480 (3GB)',
      directX: 'Versiya 12',
      storage: '26 GB bo‘sh joy',
      additionalNotes: '1080p 60 FPS silliq va sifatli o‘yin tajribasi uchun.'
    },
    isFeatured: true,
    tags: ['Horror', 'Jarayonda', 'Capcom', 'Zombi', 'Leon Kennedy'],
    defaultExeName: 're2.exe',
    targetFileName: 're_chunk_000.pak.patch_001.pak',
    targetRelativeDir: '',
    keyPrefix: 'SUB-RE2R',
  }
];

export const GENRES = [
  'Barchasi',
  'Sarguzasht',
  'Action',
  'Stealth',
  'RPG',
  'Omon qolish',
  'Qo‘rqinchli (Horror)',
  'Dramatik hikoya',
  'Tarixiy drama'
];

export const SUBTITLE_STATUSES: { label: string; value: string }[] = [
  { label: 'Barcha holatlar', value: 'Barchasi' },
  { label: 'Tayyor (Yuklab olish mumkin)', value: 'Tayyor' },
  { label: 'Jarayonda (Ishlanmoqda)', value: 'Jarayonda' },
  { label: 'Tez kunda (Kutilmoqda)', value: 'Tez kunda' }
];
