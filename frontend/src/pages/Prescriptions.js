import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/styles/Prescriptions.css";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

 const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload/folders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.folders) {
        const foldersData = response.data.folders.reduce((acc, folder) => {
          acc[folder.folderName] = folder.images;
          return acc;
        }, {});

        setPrescriptions(foldersData);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderName) => {
    navigate(`/prescriptions/${folderName}`);
  };

  const handleDeleteFolder = async (folderName) => {
    if (!window.confirm(`Are you sure you want to delete the folder '${folderName}'?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
 await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload/folders/${folderName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update state to remove the deleted folder
      const updatedPrescriptions = { ...prescriptions };
      delete updatedPrescriptions[folderName];
      setPrescriptions(updatedPrescriptions);
    } catch (error) {
      alert("Failed to delete folder. Please try again.");
    }
  };

  return (
    <div className="prescriptions-container">
      <h2><u>My Prescriptions</u></h2>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching your prescriptions... Please wait. 🩺📜</p>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : Object.keys(prescriptions).length === 0 ? (
        <p className="no-prescriptions">No prescriptions uploaded yet. 🩺📜</p>
      ) : (
        <div>
          {Object.keys(prescriptions).map((folderName) => (
            <div key={folderName} className="folder">
              <div className="folder-header">
                <h3 className="folder-link" onClick={() => handleFolderClick(folderName)}>
                  {`📁 ${folderName} (${prescriptions[folderName].length})`}
                </h3>
                <button 
                    className="delete-folder-btn"
                    onClick={() => handleDeleteFolder(folderName)}
                  >
                    🗑 Delete Folder
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;