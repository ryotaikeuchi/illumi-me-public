const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require('axios');
const { URLSearchParams } = require('url');

// --- Firebase Custom Token Generation Function ---
exports.createFirebaseToken = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const idToken = req.body.idToken;
  if (!idToken) {
    return res.status(400).send('ID token is required.');
  }

  try {
    // Verify LIFF ID token with LINE API
    const params = new URLSearchParams();
    params.append('id_token', idToken);
    params.append('client_id', process.env.LIFF_CHANNEL_ID);

    const response = await axios.post('https://api.line.me/oauth2/v2.1/verify', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const profile = response.data; // `axios` wraps the response in a `data` object
    const userId = profile.sub; // 'sub' contains the user ID

    if (!userId) {
      throw new Error('User ID (sub) not found in ID token response.');
    }

    // Create a custom Firebase token
    const firebaseToken = await admin.auth().createCustomToken(userId);

    res.status(200).json({ firebaseToken });
  } catch (error) {
    // Check if the error is from the LINE API verification step
    if (error.response && error.response.data && error.response.data.error_description) {
      const lineError = error.response.data.error_description;
      console.error('LINE API Error:', lineError);
      if (lineError.includes('IdToken expired')) {
        // Send a specific, actionable error code to the client
        return res.status(401).send('LIFF ID Token has expired.');
      }
    }
        // Log the full error for debugging
        console.error('Error creating Firebase custom token. Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        if (error.response) {
          console.error('LINE API Response Error Data:', JSON.stringify(error.response.data));
        }
        // Send a more specific error response to the client
        res.status(401).send('Authentication failed: Could not verify LINE ID token.');      }
});
