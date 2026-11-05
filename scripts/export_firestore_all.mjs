import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyBeARpvr_M-_p8OfO23a1AkSOS5WmNxDDE",
  authDomain: "subgame-ca4ed.firebaseapp.com",
  projectId: "subgame-ca4ed",
  storageBucket: "subgame-ca4ed.firebasestorage.app",
  messagingSenderId: "542403988321",
  appId: "1:542403988321:web:ba209d33a0d77594f0d320"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function serializeFirestoreValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object') {
    // Timestamp
    if (val.seconds !== undefined && val.nanoseconds !== undefined) {
      return new Date(val.seconds * 1000 + val.nanoseconds / 1000000).toISOString();
    }
    if (val._methodName === 'serverTimestamp') {
      return new Date().toISOString();
    }
    if (Array.isArray(val)) {
      return val.map(serializeFirestoreValue);
    }
    const cleanObj = {};
    for (const [k, v] of Object.entries(val)) {
      cleanObj[k] = serializeFirestoreValue(v);
    }
    return cleanObj;
  }
  return val;
}

async function exportAll() {
  console.log('--- Starting Firestore Export ---');

  // 1. Export Games
  console.log('Fetching games...');
  const gamesSnap = await getDocs(collection(db, 'games'));
  const games = [];
  gamesSnap.docs.forEach(doc => {
    games.push({
      id: doc.id,
      ...serializeFirestoreValue(doc.data())
    });
  });
  console.log(`Fetched ${games.length} games.`);

  // 2. Export Sliders
  console.log('Fetching sliders...');
  const slidersSnap = await getDocs(collection(db, 'sliders'));
  const sliders = [];
  slidersSnap.docs.forEach(doc => {
    sliders.push({
      id: doc.id,
      ...serializeFirestoreValue(doc.data())
    });
  });
  console.log(`Fetched ${sliders.length} sliders.`);

  // 3. Export Licenses
  console.log('Fetching licenses...');
  const licensesSnap = await getDocs(collection(db, 'licenses'));
  const licenses = [];
  const usersMap = new Map();
  const orders = [];

  const adminEmails = [
    'azizbekgulomovweb@gmail.com',
    'imuz21029@gmail.com'
  ];

  licensesSnap.docs.forEach(doc => {
    const rawData = doc.data();
    const data = serializeFirestoreValue(rawData);
    const licId = doc.id;
    
    licenses.push({
      id: licId,
      ...data
    });

    // Extract user profile
    const uid = data.userId || licId.split('_')[0];
    const email = (data.userEmail || '').trim().toLowerCase();
    
    if (uid && email) {
      if (!usersMap.has(uid)) {
        usersMap.set(uid, {
          id: uid,
          email: email,
          displayName: data.userName || email.split('@')[0],
          photoUrl: data.userPhoto || '',
          role: adminEmails.includes(email) ? 'admin' : 'user',
          isStaff: adminEmails.includes(email),
          isSuperuser: email === 'azizbekgulomovweb@gmail.com',
          createdAt: data.createdAt || new Date().toISOString()
        });
      }
    }

    // Extract order if paid
    if (data.paymentRef || (data.paidAmount && data.paidAmount > 0)) {
      orders.push({
        orderId: `${uid}__${data.gameSlug || data.gameId || 'stray'}`,
        userId: uid,
        userEmail: email,
        gameId: data.gameId || data.gameSlug,
        gameSlug: data.gameSlug || data.gameId,
        gameTitle: data.gameTitle || 'Game',
        amount: data.paidAmount || 5000,
        currency: 'UZS',
        status: 'paid',
        paymentProvider: data.paymentProvider || 'click',
        clickTransId: String(data.paymentRef || ''),
        paidAmount: data.paidAmount || 5000,
        createdAt: data.createdAt || new Date().toISOString()
      });
    }
  });

  console.log(`Fetched ${licenses.length} licenses.`);
  console.log(`Extracted ${usersMap.size} unique users.`);
  console.log(`Extracted ${orders.length} paid orders.`);

  // Ensure Admin accounts are always in usersMap
  for (const adminEmail of adminEmails) {
    let found = false;
    for (const u of usersMap.values()) {
      if (u.email === adminEmail) {
        u.role = 'admin';
        u.isStaff = true;
        found = true;
        break;
      }
    }
    if (!found) {
      usersMap.set(`admin_${adminEmail.split('@')[0]}`, {
        id: `admin_${adminEmail.split('@')[0]}`,
        email: adminEmail,
        displayName: 'SubGame Admin',
        photoUrl: '',
        role: 'admin',
        isStaff: true,
        isSuperuser: adminEmail === 'azizbekgulomovweb@gmail.com',
        createdAt: new Date().toISOString()
      });
    }
  }

  const outputData = {
    exportedAt: new Date().toISOString(),
    sourceProject: 'subgame-ca4ed',
    stats: {
      gamesCount: games.length,
      slidersCount: sliders.length,
      licensesCount: licenses.length,
      usersCount: usersMap.size,
      ordersCount: orders.length
    },
    games,
    sliders,
    users: Array.from(usersMap.values()),
    licenses,
    orders
  };

  const outDir = path.resolve('d:/Frontend/Projects/subgame-backend/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'firestore_full_export.json');
  fs.writeFileSync(outFile, JSON.stringify(outputData, null, 2), 'utf8');

  console.log(`\nSuccessfully exported to: ${outFile}`);
  console.log(`File size: ${(fs.statSync(outFile).size / 1024 / 1024).toFixed(2)} MB`);
  process.exit(0);
}

exportAll().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
