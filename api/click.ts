import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Singleton)
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'subgame-ca4ed',
      });
    } catch (err) {
      console.warn('[Click API] Could not parse FIREBASE_SERVICE_ACCOUNT:', err);
      admin.initializeApp({ projectId: 'subgame-ca4ed' });
    }
  } else {
    admin.initializeApp({ projectId: 'subgame-ca4ed' });
  }
}

const db = admin.firestore();

// Click configuration (from Environment Variables with Sandbox fallbacks)
const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID || 'TEST_SERVICE_ID';
const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID || 'TEST_MERCHANT_ID';
const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY || 'TEST_SECRET_KEY';

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
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET for endpoint healthcheck
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'SubGame Click Merchant Webhook',
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: -8, error_note: 'Method not allowed' });
  }

  try {
    const data = req.body || req.query || {};

    const click_trans_id = String(data.click_trans_id || '');
    const service_id = String(data.service_id || '');
    const click_paydoc_id = String(data.click_paydoc_id || '');
    const merchant_trans_id = String(data.merchant_trans_id || '');
    const amount = Number(data.amount || 0);
    const action = Number(data.action ?? -1);
    const error = Number(data.error ?? 0);
    const error_note = String(data.error_note || '');
    const sign_time = String(data.sign_time || '');
    const sign_string = String(data.sign_string || '').toLowerCase();
    const merchant_prepare_id = data.merchant_prepare_id ? String(data.merchant_prepare_id) : '';

    console.log(`[Click Webhook] Received action=${action}, click_trans_id=${click_trans_id}, order=${merchant_trans_id}, amount=${amount}`);

    // 1. Signature Verification
    // Prepare (action = 0): md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
    // Complete (action = 1): md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)
    const isSandboxTest = CLICK_SECRET_KEY === 'TEST_SECRET_KEY' || process.env.CLICK_SANDBOX === 'true';

    let expectedSign = '';
    if (action === 0) {
      expectedSign = crypto
        .createHash('md5')
        .update(`${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`)
        .digest('hex')
        .toLowerCase();
    } else if (action === 1) {
      expectedSign = crypto
        .createHash('md5')
        .update(`${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`)
        .digest('hex')
        .toLowerCase();
    }

    if (!isSandboxTest && sign_string !== expectedSign) {
      console.warn(`[Click Webhook] Signature mismatch! Got: ${sign_string}, Expected: ${expectedSign}`);
      return res.status(200).json({
        error: -1,
        error_note: 'SIGN CHECK FAILED!',
      });
    }

    // 2. Fetch Order from Firestore
    let orderData: any = null;
    let orderRef: admin.firestore.DocumentReference | null = null;

    if (merchant_trans_id) {
      try {
        orderRef = db.collection('orders').doc(merchant_trans_id);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
          orderData = orderSnap.data();
        }
      } catch (err) {
        console.warn('[Click Webhook] Could not fetch order document:', err);
      }
    }

    // If order not found in orders collection, check if merchant_trans_id encodes userId and gameId (e.g. userId_gameId)
    let userId = orderData?.userId;
    let gameId = orderData?.gameId;
    let gameTitle = orderData?.gameTitle || 'SubGame O‘yini';
    let userEmail = orderData?.userEmail || '';

    if (!userId && merchant_trans_id.includes('_')) {
      const parts = merchant_trans_id.split('_');
      userId = parts[0];
      gameId = parts[1];
    }

    if (!userId || !gameId) {
      return res.status(200).json({
        error: -5,
        error_note: 'User or Game Order not found',
      });
    }

    // Check amount if orderData exists
    if (orderData && orderData.amount && Number(orderData.amount) !== amount) {
      return res.status(200).json({
        error: -2,
        error_note: 'Incorrect parameter amount',
      });
    }

    // 3. ACTION = 0 (PREPARE)
    if (action === 0) {
      // Check if already paid
      if (orderData && orderData.status === 'paid') {
        return res.status(200).json({
          error: -4,
          error_note: 'Already paid',
        });
      }

      // Record prepare state in Firestore
      if (orderRef) {
        await orderRef.set(
          {
            clickTransId: click_trans_id,
            clickPaydocId: click_paydoc_id,
            status: 'prepared',
            preparedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

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
      // If error < 0, payment was cancelled by Click or user
      if (error < 0) {
        if (orderRef) {
          await orderRef.set(
            {
              status: 'cancelled',
              errorNote: error_note,
              cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
        return res.status(200).json({
          error: -9,
          error_note: 'Transaction cancelled',
        });
      }

      // Check if already paid to avoid double processing
      if (orderData && orderData.status === 'paid') {
        return res.status(200).json({
          click_trans_id: Number(click_trans_id) || click_trans_id,
          merchant_trans_id: merchant_trans_id,
          merchant_confirm_id: click_trans_id,
          error: 0,
          error_note: 'Already processed',
        });
      }

      // A) Mark Order as Paid
      if (orderRef) {
        await orderRef.set(
          {
            status: 'paid',
            paidAmount: amount,
            clickTransId: click_trans_id,
            clickPaydocId: click_paydoc_id,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      // B) Grant Cloud License in Firestore (`licenses` collection)
      const licenseId = `${userId}_${gameId}`;
      const licenseRef = db.collection('licenses').doc(licenseId);

      await licenseRef.set(
        {
          id: licenseId,
          userId: userId,
          userEmail: userEmail,
          gameId: gameId,
          gameTitle: gameTitle,
          gameSlug: orderData?.gameSlug || gameId,
          status: 'active',
          hwid: null, // Ready to bind to the user's PC on first launcher launch!
          boundDeviceName: null,
          paidAmount: amount,
          paymentProvider: 'click',
          paymentRef: click_trans_id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

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
