
const mongoose = require("mongoose");
const User = require("../models/userModel");
const { getGridFSBucket, mongoose: dbMongoose } = require("../config/db");

// Handle file upload
const uploadFile = async (req, res) => {
  try {
    // Validate file presence
    if (!req.file) {
      return res.status(400).json({ 
        message: "No file uploaded",
        code: "NO_FILE"
      });
    }

    // Validate file type
    if (!(req.file.mimetype.startsWith('image/') || req.file.mimetype === 'application/pdf')) {
      return res.status(400).json({
        message: "Only image and PDF files are allowed",
        code: "INVALID_FILE_TYPE"
      });
    }

    // Validate file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "File size must be less than 5MB",
        code: "FILE_TOO_LARGE"
      });
    }

    console.log("📂 Received file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Validate and sanitize folder name
    let folderName = req.body.folder?.trim() || "Uncategorized";
    const folderRegex = /^[a-zA-Z0-9-_ ]+$/;
    
    if (!folderRegex.test(folderName)) {
      return res.status(400).json({
        message: "Folder name can only contain letters, numbers, spaces, hyphens and underscores",
        code: "INVALID_FOLDER_NAME"
      });
    }
    
    folderName = folderName.replace(/[^a-zA-Z0-9-_\s]/g, "").trim();

    let gridFSBucket;
    try {
      gridFSBucket = getGridFSBucket();
    } catch (error) {
      return res.status(500).json({ message: "GridFS not initialized", error: error.message });
    }

    if (!req.file.buffer) {
      return res.status(400).json({
        message: "No file data received",
        code: "NO_FILE_DATA"
      });
    }

    const filePath = `${folderName}/${req.file.originalname}`;
    const writeStream = gridFSBucket.openUploadStream(filePath, {
      contentType: req.file.mimetype,
      metadata: {
        userId,
        uploadDate: new Date(),
        folderName,
        contentType: req.file.mimetype
      }
    });

    writeStream.on("error", (error) => {
      console.error("File storage error:", error);
      res.status(500).json({
        message: "File storage failed",
        code: "STORAGE_ERROR",
        error: error.message
      });
    });

    writeStream.on("finish", async () => {
      try {
        console.log("Starting database update for user:", userId);
        
  // Construct the full image URL with HTTPS protocol and host
  const fullImageUrl = `https://${req.get('host')}/api/upload/image/${writeStream.id}`;

        // Find or create the folder
        const user = await User.findOneAndUpdate(
          { _id: userId, 'prescriptionFolders.folderName': folderName },
          {
            $push: {
              'prescriptionFolders.$.images': {
                fileId: writeStream.id,
                filename: req.file.originalname,
                filePath,
                name: req.file.originalname, // Use filename as default name
                uploadDate: new Date(),
                imageUrl: fullImageUrl
              }

            }
          },
          { new: true }
        ).catch(err => {
          console.error("Error updating existing folder:", err);
          throw err;
        });

        console.log("Existing folder update result:", user ? "Success" : "Folder not found, creating new");

        // If folder doesn't exist, create it
        if (!user) {
          const updateResult = await User.findByIdAndUpdate(
            userId,
            {
              $push: {
                prescriptionFolders: {
                  folderName,
                  images: [{
                    fileId: writeStream.id,
                    filename: req.file.originalname,
                    filePath,
                    name: req.file.originalname, // Use filename as default name
                    uploadDate: new Date(),
                    imageUrl: fullImageUrl
                  }]

                }
              }
            },
            { new: true }
          ).catch(err => {
            console.error("Error creating new folder:", err);
            throw err;
          });

          console.log("New folder creation result:", updateResult ? "Success" : "Failed");
        }

        console.log("Upload completed successfully for file:", req.file.originalname);
        res.status(200).json({
          message: "File uploaded successfully",
          code: "UPLOAD_SUCCESS",
          fileUrl: fullImageUrl,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error("Error in upload process:", {
          userId,
          folderName,
          filename: req.file.originalname,
          error: error.message,
          stack: error.stack
        });
        res.status(500).json({
          message: "Failed to update user record",
          code: "USER_UPDATE_ERROR",
          error: error.message
        });
      }
    });

    writeStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
};

// Get all folders for the authenticated user
const getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('prescriptionFolders');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const folders = user.prescriptionFolders.map(folder => {
      const imageCount = folder.images?.filter(img => img.fileId && img.imageUrl).length || 0;
      
      return {
        folderName: folder.folderName,
        fileCount: imageCount,
        images: folder.images
      };
    });

    res.status(200).json({ folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ 
      message: "Failed to fetch folders",
      error: error.message
    });
  }
};

// Get a specific image by its Id
const getImageById = async (req, res) => {
  try {
    const { fileId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the image in any of the user's folders
    let foundImage = null;
    for (const folder of user.prescriptionFolders) {
      const image = folder.images.find(img => img.fileId.toString() === fileId);
      if (image) {
        foundImage = image;
        break;
      }
    }

    if (!foundImage) {
      return res.status(404).json({ message: "Image not found" });
    }

    const gridFSBucket = getGridFSBucket();
    const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    // Set proper CORS headers for image requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Authorization', `Bearer ${token}`);

    downloadStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      res.status(500).json({ message: 'Error streaming image', error: error.message });
    });

    // Get file info to determine content type
    const fileInfo = await gridFSBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).next();
    if (!fileInfo) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    // Set proper content type and cache headers
    res.set('Content-Type', fileInfo.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    downloadStream.pipe(res);

  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ message: "Failed to fetch image", error: error.message });
  }
};

