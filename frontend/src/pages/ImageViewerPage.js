import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import '../components/styles/ImageViewer.css';

const ImageViewerPage = () => {
  const location = useLocation();
  const { imageUrl, isPdf } = location.state || { imageUrl: null, isPdf: false };
  const [pdfUrl, setPdfUrl] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    console.log("ImageViewerPage - imageUrl:", imageUrl, "isPdf:", isPdf);

    if (isPdf) {
      // Use public URL to avoid auth issues
      const publicUrl = imageUrl.replace('/api/upload/image/', '/api/upload/public/image/');
      console.log("ImageViewerPage - pdf publicUrl:", publicUrl);
      setPdfUrl(publicUrl);
    } else {
      setPdfUrl(null);
    }
  }, [imageUrl, isPdf]);

  if (!imageUrl) {
    return <p>No file available.</p>;
  }

  const handleImgError = () => {
    setImgError(true);
  };

  return (
    <div className="overlay">
      <div className="full-image-container" style={{ height: '100vh', width: '100vw' }}>
        {isPdf ? (
          pdfUrl ? (
            <embed
              src={pdfUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          ) : (
            <p>Loading PDF...</p>
          )
        ) : (
          imgError ? (
            <p>Failed to load image.</p>
          ) : (
            <img
              src={imageUrl.replace('/api/upload/image/', '/api/upload/public/image/')}
              alt="Full View"
              className="full-image"
              onError={handleImgError}
            />
          )
        )}
        <button className="close-btn" onClick={() => window.history.back()}>✖</button>
      </div>
    </div>
  );
};

export default ImageViewerPage;
