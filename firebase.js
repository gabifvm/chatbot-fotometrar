const admin = require('firebase-admin');

// A variável de ambiente FIREBASE_CONFIG_BASE64 conterá o conteúdo do JSON do Firebase codificado em base64
const serviceAccountBase64 = process.env.FIREBASE_CONFIG_BASE64;

if (!serviceAccountBase64) {
  throw new Error("FIREBASE_CONFIG_BASE64 não está definida!");
}

const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;
