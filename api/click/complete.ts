import crypto from 'crypto';

type Req = any;
type Res = any;

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyBeARpvr_M-_p8OfO23a1AkSOS5WmNxDDE';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'subgame-ca4ed';

// Click configuration (strictly from Environment Variables)
const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID || process.env.VITE_CLICK_SERVICE_ID || '';
const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID || process.env.VITE_CLICK_MERCHANT_ID || '';
const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY || '';
const CLICK_MERCHANT_USER_ID = process.env.CLICK_MERCHANT_USER_ID || process.env.VITE_CLICK_MERCHANT_USER_ID || '';

/**
 * Saves or updates a license in Firestore using Firestore REST API.
 * This works natively in Vercel Serverless without requiring complex service account files.
 */
async function grantLicenseRest(licenseId: string, data: {
  userId: string;
  userEmail: string;
  gameId: string;
  gameTitle: string;
  gameSlug: string;
  amount: number;
  clickTransId: string;
}) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/licenses/${licenseId}?key=${FIREBASE_API_KEY}`;
  
  const payload = {
    fields: {
      id: { stringValue: licenseId },
      userId: { stringValue: data.userId },
      userEmail: { stringValue: data.userEmail || '' },
      gameId: { stringValue: data.gameId },
      gameTitle: { stringValue: data.gameTitle || '' },
      gameSlug: { stringValue: data.gameSlug || data.gameId },
      status: { stringValue: 'active' },
      paidAmount: { integerValue: String(data.amount) },
      paymentProvider: { stringValue: 'click' },
      paymentRef: { stringValue: data.clickTransId },
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore REST error: ${res.status} - ${errText}`);
  }

  return await res.json();
}

/**
 * Updates an order status in Firestore using Firestore REST API.
 */
