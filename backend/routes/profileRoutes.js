const express = require("express");
const multer = require("multer");
const profileController = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Debugging logs
console.log("Get Profile Function:", typeof profileController.getProfile);
console.log("Update Profile Function:", typeof profileController.updateProfile);

console.log("Protect Middleware Function:", typeof authMiddleware.protect);


// Configure multer for profile photo upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to get user profile
router.get("/me", authMiddleware.protect, profileController.getProfile);



// Route to update user profile (with profile photo upload support)
router.put("/update", authMiddleware.protect, upload.single("profilePhoto"), profileController.updateProfile);



module.exports = router;
