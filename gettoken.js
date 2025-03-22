const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const mongoose = require("mongoose");
const { UserToken } = require("./models");

puppeteer.use(StealthPlugin());

async function getToken(email, password) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://m.facebook.com/", { waitUntil: "networkidle2" });

  // Check if already logged in
  if (await page.$("input[name='email']")) {
    await page.type("input[name='email']", email);
    await page.type("input[name='pass']", password);
    await page.click("button[name='login']");
    await page.waitForNavigation();
  }

  // Navigate to Access Token Page
  await page.goto("https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed", { waitUntil: "networkidle2" });

  // Extract the access token
  const token = await page.evaluate(() => {
    const tokenElement = document.querySelector("code");
    return tokenElement ? tokenElement.innerText : null;
  });

  await browser.close();

  if (!token) {
    throw new Error("❌ Token extraction failed.");
  }

  // Save Token to MongoDB
  await UserToken.create({ email, token });

  return token;
}

module.exports = { getToken };
