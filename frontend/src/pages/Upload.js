import { useState, useEffect } from "react";
import axios from "axios";
import "../components/styles/Upload.css";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState("");
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // Fetch available folders on component mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated");
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload/folders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFolders(response.data.folders); // Store the fetched folders
      } catch (error) {
        console.error("Error fetching folders:", error);
        setError("Failed to load folders");
      }
    };

    fetchFolders();
  }, [setFolders]);

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
          // Validate file type
          if (!(selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
            setError('Only image and PDF files are allowed');
            return;
          }
          
          // Validate file size (5MB limit)
          if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
          }

      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setError(''); // Clear any previous errors
    }
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate folder name
    if (!folder) {
      setError("Please enter or select a folder name");
      setLoading(false);
      return;
    }

    // Validate folder name format
    const folderRegex = /^[a-zA-Z0-9-_ ]+$/;
    if (!folderRegex.test(folder)) {
      setError("Folder name can only contain letters, numbers, spaces, hyphens and underscores");
      setLoading(false);
      return;
    }

    if (!file) {
      setError("Please select a file to upload");
      setLoading(false);
      return;
    }


    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated - please login again");
        setLoading(false);
        return;
      }

      // Show upload progress
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      };


      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

  const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload`, formData, config);


      if (response.status === 200) {
        setFile(null);
        setFolder("");
        setImagePreview("");
        setSuccess("Upload successful!");
        // Clear any previous errors
        setError("");
      }

    } catch (error) {
      console.error("Upload error:", error);
      // Only show error if the upload itself failed
      if (!error.response || error.response.status !== 404) {
        setError(error.response?.data?.message || "Upload failed");
      }
    } finally {
      setLoading(false);
    }

  };

  // Cleanup image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="upload-container">
      <h2>Upload Prescription</h2>
      <form onSubmit={handleSubmit}>
        {/* File Upload Section */}
        <div className="upload-box" onClick={() => document.getElementById("file").click()}>
          <p>{file ? file.name : "Click to select a file"}</p>
          <input
            type="file"
            id="file"
            className="upload-input"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            style={{ display: "none" }}
          />
        </div>

        {/* Take Photo Section (Camera) */}
        <div className="upload-box" style={{ marginTop: '10px' }}>
          <button
            type="button"
            className="upload-button"
            onClick={() => document.getElementById("cameraInput").click()}
            style={{ width: '100%' }}
          >
            Take Photo
          </button>
          <input
            type="file"
            id="cameraInput"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="upload-preview-container">
            <img src={imagePreview} alt="Preview" className="upload-preview" />
          </div>
        )}

        {/* Folder Selection */}
        <div className="upload-folder-section">
          <label className="upload-folder-label" htmlFor="folder">Select Folder:</label>
          <select
            id="folder"
            className="upload-folder-select"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          >
            <option value="">Select a folder</option>
            {(folders || []).map((folderData) => (
              <option key={folderData.folderName} value={folderData.folderName}>
                {folderData.folderName}
              </option>
            ))}
          </select>
        </div>

        {/* Create New Folder */}
        <div className="upload-folder-section">
          <label className="upload-folder-label" htmlFor="newFolder">Or Create New Folder:</label>
          <input
            type="text"
            id="newFolder"
            className="upload-folder-input"
            placeholder="Enter new folder name"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          />
        </div>

        {/* Error / Success Messages */}
        {error && <div className="upload-message error">{error}</div>}
        {success && <div className="upload-message success">{success}</div>}

        {/* Upload Button */}
        <button type="submit" className="upload-button" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default Upload;