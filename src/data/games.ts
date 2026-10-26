import type { Game } from '../types/game';

/**
 * Barcha o‘yinlar to‘g‘ridan-to‘g‘ri Firebase Firestore bazasidan (collection: 'games') dinamik olinadi.
 * Kod ichidagi statik massiv to‘liq olib tashlangan.
 */
export const GAMES_DATA: Game[] = [];

export const GENRES = [
  'Barchasi',
  'Kvest',
  'Boshqotirma',
  'Sarguzasht',
  'Action',
  'Stealth',
  'RPG',
  'Omon qolish',
  'Qo‘rqinchli (Horror)',
  'Dramatik hikoya',
  'Tarixiy drama',
  'Platformer'
];

export const SUBTITLE_STATUSES: { label: string; value: string }[] = [
  { label: 'Barcha holatlar', value: 'Barchasi' },
  { label: 'Tayyor (Yuklab olish mumkin)', value: 'Tayyor' },
  { label: 'Jarayonda (Ishlanmoqda)', value: 'Jarayonda' },
  { label: 'Tez kunda (Kutilmoqda)', value: 'Tez kunda' }
];
