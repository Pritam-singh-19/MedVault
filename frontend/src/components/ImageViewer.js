import React, { useState } from "react";
import "./styles/ImageViewer.css";

const ImageViewer = ({ imageUrl }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openImage = () => setIsOpen(true);
  const closeImage = (e) => {
    e.stopPropagation(); // Prevents click propagation issues
    setIsOpen(false);
  };

  return (
    <div>
      {/* Thumbnail Image */}
      <img
        src={imageUrl}
        alt="Thumbnail"
        className="thumbnail"
        onClick={openImage}
      />

      {/* Enlarged Image View */}
      {isOpen && (
        <div className="overlay" onClick={closeImage}>
          <div className="full-image-container">
            <img src={imageUrl} alt="Full View" className="full-image" />
            <button className="close-btn" onClick={closeImage}>✖</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
