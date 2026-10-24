export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'O‘rnatish' | 'Tarjima sifati' | 'Moslik' | 'Loyiha' | 'Launcher';
}

export const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-launcher',
    category: 'Launcher',
    question: 'SubGame Launcher nima va u nima uchun kerak?',
    answer: 'SubGame Launcher — videoo‘yinlarga o‘zbekcha subtitrlarni qo‘lda fayl ko‘chirib o‘tirmasdan, 1 bosishda o‘rnatish, litsenziyalarni boshqarish va o‘yinni to‘g‘ridan-to‘g‘ri ishga tushirish uchun yaratilgan rasmiy dastur. U o‘yin asl fayllarini shikastlamaydi va yangilanishlarda xavfsiz ishlaydi.'
  },
  {
    id: 'faq-1',
    category: 'Tarjima sifati',
    question: 'O‘zbekcha subtitrlar qanchalik sifatli va aniq tarjima qilingan?',
    answer: 'Biz videoo‘yinlar konteksti, qahramonlarning xarakteri va o‘zbek tilining tabiiy so‘zlashuv mezonlariga katta e’tibor qaratamiz. O‘yin terminlari, nomlar va frazalar sinchkovlik bilan tekshirilib, o‘yin ichida to‘liq sinovdan o‘tkaziladi.'
  },
  {
    id: 'faq-2',
    category: 'O‘rnatish',
    question: 'Subtitrni o‘rnatish uchun o‘yinni buzish (crack qilish) kerakmi?',
    answer: 'Yo‘q! Bizning barcha subtitrlarimiz o‘yinning rasmiy litsenziyalangan (Steam, Epic Games, GOG, PC Game Pass) nusxalariga ham xavfsiz o‘rnatiladi. Ular o‘yinning til yoki lokalizatsiya resurslariga mod sifatida qo‘shiladi va o‘yin litsenziyasiga hech qanday zarar yetkazmaydi.'
  },
  {
    id: 'faq-3',
    category: 'Loyiha',
    question: 'O‘zbekcha subtitrlarni yuklab olish pullikmi?',
    answer: 'SubGame platformasida ko‘plab o‘yinlar uchun o‘zbekcha subtitrlar mutlaqo bepul taqdim etiladi. Katta hajmli va murakkab loyihalar uchun esa hamyonbop litsenziyalar mavjud bo‘lib, ularni Click to‘lov tizimi yoki Telegram bot orqali 1 daqiqada faollashtirish mumkin. Olingan litsenziya shaxsiy kompyuteringizga abadiy biriktiriladi.'
  },
  {
    id: 'faq-4',
    category: 'Moslik',
    question: 'PlayStation yoki Xbox konsollarida o‘zbekcha subtitrlardan foydalanish mumkinmi?',
    answer: 'Hozirgi vaqtda konsollarning yopiq operatsion tizimi fayllarni erkin o‘zgartirishga ruxsat bermaydi. Shuning uchun subtitrlarimiz hozircha faqat PC (Windows) platformasi uchun mo‘ljallangan. Agar kelajakda konsollar uchun modlarni qo‘llab-quvvatlash imkoni paydo bo‘lsa, albatta taqdim etamiz.'
  },
  {
    id: 'faq-5',
    category: 'O‘rnatish',
    question: 'Agar o‘yin yangilansa (update kelsa), subtitrlar o‘chib ketadimi?',
    answer: 'SubGame Launcher ishlatilsa, dastur avtomatik tarzda o‘yin bilan bog‘lanadi va yangilanishdan so‘ng ham 1-klikda qayta ishga tushirish imkonini beradi. Qo‘lda o‘rnatilgan bo‘lsa, o‘yin fayllari yangilangach lokalizatsiyani qayta nusxalash kifoya.'
  },
  {
    id: 'faq-smartscreen',
    category: 'Launcher',
    question: 'Windows SmartScreen «Himoyalanmagan dastur» deb ogohlantirsa nima qilish kerak?',
    answer: 'SubGame mustaqil loyiha bo‘lgani sababli Windows yangi yuklab olingan dasturni ilk marta ochganda standart ogohlantirish berishi mumkin. Oynadagi «Подробнее (More info)» tugmasini bosing va «Выполнить в любом случае (Run anyway)»ni tanlang. Dastur 100% toza va xavfsiz.'
  },
  {
    id: 'faq-6',
    category: 'Loyiha',
    question: 'Qanday qilib o‘zim yoqtirgan o‘yinga o‘zbekcha subtitr taklif qilsam bo‘ladi?',
    answer: 'Bosh sahifadagi yoki menyudagi "Subtitr taklif qilish" tugmasini bosib, o‘yin nomini yozib qoldirishingiz mumkin. Eng ko‘p so‘ralgan o‘yinlar jamoamiz tomonidan navbatdagi tarjima rejasiga kiritiladi.'
  }
];
