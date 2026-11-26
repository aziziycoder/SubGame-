import type { Game } from '../types/game';
import { apiRequest } from './apiClient';

// Click Merchant Settings (loaded via environment variables with safe production defaults)
export const CLICK_CONFIG = {
  serviceId: import.meta.env.VITE_CLICK_SERVICE_ID || '114280',
  merchantId: import.meta.env.VITE_CLICK_MERCHANT_ID || '46113',
  merchantUserId: import.meta.env.VITE_CLICK_MERCHANT_USER_ID || '93476',
  isSandbox: import.meta.env.VITE_CLICK_SANDBOX === 'true',
};

/**
 * Parses numeric price from string (e.g. "15 000 so‘m" -> 15000, "Bepul" -> 0)
 */
export function parseGamePrice(priceStr?: string): number {
  if (!priceStr) return 0;
  const lower = priceStr.toLowerCase();
  if (lower.includes('bepul') || lower.includes('tekin') || lower.includes('free')) {
    return 0;
  }
  const digits = priceStr.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export interface GamePriceInfo {
  text: string;
  isFree: boolean;
  isUpcoming: boolean;
  isPaid: boolean;
  numericAmount: number;
}

/**
 * Shared price calculator for subtitle or dubbing editions.
 */
function resolvePriceInfo(status: string | undefined, rawSubPrice: string, rawPrice: string): GamePriceInfo {
  if (status && status !== 'Tayyor') {
    return {
      text: 'Tez kunda',
      isFree: false,
      isUpcoming: true,
      isPaid: false,
      numericAmount: 0,
    };
  }

  if (rawSubPrice.toLowerCase() === 'tez kunda' || rawPrice.toLowerCase() === 'tez kunda') {
    return {
      text: 'Tez kunda',
      isFree: false,
      isUpcoming: true,
      isPaid: false,
      numericAmount: 0,
    };
  }

  const num = parseGamePrice(rawSubPrice) || parseGamePrice(rawPrice);
  if (num > 0) {
    const formatted = `${num.toLocaleString('ru-RU')} so‘m`;
    return {
      text: formatted,
      isFree: false,
      isUpcoming: false,
      isPaid: true,
      numericAmount: num,
    };
  }

  if (rawSubPrice.toLowerCase() === 'pullik' || rawPrice.toLowerCase() === 'pullik') {
    return {
      text: '15 000 so‘m',
      isFree: false,
      isUpcoming: false,
      isPaid: true,
      numericAmount: 15000,
    };
  }

  return {
    text: 'Bepul',
    isFree: true,
    isUpcoming: false,
    isPaid: false,
    numericAmount: 0,
  };
}

/**
 * Standardized price calculator for cards, badges and checkout (Subtitle).
 */
export function getGamePriceInfo(game: Game): GamePriceInfo {
  return resolvePriceInfo(
    game.subtitleStatus,
    (game.subtitlePrice || '').trim(),
    (game.price || '').trim()
  );
}

/**
 * Standardized price calculator for Dubbing (O'zbekcha ovoz berish).
 */
export function getDubbingPriceInfo(game: Game): GamePriceInfo {
  const dubStatus = game.dubbingStatus || (game.hasDubbing ? 'Tayyor' : 'Tez kunda');
  const rawDubPrice = (game.dubbingPrice || '').trim();
  return resolvePriceInfo(dubStatus, rawDubPrice, rawDubPrice);
}

export interface CreateOrderParams {
  game: Game;
  edition?: 'subtitle' | 'dubbing';
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  clickUrl: string;
  isSandbox: boolean;
}

/**
 * Creates an order on the backend and returns the official Click checkout redirect URL.
 * The backend takes the buyer from the JWT and the price from the game record.
 */
export async function createClickOrder({ game, edition = 'subtitle' }: CreateOrderParams): Promise<CreateOrderResult> {
  return apiRequest<CreateOrderResult>('api/v1/payments/order/create/', {
    method: 'POST',
    body: JSON.stringify({
      gameId: edition === 'dubbing' ? `${game.id}__dub` : game.id,
      gameSlug: game.slug,
      edition,
    }),
  });
}
