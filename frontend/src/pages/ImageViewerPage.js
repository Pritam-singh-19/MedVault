import React from "react";
import { useLocation } from "react-router-dom";
import "../components/styles/ImageViewer.css";


const ImageViewerPage = () => {
  const location = useLocation();
  const { imageUrl } = location.state || { imageUrl: null };

  if (!imageUrl) {
    return <p>No image available.</p>;
  }

  return (
    <div className="overlay">
      <div className="full-image-container">
        <img src={imageUrl} alt="Full View" className="full-image" />
        <button className="close-btn" onClick={() => window.history.back()}>✖</button>
      </div>
    </div>
  );
};

export default ImageViewerPage;
