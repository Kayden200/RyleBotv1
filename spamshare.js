const axios = require("axios");
const mongoose = require("mongoose");
const { ShareLog } = require("./models");

// Safe Delay Function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function spamShare(postLink, count) {
  const accessToken = process.env.USER_ACCESS_TOKEN;
  const postId = postLink.split("facebook.com/")[1]; // Extract post ID

  let success = 0, failed = 0;

  for (let i = 0; i < count; i++) {
    try {
      await axios.post(`https://graph.facebook.com/me/feed`, {
        link: `https://facebook.com/${postId}`,
        access_token: accessToken
      });
      success++;

      // Save success log in MongoDB
      await ShareLog.create({ postId, status: "Success", timestamp: new Date() });

      // Delay between shares (to prevent spam detection)
      await delay(Math.floor(Math.random() * 5000) + 3000); // 3-8 seconds delay

    } catch (error) {
      failed++;
      console.error(`❌ Share Failed: ${error.response ? error.response.data.error.message : error.message}`);

      // Save failure log in MongoDB
      await ShareLog.create({ postId, status: "Failed", timestamp: new Date() });

      // Stop if AppState is restricted
      if (error.response && error.response.status === 403) break;
    }
  }

  return `✅ Shared: ${success}, ❌ Failed: ${failed}`;
}

module.exports = { spamShare };
