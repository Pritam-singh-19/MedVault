import React, { useEffect, useState, useCallback } from "react";
import "../components/styles/EditModal.css";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/styles/PrescriptionDetail.css";

const PrescriptionDetails = () => {
  const { folderName } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFileId, setEditingFileId] = useState(null);
  const [newFilename, setNewFilename] = useState("");

  const navigate = useNavigate();

  const fetchPrescriptions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload/folder/${folderName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        }
      );
      

      console.log('Fetched prescriptions:', response.data);

      if (!response.data || response.data.length === 0) {
        setError(`No images found in this folder.`);
        return;
      }

          const prescriptionsWithToken = await Promise.all(response.data.map(async (image) => {
            try {
              let previewUrl = null;
              if (image.filename.toLowerCase().endsWith('.pdf')) {
                // Use public URL for PDF preview to avoid auth issues
                previewUrl = image.imageUrl.replace('/api/upload/image/', '/api/upload/public/image/');
              } else {
                const imageResponse = await axios.get(image.imageUrl, {
                  responseType: 'blob',
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                previewUrl = URL.createObjectURL(imageResponse.data);
              }
              
              const cleanFilename = image.filename || `prescription_${image.fileId}`;

              const uploadDate = image.uploadDate 
                ? new Date(image.uploadDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Unknown date';

              return {
                fileId: image.fileId,
                filename: cleanFilename,
                uploadDate: uploadDate,
                previewUrl,
                originalUrl: image.imageUrl
              };

            } catch (error) {
              console.error('Error fetching image:', error);
              return {
                fileId: image.fileId,
                filename: image.filename || image.fileId,
                uploadDate: image.uploadDate ? new Date(image.uploadDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown date',
                imageUrl: null
              };
            }
          }));

      setPrescriptions(prescriptionsWithToken);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      if (error.response?.status === 404) {
        setError(`Folder "${folderName}" not found. Please check the folder name and try again.`);
      } else {
        setError(error.response?.data?.message || "Failed to load prescriptions. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [folderName]);

  useEffect(() => {
    if (folderName) {
      fetchPrescriptions();
    }
  }, [folderName, fetchPrescriptions]);

  const handleImageClick = (originalUrl, filename) => {
    if (!filename) {
      console.error("Filename is undefined in handleImageClick");
      return;
    }
    // Replace protected URL with public URL for viewing
    const publicUrl = originalUrl.replace('/api/upload/image/', '/api/upload/public/image/');
    console.log("PrescriptionDetails - handleImageClick publicUrl:", publicUrl, "isPdf:", filename.toLowerCase().endsWith('.pdf'));
    const isPdf = filename.toLowerCase().endsWith('.pdf');
    navigate('/image-viewer', { state: { imageUrl: publicUrl, isPdf } });
  };

  const handleEdit = async (fileId, currentName) => {
    setEditingFileId(fileId);
    setNewFilename(currentName);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setNewFilename("");
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated. Please log in.");
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload/update-name/${editingFileId}`,
        { newName: newFilename },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      

      console.log('Update response:', response.data);
      
      // Refresh prescriptions after successful update
      await fetchPrescriptions();
      
      console.log('Prescriptions after refresh:', prescriptions);

      setShowEditModal(false);
      alert(response.data.message);
    } catch (error) {
      console.error("Error updating filename:", error);
      alert("Failed to update filename. Please try again.");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated. Please log in.");
        return;
      }
  
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload/delete/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
  
      alert(response.data.message);
      setPrescriptions(prescriptions.filter((prescription) => prescription.fileId !== fileId));
    } catch (error) {
      console.error("Error deleting prescription:", error);
      alert("Failed to delete prescription. Please try again.");
    }
  };

  const handleDownload = async (originalUrl, filename) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated. Please log in.");
        return;
      }

      // Ensure filename has extension, if missing, extract from originalUrl
      let downloadFilename = filename;
      // If filename has no extension or extension is not an image extension, force .png for images
      const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
      const hasValidExtension = downloadFilename.includes('.') && imageExtensions.some(ext => downloadFilename.toLowerCase().endsWith('.' + ext));
      if (!hasValidExtension) {
        const urlParts = originalUrl.split('.');
        if (urlParts.length > 1) {
          let ext = urlParts[urlParts.length - 1].split(/[?#]/)[0]; // remove query/hash
          if (imageExtensions.includes(ext.toLowerCase())) {
            ext = 'png';
          }
          downloadFilename = `${downloadFilename}.${ext}`;
        }
      }

      const response = await axios.get(originalUrl, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Use content type from response headers for Blob
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadFilename || 'file');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  return (
    <>
      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3>Edit Filename</h3>
            <input
              type="text"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
              className="edit-input"
            />
            <div className="modal-buttons">
              <button 
                className="modal-button cancel"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button 
                className="modal-button save"
                onClick={handleSaveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="prescription-details-container">

        {prescriptions.length > 0 ? (
          <h2 className="bad">{folderName} Prescriptions</h2>

        ) : (
          <h2>No prescriptions added yet</h2>
        )}

        <Link to="/prescriptions" className="back-button">⬅ Back to Prescriptions</Link>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : prescriptions.length === 0 ? (
          <p>No prescriptions found in this folder.</p>
        ) : (
          <div className="prescription-images">
            {prescriptions.map((prescription, index) => (
              <div key={`${prescription.fileId}-${index}`} className="prescription-item">
                <div className="image-container">
                  <div className="image-wrapper">
                    {prescription.previewUrl ? (
                      prescription.filename.toLowerCase().endsWith('.pdf') ? (
                        <div
                          onClick={() => handleImageClick(prescription.originalUrl, prescription.filename)}
                          style={{ cursor: 'pointer', width: '100%', height: '200px' }}
                        >
                          <embed
                            src={prescription.previewUrl}
                            type="application/pdf"
                            className="prescription-image"
                            style={{ pointerEvents: 'none', width: '100%', height: '200px' }}
                          />
                        </div>
                      ) : (
                        <img
                          src={prescription.previewUrl}
                          alt={prescription.filename}
                          className="prescription-image"
                          loading="lazy"
                          onClick={() => handleImageClick(prescription.originalUrl, prescription.filename)}
                        />
                      )
                    ) : (
                      <div className="image-placeholder">
                        <span>Image not available</span>
                      </div>
                    )}
                  </div>
                  <div className="image-details">
                    <p className="filename">{prescription.filename}</p>
                    <p className="upload-date">Uploaded: {prescription.uploadDate}</p>
                    <div className="button-container">
                      <button 
                        className="edit-button"
                        onClick={() => handleEdit(prescription.fileId, prescription.filename)}
                      >
                        Edit Name
                      </button>

                    <button onClick={() => {
                      const publicUrl = prescription.originalUrl.replace('/api/upload/image/', '/api/upload/public/image/');
                      const isPdf = prescription.filename.toLowerCase().endsWith('.pdf');
                      navigate('/explain-report', { state: { fileId: prescription.fileId, imageUrl: publicUrl, isPdf } });
                    }}>
                      Explain Report
                    </button>


                      <button 
                        className="Download-button" 
                        onClick={() => handleDownload(prescription.originalUrl, prescription.filename)}
                      >
                        Download
                      </button>

                      <button 
                        className="Download-button" 
                        onClick={() => handleDelete(prescription.fileId)}
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PrescriptionDetails;