import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Game } from '../types/game';
import { fetchFromBackend } from './apiClient';

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
 * Standardized price calculator for cards, badges and checkout.
 */
export function getGamePriceInfo(game: Game): GamePriceInfo {
  // 1. If subtitle is not yet ready, it's always "Tez kunda"
  if (game.subtitleStatus !== 'Tayyor') {
    return {
      text: 'Tez kunda',
      isFree: false,
      isUpcoming: true,
      isPaid: false,
      numericAmount: 0,
    };
  }

  // 2. Check if explicit "Tez kunda"
  const rawSubPrice = (game.subtitlePrice || '').trim();
  const rawPrice = (game.price || '').trim();

  if (rawSubPrice.toLowerCase() === 'tez kunda' || rawPrice.toLowerCase() === 'tez kunda') {
    return {
      text: 'Tez kunda',
      isFree: false,
      isUpcoming: true,
      isPaid: false,
      numericAmount: 0,
    };
  }

  // 3. Numeric price in price or subtitlePrice
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

  // 4. "Pullik" without explicit numbers -> default 15 000 so‘m
  if (rawSubPrice.toLowerCase() === 'pullik' || rawPrice.toLowerCase() === 'pullik') {
    return {
      text: '15 000 so‘m',
      isFree: false,
      isUpcoming: false,
      isPaid: true,
      numericAmount: 15000,
    };
  }

  // 5. Free
  return {
    text: 'Bepul',
    isFree: true,
    isUpcoming: false,
    isPaid: false,
    numericAmount: 0,
  };
}

export interface CreateOrderParams {
  userId: string;
  userEmail: string;
  game: Game;
  customAmount?: number;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  clickUrl: string;
  isSandbox: boolean;
}

/**
 * Creates an order in Firestore `orders` and returns the official Click checkout redirect URL.
 */
export async function createClickOrder({
  userId,
  userEmail,
  game,
  customAmount,
}: CreateOrderParams): Promise<CreateOrderResult> {
  // 1. Try Backend order creation first
  try {
    const backendRes = await fetchFromBackend<{
      orderId: string;
      amount: number;
      clickUrl: string;
      isSandbox: boolean;
    }>('api/v1/payments/order/', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        userEmail,
        gameId: game.id,
        gameSlug: game.slug,
        amount: customAmount,
      }),
    });
    if (backendRes && backendRes.clickUrl) {
      return backendRes;
    }
  } catch (err) {
    console.warn('[Backend] Order creation via backend failed, using fallback:', err);
  }

  const amount = customAmount ?? (parseGamePrice(game.subtitlePrice) || parseGamePrice(game.price) || 15000);
  // Click limits merchant_trans_id to 50 characters: userId(28) + __(2) + slug(max 18) = 48 chars
  const cleanSlug = (game.slug || game.id).substring(0, 18);
  const orderId = `${userId}__${cleanSlug}`;

  // 1. Create order record in Firestore (with graceful try-catch so permission errors don't block payment)
  try {
    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, {
      orderId,
      userId,
      userEmail: userEmail || '',
      gameId: game.id,
      gameTitle: game.title,
      gameSlug: game.slug,
      amount,
      currency: 'UZS',
      status: 'pending',
      paymentProvider: 'click',
      createdAt: serverTimestamp(),
    }, { merge: true });
  } catch (firestoreErr) {
    console.warn('[Firestore] Order creation fallback warning (proceeding to Click gateway):', firestoreErr);
  }

  // 2. Return URL where Click redirects the user after payment
  const returnUrl = `${window.location.origin}/games/${game.slug}?payment=success&orderId=${orderId}`;

  // 3. Build Click Checkout URL
  // https://my.click.uz/services/pay?service_id=...&merchant_id=...&amount=...&transaction_param=...&return_url=...
  const clickUrl = `https://my.click.uz/services/pay?service_id=${CLICK_CONFIG.serviceId}&merchant_id=${CLICK_CONFIG.merchantId}&amount=${amount}&transaction_param=${orderId}&return_url=${encodeURIComponent(returnUrl)}`;

  return {
    orderId,
    amount,
    clickUrl,
    isSandbox: CLICK_CONFIG.isSandbox || CLICK_CONFIG.serviceId === 'TEST_SERVICE_ID',
  };
}

/**
 * Simulates a successful test payment in sandbox/dev mode without requiring a real Click merchant contract.
 */
export async function simulateSandboxPayment(orderId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        click_trans_id: `SIM_${Date.now()}`,
        service_id: CLICK_CONFIG.serviceId,
        click_paydoc_id: `DOC_${Date.now()}`,
        merchant_trans_id: orderId,
        merchant_prepare_id: orderId,
        amount: 15000,
        action: 1, // Complete
        error: 0,
        error_note: 'Sandbox Simulation Success',
        sign_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        sign_string: 'sandbox_bypass',
      }),
    });

    const data = await res.json();
    return data.error === 0;
  } catch (err) {
    console.error('Failed to simulate sandbox payment:', err);
    return false;
  }
}
