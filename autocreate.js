const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");
const proxyChain = require("proxy-chain");
const mongoose = require("mongoose");
const { Account } = require("./models");

puppeteer.use(StealthPlugin());

// List of Random First & Last Names
const firstNames = ["John", "David", "Michael", "James", "Robert", "William", "Charles", "Daniel", "Joseph", "Ryan"];
const lastNames = ["Smith", "Johnson", "Brown", "Williams", "Jones", "Davis", "Miller", "Wilson", "Anderson", "Thomas"];

async function fetchProxy() {
  try {
    const res = await axios.get("https://www.proxy-list.download/api/v1/get?type=http");
    const proxies = res.data.split("\r\n").filter(Boolean);
    return proxies.length > 0 ? proxies[Math.floor(Math.random() * proxies.length)] : null;
  } catch (error) {
    console.error("❌ Proxy Fetch Failed:", error.message);
    return null;
  }
}

async function createTempEmail() {
  try {
    const res = await axios.post("https://api.mail.tm/accounts", {
      address: `fbuser${Date.now()}@mail.tm`,
      password: "TempPass123!"
    });
    return res.data.address;
  } catch (error) {
    console.error("❌ Temp Mail Creation Failed:", error.response.data);
    return null;
  }
}

async function createAccount() {
  const proxy = await fetchProxy();
  if (!proxy) return { error: "No working proxies found." };

  const newProxy = await proxyChain.anonymizeProxy(`http://${proxy}`);
  const email = await createTempEmail();
  if (!email) return { error: "Failed to get a temp email." };

  // Generate a Random First and Last Name
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const password = "RandomPass123!";

  const browser = await puppeteer.launch({
    headless: false, // Set to true for full automation
    args: [`--proxy-server=${newProxy}`]
  });
  const page = await browser.newPage();
  await page.goto("https://m.facebook.com/reg", { waitUntil: "networkidle2" });

  await page.type("#firstname_input", firstName);
  await page.type("#lastname_input", lastName);
  await page.type("#email_input", email);
  await page.type("#password_input", password);
  
  await page.click("#submit_button");
  await page.waitForTimeout(5000); // Wait for response

  const account = new Account({ firstName, lastName, email, password });
  await account.save();

  await browser.close();
  return account;
}

module.exports = { createAccount };
