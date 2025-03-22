const mongoose = require("mongoose");

const ShareLogSchema = new mongoose.Schema({
  postId: String,
  status: String,
  timestamp: Date
});

const ShareLog = mongoose.model("ShareLog", ShareLogSchema);

module.exports = { ShareLog };
