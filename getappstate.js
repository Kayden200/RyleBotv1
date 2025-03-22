const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const mongoose = require("mongoose");
const { AppState } = require("./models");

puppeteer.use(StealthPlugin());

async function getAppState(email, password) {
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

  // Extract cookies (AppState)
  const cookies = await page.cookies();
  await browser.close();

  const appState = cookies.map(({ name, value }) => ({ name, value }));

  // Save AppState to MongoDB
  await AppState.create({ email, appState });

  return appState;
}

module.exports = { getAppState };
