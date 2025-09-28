const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  medicine: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  days: {
    type: Number,
    required: true,
    default: 1
  },
  takenHistory: {
    type: Map,
    of: Boolean, // key: YYYY-MM-DD, value: true if taken
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;
