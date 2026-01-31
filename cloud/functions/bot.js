const {onRequest} = require("firebase-functions/v2/https");
const line = require("@line/bot-sdk");
const axios = require('axios');
const admin = require('firebase-admin'); // 追加

admin.initializeApp(); // 追加
const db = admin.firestore(); // 追加

// --- Helper function for Beebotte Integration ---
const sendToBeebotte = async (dataPayload) => {
    const BEEBOTTE_TOKEN = process.env.BEEBOTTE_TOKEN;
    const BEEBOTTE_CHANNEL = process.env.BEEBOTTE_CHANNEL;
    const BEEBOTTE_RESOURCE = process.env.BEEBOTTE_RESOURCE;
  
    if (!BEEBOTTE_TOKEN || !BEEBOTTE_CHANNEL || !BEEBOTTE_RESOURCE) {
      console.error("Beebotte environment variables (BEEBOTTE_TOKEN, BEEBOTTE_CHANNEL, BEEBOTTE_RESOURCE) are not fully set. Skipping Beebotte data sending.");
      return;
    }
  
    const beebotteUrl = `https://api.beebotte.com/v1/data/publish/${BEEBOTTE_CHANNEL}/${BEEBOTTE_RESOURCE}`;
    const payload = { data: dataPayload }; // Use the passed dataPayload
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": BEEBOTTE_TOKEN,
    };
  
    try {
      const response = await axios.post(beebotteUrl, payload, { headers });
      console.log("Successfully sent data to Beebotte:", response.data);
    } catch (error) {
      console.error("Error sending data to Beebotte:", error.response ? error.response.data : error.message);
    }
  };
  // --- End of Helper function ---

  // --- LINE Bot Webhook Function ---
exports.receiveLine = onRequest(async (req, res) => {
    // Initialize config and client inside the handler to ensure environment variables are loaded
    const config = {
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
    };
    const client = new line.Client(config);
  
    // Validate signature
    const signature = req.headers["x-line-signature"];
    if (!line.validateSignature(req.rawBody, config.channelSecret, signature)) {
      res.status(401).send("Invalid signature");
      return;
    }
  
    const events = req.body.events;
    if (!events || events.length === 0) {
      res.status(200).send("OK");
      return;
    }
  
    try {
      await Promise.all(events.map(handleEvent(client))); // Pass client to handleEvent
      res.status(200).send("OK");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error");
    }
  });

  // handleEvent now takes the client as an argument
const LED_PATTERNS = {
    BLINK: 'blink',
    FLOW: 'flow',
  };
  
const DEFAULT_PATTERN_COLORS = ['#FF0000', '#00FF00', '#FFFF00', '#FFA500'];

const handleEvent = (client) => async (event) => {
    // ... (existing handleEvent code remains the same)
    if (typeof event !== "object" || event === null) {
      return Promise.resolve(null);
    }
    console.log("Received event:", JSON.stringify(event));

    // ユーザーIDとFirestoreからの設定読み込みを追加
    let userId = null;
    let userSettings = null;
    if (event.source.userId) {
        userId = event.source.userId;
        const userDocRef = db.collection('users').doc(userId);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
            userSettings = docSnap.data().settings;
            console.log(`User settings for ${userId}:`, userSettings);
        } else {
            console.log(`No settings found for user ${userId}. Using defaults.`);
        }
    }
    switch (event.type) {
      case "follow":
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "友だち追加ありがとうございます！",
        });
      case "beacon":
        if (event.beacon.type === "enter") {
          const hwid = event.beacon.hwid;
          
          // Send "flow" pattern to Beebotte on beacon enter
          const flowCommand = {
            pattern: userSettings?.mode || LED_PATTERNS.FLOW, // Firestoreから読み込むかデフォルト
            colors: userSettings?.colors || DEFAULT_PATTERN_COLORS, // Firestoreから読み込むかデフォルト
            speed: 300, // LIFFアプリにspeed設定はないため、固定
          };
          await sendToBeebotte(flowCommand);
  
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: `ビーコンの範囲に入りました！\nHWID: ${hwid}`,
          });
        }
        break;
      case "message":
        if (event.message.type === "text") {
          const text = event.message.text.toLowerCase();
          
          let ledCommand;
          let selectedPattern = userSettings?.mode; // まずはFirestoreの設定を利用
          let selectedColors = userSettings?.colors || DEFAULT_PATTERN_COLORS; // Firestoreの設定を利用、なければデフォルト

          if (text.includes("点滅") || text.includes("blink") || text.includes("パッパッ")) {
            selectedPattern = LED_PATTERNS.BLINK;
          } else if (text.includes("流れ") || text.includes("flow") || text.includes("ピュー")) {
            selectedPattern = LED_PATTERNS.FLOW;
          } else if (!userSettings?.mode) { // Firestore設定がなく、かつキーワードマッチもなければデフォルト
            selectedPattern = LED_PATTERNS.FLOW;
          }
          
          ledCommand = {
            pattern: selectedPattern,
            colors: selectedColors,
            speed: 300, // LIFFアプリにspeed設定はないため、固定
          };
  
          await sendToBeebotte(ledCommand);
  
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: `LED controlled: Pattern=${ledCommand.pattern}`,
          });
        }
        break;
          default:
            return Promise.resolve(null);
        }
      };
