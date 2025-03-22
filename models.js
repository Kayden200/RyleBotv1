const mongoose = require("mongoose");

const ShareLogSchema = new mongoose.Schema({
  postId: String,
  status: String,
  timestamp: Date
});

const ShareLog = mongoose.model("ShareLog", ShareLogSchema);

module.exports = { ShareLog };



const mongoose = require("mongoose");

const AppStateSchema = new mongoose.Schema({
  email: String,
  appState: Array,
  timestamp: { type: Date, default: Date.now }
});

const AppState = mongoose.model("AppState", AppStateSchema);

module.exports = { AppState };


const mongoose = require("mongoose");

const UserTokenSchema = new mongoose.Schema({
  email: String,
  token: String,
  timestamp: { type: Date, default: Date.now }
});

const UserToken = mongoose.model("UserToken", UserTokenSchema);

module.exports = { UserToken };