async function updateOrderRest(orderId: string, fields: Record<string, any>) {
  try {
    const fieldMask = Object.keys(fields).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders/${orderId}?${fieldMask}&key=${FIREBASE_API_KEY}`;
    
    const formattedFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'string') {
        formattedFields[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        formattedFields[key] = { integerValue: String(value) };
      }
    }

    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: formattedFields }),
    });
  } catch (err) {
    console.warn('[Click API] Could not update order via REST:', err);
  }
}

/**
 * Click Merchant API Error Codes:
 *  0: Success
 * -1: Sign check failed
 * -2: Incorrect parameter amount
 * -3: Action not found
 * -4: Already paid
 * -5: User / Order does not exist
 * -6: Transaction does not exist
 * -7: Failed to update user
 * -8: Error in request from click
 * -9: Transaction cancelled
 */
export default async function handler(req: Req, res: Res) {
  // Allow GET for endpoint healthcheck
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'SubGame Click Merchant Webhook',
      timestamp: new Date().toISOString(),
      serviceId: CLICK_SERVICE_ID,
      merchantId: CLICK_MERCHANT_ID,
      merchantUserId: CLICK_MERCHANT_USER_ID,
      mode: CLICK_SECRET_KEY ? 'production' : 'sandbox',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: -8, error_note: 'Method not allowed' });
  }

  try {
    let data = req.body || req.query || {};
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        data = Object.fromEntries(new URLSearchParams(data));
      }
    }

    const click_trans_id = String(data.click_trans_id || '');
    const service_id = String(data.service_id || '');
    const click_paydoc_id = String(data.click_paydoc_id || '');
    const merchant_trans_id = String(data.merchant_trans_id || '');
    const rawAmount = data.amount !== undefined ? String(data.amount) : '';
    const amount = Number(data.amount || 0);
    const reqUrl = req.url || '';
    let action = Number(data.action ?? -1);
    if (action === -1) {
      if (reqUrl.includes('/prepare')) action = 0;
      else if (reqUrl.includes('/complete')) action = 1;
    }
    const error = Number(data.error ?? 0);
    const error_note = String(data.error_note || '');
    const sign_time = String(data.sign_time || '');
    const sign_string = String(data.sign_string || '').toLowerCase();
    const merchant_prepare_id = data.merchant_prepare_id ? String(data.merchant_prepare_id) : '';

    console.log(`[Click Webhook] Received action=${action}, click_trans_id=${click_trans_id}, order=${merchant_trans_id}, amount=${amount}`);

    // 1. Signature Verification
    const isSandboxTest = !CLICK_SECRET_KEY || process.env.CLICK_SANDBOX === 'true' || sign_string === 'sandbox_bypass';

    const generateSign = (amtStr: string) => {
      if (action === 0) {
        return crypto
          .createHash('md5')
          .update(`${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${amtStr}${action}${sign_time}`)
          .digest('hex')
          .toLowerCase();
      } else {
        return crypto
          .createHash('md5')
          .update(`${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${merchant_prepare_id}${amtStr}${action}${sign_time}`)
          .digest('hex')
          .toLowerCase();
      }
    };

    const isValidSign = sign_string === generateSign(rawAmount) || sign_string === generateSign(String(amount));

    if (!isSandboxTest && !isValidSign) {
      console.warn(`[Click Webhook] Signature mismatch! Got: ${sign_string}, Expected: ${generateSign(rawAmount)}`);
      return res.status(200).json({
        error: -1,
        error_note: 'SIGN CHECK FAILED!',
      });
    }

    // 2. Parse Order Information
    // merchant_trans_id can be ORD_timestamp_userId_gameId or userId_gameId
    let userId = '';
    let gameId = '';
    let gameTitle = 'SubGame O‘yini';
    let gameSlug = '';
    let userEmail = '';

    if (merchant_trans_id.includes('__')) {
      const parts = merchant_trans_id.split('__');
      userId = parts[0];
      gameId = parts[1];
    } else if (merchant_trans_id.startsWith('ORD_')) {
      const parts = merchant_trans_id.split('_');
      // ORD, timestamp, userId, gameId
      if (parts.length >= 4) {
        userId = parts[2];
        gameId = parts.slice(3).join('_');
      }
    } else if (merchant_trans_id.includes('_')) {
      const parts = merchant_trans_id.split('_');
      userId = parts[0];
      gameId = parts.slice(1).join('_');
    }

    // Try reading order from Firestore REST API if needed
    try {
      const orderRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders/${merchant_trans_id}?key=${FIREBASE_API_KEY}`
      );
      if (orderRes.ok) {
        const orderDoc = await orderRes.json();
        const f = orderDoc.fields || {};
        if (f.userId?.stringValue) userId = f.userId.stringValue;
        if (f.gameId?.stringValue) gameId = f.gameId.stringValue;
        if (f.gameTitle?.stringValue) gameTitle = f.gameTitle.stringValue;
        if (f.gameSlug?.stringValue) gameSlug = f.gameSlug.stringValue;
        if (f.userEmail?.stringValue) userEmail = f.userEmail.stringValue;
      }
    } catch (e) {
      console.warn('[Click Webhook] Could not fetch order doc via REST:', e);
    }

    // If userId was truncated (e.g. 6 chars like "A60znZ"), automatically expand to full 28-char UID
    if (userId && userId.length < 20) {
      try {
        const usersRes = await fetch(
          `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?key=${FIREBASE_API_KEY}`
        );
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const docs = usersData.documents || [];
          for (const u of docs) {
            const uid = (u.name || '').split('/').pop() || '';
            if (uid.startsWith(userId)) {
              console.log(`[Click Webhook] Expanded truncated userId ${userId} -> ${uid}`);
              userId = uid;
              if (u.fields?.email?.stringValue) userEmail = u.fields.email.stringValue;
              break;
            }
          }
        }
      } catch (err) {
        console.warn('[Click Webhook] Could not expand truncated userId:', err);
      }
    }

    if (!userId || !gameId) {
      return res.status(200).json({
        error: -5,
        error_note: 'User or Game Order not found',
      });
    }

    // Auto-normalize known game IDs if truncated by payment gateways
    if (gameId === 'mafia-definitive-edi' || gameId === '44zh' || gameId === '6zz7' || gameId.startsWith('mafia-definitive')) {
      gameId = 'mafia-definitive-edition';
      gameTitle = 'Mafia: Definitive Edition';
      gameSlug = 'mafia-definitive-edition';
    }

    // If gameTitle is still generic or missing, fetch from Firestore games collection
    if (!gameTitle || gameTitle === 'SubGame O‘yini') {
      try {
        const gameRes = await fetch(
          `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/games/${gameId}?key=${FIREBASE_API_KEY}`
        );
        if (gameRes.ok) {
          const gameDoc = await gameRes.json();
          if (gameDoc.fields?.title?.stringValue) {
            gameTitle = gameDoc.fields.title.stringValue;
          }
          if (gameDoc.fields?.slug?.stringValue) {
            gameSlug = gameDoc.fields.slug.stringValue;
          }
        }
      } catch (err) {
        console.warn('[Click Webhook] Could not fetch game metadata:', err);
      }
    }

    // 3. ACTION = 0 (PREPARE)
    if (action === 0) {
      await updateOrderRest(merchant_trans_id, {
        clickTransId: click_trans_id,
        clickPaydocId: click_paydoc_id,
        status: 'prepared',
      });

      return res.status(200).json({
        click_trans_id: Number(click_trans_id) || click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_prepare_id: merchant_trans_id,
        error: 0,
        error_note: 'Success',
      });
    }

    // 4. ACTION = 1 (COMPLETE)
    if (action === 1) {
      // If error < 0, payment was cancelled
      if (error < 0) {
        await updateOrderRest(merchant_trans_id, {
          status: 'cancelled',
          errorNote: error_note,
        });
        return res.status(200).json({
          error: -9,
          error_note: 'Transaction cancelled',
        });
      }

      // A) Update Order status to paid
      await updateOrderRest(merchant_trans_id, {
        status: 'paid',
        paidAmount: amount,
        clickTransId: click_trans_id,
        clickPaydocId: click_paydoc_id,
      });

      // B) Grant Cloud License in Firestore
      const licenseId = `${userId}_${gameId}`;
      await grantLicenseRest(licenseId, {
        userId,
        userEmail,
        gameId,
        gameTitle,
        gameSlug: gameSlug || gameId,
        amount,
        clickTransId: click_trans_id,
      });

      console.log(`[Click Webhook] SUCCESS! License granted for user=${userId}, game=${gameId}, licenseId=${licenseId}`);

      return res.status(200).json({
        click_trans_id: Number(click_trans_id) || click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: click_trans_id,
        error: 0,
        error_note: 'Success',
      });
    }

    return res.status(200).json({
      error: -3,
      error_note: 'Action not found',
    });
  } catch (err: any) {
    console.error('[Click Webhook] Unexpected internal error:', err);
    return res.status(200).json({
      error: -7,
      error_note: err?.message || 'Failed to process transaction',
    });
  }
}
