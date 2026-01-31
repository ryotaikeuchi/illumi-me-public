const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export functions from their respective files
const auth = require('./auth');
const bot = require('./bot');

exports.createFirebaseToken = auth.createFirebaseToken;
exports.receiveLine = bot.receiveLine;