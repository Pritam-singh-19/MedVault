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

const User = mongoose.model("User", userSchema, "medvault"); // Collection name: 'medvault'

module.exports = User;
