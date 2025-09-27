const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed!"), false);
    }
  },
});

// ✅ Route to upload a file
router.post("/", protect, upload.single("file"), uploadController.uploadFile);



// Get all images for the authenticated user
router.get("/images", protect, uploadController.getAllImages);

// Get images from a specific folder
router.get("/folder/:folderName", protect, uploadController.getImagesByFolder);


// ✅ Get a specific image by fileId
router.get("/image/:fileId", protect, uploadController.getImageById);

// Public route to get image/pdf without auth header
router.get("/public/image/:fileId", uploadController.getPublicImageById);

// Public route to get image without auth header (alias for clarity)
router.get("/public/images/:fileId", uploadController.getPublicImageById);

// ✅ Get all folders for the authenticated user
router.get("/folders", protect, uploadController.getFolders);

// Delete a folder
router.delete("/folders/:folderName", protect, uploadController.deleteFolder);


// ✅ DELETE route to remove an image by fileId
router.delete("/delete/:fileId", protect, uploadController.deleteImage);

// Update image filename
router.put("/update-name/:fileId", protect, uploadController.updateImageName);

module.exports = router;