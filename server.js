require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { createAccount } = require("./autocreate");
const { getAppState } = require("./getappstate");
const { getToken } = require("./gettoken");
const { spamShare } = require("./spamshare");

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Messenger Webhook
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry;
  if (!entry) return res.sendStatus(400);

  for (const event of entry) {
    const messaging = event.messaging[0];
    if (!messaging.message || !messaging.sender) continue;

    const senderId = messaging.sender.id;
    const text = messaging.message.text;

    if (text.startsWith("/autocreate")) {
      const account = await createAccount();
      sendMessage(senderId, `✅ Facebook Account Created:\nEmail: ${account.email}\nPassword: ${account.password}`);
    } else if (text.startsWith("/spamshare")) {
      const args = text.split(" ");
      if (args.length < 3) return sendMessage(senderId, "❌ Usage: /spamshare <post_link> <count>");
      const response = await spamShare(args[1], parseInt(args[2]));
      sendMessage(senderId, response);
    } else if (text.startsWith("/getappstate")) {
      const appState = await getAppState();
      sendMessage(senderId, `✅ AppState: ${JSON.stringify(appState)}`);
    } else if (text.startsWith("/gettoken")) {
      const token = await getToken();
      sendMessage(senderId, `✅ User Token: ${token}`);
    } else {
      sendMessage(senderId, "❌ Unknown Command. Use /autocreate, /spamshare, /getappstate, or /gettoken.");
    }
  }
  res.sendStatus(200);
});

// Send Messenger Reply
async function sendMessage(senderId, text) {
  await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderId },
    message: { text: text }
  });
}

app.listen(3000, () => console.log("🚀 Messenger Bot Running on Port 3000"));
