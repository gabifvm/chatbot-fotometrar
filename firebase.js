const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(C:\Users\Gabi\Downloads\Chatbot_backup, 'chatbot-fotometrar-firebase-adminsdk-fbsvc-8be2923e08.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;