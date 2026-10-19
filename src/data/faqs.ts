export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'O‘rnatish' | 'Tarjima sifati' | 'Moslik' | 'Loyiha';
}

export const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Tarjima sifati',
    question: 'AI yordamida tarjima qilingan subtitrlar qanchalik sifatli?',
    answer: 'Biz oddiy tarjima vositalaridan emas, balki videoo‘yinlar konteksti, qahramonlarning xarakteri va o‘zbek tilining tabiiy so‘zlashuv mezonlariga moslashtirilgan ilg‘or AI modellaridan foydalanamiz. Shuningdek, tarjimadan so‘ng o‘yin terminlari, nomlar va frazalar qo‘lda tekshirilib, o‘yin ichida sinovdan o‘tkaziladi.'
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
    answer: 'A Plague Tale: Innocence va A Plague Tale: Requiem uchun barcha o‘zbekcha subtitrlar SubGame loyihasi tomonidan o‘zbek geymerlariga butunlay bepul taqdim etiladi. Ammo unutmang: o‘yinning o‘zini Steam yoki boshqa rasmiy do‘konlardan alohida xarid qilishingiz kerak.'
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
    answer: 'O‘yin rasmiy yangilanish olganida ba‘zan lokalizatsiya fayllari standart holatga qaytishi mumkin. Bunday hollarda subtitr faylini qayta o‘rnatish kifoya. Agar o‘yin versiyasi yangilanib fayllar strukturasi o‘zgarsa, biz saytimizda subtitrning yangilangan versiyasini e‘lon qilamiz.'
  },
  {
    id: 'faq-6',
    category: 'Loyiha',
    question: 'Qanday qilib o‘zim yoqtirgan o‘yinga o‘zbekcha subtitr taklif qilsam bo‘ladi?',
    answer: 'Bosh sahifadagi yoki menyudagi "Subtitr taklif qilish" tugmasini bosib, o‘yin nomini yozib qoldirishingiz mumkin. Eng ko‘p so‘ralgan o‘yinlar jamoamiz tomonidan navbatdagi tarjima rejasiga kiritiladi.'
  }
];