// Public route to get image/pdf without auth header
const getPublicImageById = async (req, res) => {
  try {
    const { fileId } = req.params;

    const gridFSBucket = getGridFSBucket();
    const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    downloadStream.on('error', (error) => {
      console.error('Error streaming public image:', error);
      res.status(500).json({ message: 'Error streaming image', error: error.message });
    });

    // Get file info to determine content type
    const fileInfo = await gridFSBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).next();
    if (!fileInfo) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    // Set proper content type and cache headers
    res.set('Content-Type', fileInfo.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    downloadStream.pipe(res);

  } catch (error) {
    console.error("Error fetching public image:", error);
    res.status(500).json({ message: "Failed to fetch image", error: error.message });
  }
};

// Get all images from a specific folder
const getImagesByFolder = async (req, res) => {
  try {
    const { folderName } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const folder = user.prescriptionFolders.find(f => 
      f.folderName.trim().toLowerCase() === folderName.trim().toLowerCase()
    );

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const imagesWithUrls = folder.images.map(image => {
      // Ensure required fields are present
      const filename = image.filename || `prescription_${image.fileId}`;
      const uploadDate = image.uploadDate || new Date().toISOString();
      
      return {
        fileId: image.fileId,
        filename: filename,
        uploadDate: uploadDate,
        imageUrl: `https://${req.get('host')}/api/upload/image/${image.fileId}`
      };
    });

    res.status(200).json(imagesWithUrls);

  } catch (error) {
    console.error("Error fetching images by folder:", error);
    res.status(500).json({ message: "Failed to fetch images", error: error.message });
  }
};

// Get all images for the authenticated user
// Get all images for the authenticated user
const getAllImages = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allImages = [];
    user.prescriptionFolders.forEach(folder => {
      folder.images.forEach(image => {
        allImages.push({
          fileId: image.fileId,
          filename: image.filename,
          folderName: folder.folderName,
          uploadDate: image.uploadDate,
          imageUrl: `https://${req.get('host')}/api/upload/image/${image.fileId}`
        });
      });
    });
    
    res.status(200).json(allImages);
  } catch (error) {
    console.error("Error fetching all images:", error);
    res.status(500).json({ message: "Failed to fetch images", error: error.message });
  }
};

// delete an existing image from the folder 
const deleteImage = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // Find the user and the image in their folders
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find and remove the image from the user's folders
    let imageRemoved = false;
    for (const folder of user.prescriptionFolders) {
      const imageIndex = folder.images.findIndex(img => img.fileId.toString() === fileId);
      if (imageIndex !== -1) {
        folder.images.splice(imageIndex, 1);
        imageRemoved = true;
        break;
      }
    }

    if (!imageRemoved) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Ensure all images have required fields before saving
    user.prescriptionFolders.forEach(folder => {
      folder.images.forEach(image => {

      });
    });

    // Save the updated user document
    await user.save();


    // Delete the file from GridFS
    const gridFSBucket = getGridFSBucket();
    await gridFSBucket.delete(new mongoose.Types.ObjectId(fileId));

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ 
      message: "Failed to delete image",
      error: error.message 
    });
  }
};


// Delete a folder and all its images
const deleteFolder = async (req, res) => {
  const { folderName } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the folder and its images
    const folderIndex = user.prescriptionFolders.findIndex(
      folder => folder.folderName === folderName
    );

    if (folderIndex === -1) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Get all fileIds from the folder
    const fileIds = user.prescriptionFolders[folderIndex].images.map(
      image => image.fileId
    );

    // Remove the folder from user's prescriptionFolders
    user.prescriptionFolders.splice(folderIndex, 1);
    await user.save();

    // Delete all associated files from GridFS
    const gridFSBucket = getGridFSBucket();
    await Promise.all(
      fileIds.map(fileId => 
        gridFSBucket.delete(new mongoose.Types.ObjectId(fileId))
      )
    );

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ 
      message: "Failed to delete folder",
      error: error.message 
    });
  }
};



// Update image filename
const updateImageName = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newName } = req.body;
    const userId = req.user.id;

    // Validate new name
    if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
      return res.status(400).json({ 
        message: "Invalid filename",
        code: "INVALID_FILENAME" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find and update the image in the user's folders
    let imageUpdated = false;
    for (const folder of user.prescriptionFolders) {
      const image = folder.images.find(img => img.fileId.toString() === fileId);
      if (image) {
        image.filename = newName.trim();
        imageUpdated = true;
        break;
      }
    }


    if (!imageUpdated) {
      return res.status(404).json({ message: "Image not found" });
    }

    await user.save();
    
    res.status(200).json({ 
      message: "Filename updated successfully",
      newName: newName.trim()
    });
  } catch (error) {
    console.error("Error updating filename:", error);
    res.status(500).json({ 
      message: "Failed to update filename",
      error: error.message 
    });
  }
};

module.exports = { 
  uploadFile, 
  getFolders, 
  getImageById, 
  getImagesByFolder, 
  getAllImages, 
  deleteImage,
  deleteFolder,
  updateImageName,
  getPublicImageById
};
