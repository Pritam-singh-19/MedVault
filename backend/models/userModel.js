const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "uploads.files", // GridFS reference
  },
  filename: { 
    type: String, 
    required: true 
  },
  filePath: { 
    type: String, 
    required: true,
  },
  name: { 
    type: String, 
    required: true, // User-provided name for prescription
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const folderSchema = new mongoose.Schema({
  folderName: { 
    type: String, 
    required: true, 
  },
  images: {
    type: [imageSchema],
    default: [], // Ensure images array is initialized
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    default: "",
  },
  dob: {
    type: Date,
    default: null,
  },
  address: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  pinCode: {
    type: String,
    default: "",
  },
  prescriptionFolders: {
    type: [folderSchema],
    default: [], // Ensure folders array is initialized
  },
  fcmTokens: {
    type: [String],
    default: [],
  },
});

// Method to add FCM token (prevents duplicates)
userSchema.methods.addFCMToken = function(token) {
  if (token && !this.fcmTokens.includes(token)) {
    this.fcmTokens.push(token);
    return true; // Token added
  }
  return false; // Token already exists or invalid
};

// Method to remove FCM token (for cleanup of invalid tokens)
userSchema.methods.removeFCMToken = function(token) {
  const index = this.fcmTokens.indexOf(token);
  if (index > -1) {
    this.fcmTokens.splice(index, 1);
    return true; // Token removed
  }
  return false; // Token not found
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  // Keep fcmTokens for debugging, but you can uncomment below to hide them
  // delete user.fcmTokens;
  return user;
};

const User = mongoose.model("User", userSchema, "medvault"); // Collection name: 'medvault'

module.exports = User;