const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

let gridFSBucket;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB Already Connected");
      return { conn: mongoose.connection, gridFSBucket };
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected Successfully!");

    // Initialize GridFS once connection is open
    const db = conn.connection.db;
    gridFSBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "uploads",
    });

    console.log("📂 GridFS Initialized with bucket:", gridFSBucket.s.options.bucketName);

    return { conn, gridFSBucket };
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err);
    throw err; // Don't exit the process; let the caller handle it
  }
};

// Function to get GridFSBucket instance after initialization
const getGridFSBucket = () => {
  if (!gridFSBucket) {
    throw new Error("GridFS not initialized. Ensure MongoDB is connected before using GridFS.");
  }
  return gridFSBucket;
};

module.exports = { connectDB, getGridFSBucket, mongoose };
