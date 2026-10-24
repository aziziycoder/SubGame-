import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Game } from '../types/game';

// Click Merchant Settings (Can be overridden via VITE_CLICK_SERVICE_ID / VITE_CLICK_MERCHANT_ID)
export const CLICK_CONFIG = {
  serviceId: import.meta.env.VITE_CLICK_SERVICE_ID || 'TEST_SERVICE_ID',
  merchantId: import.meta.env.VITE_CLICK_MERCHANT_ID || 'TEST_MERCHANT_ID',
  isSandbox: import.meta.env.VITE_CLICK_SANDBOX !== 'false',
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
  const amount = customAmount ?? (parseGamePrice(game.subtitlePrice) || parseGamePrice(game.price) || 15000);
  const timestamp = Date.now();
  const orderId = `ORD_${timestamp}_${userId.substring(0, 6)}_${game.id.substring(0, 8)}`;

  // 1. Create order record in Firestore
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
  });

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
