import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import "../components/styles/explainreport.css";
import ChatBot from '../components/Chatbot';

const ExplainReport = () => {
  const location = useLocation();
  const fileId = location.state?.fileId || null;
  const imageUrl = location.state?.imageUrl || null;
  const passedIsPdf = location.state?.isPdf ?? null;

  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // More reliable PDF detection
  const isProbablyPdf = (url) => {
    return (
      url?.toLowerCase().endsWith('.pdf') ||
      url?.includes('application/pdf') ||
      (url?.startsWith('blob:') && url.includes('.pdf')) ||
      url?.includes('data:application/pdf')
    );
  };

  // Use passed isPdf flag if available, else fallback to URL detection
  const isPdf = passedIsPdf !== null ? passedIsPdf : isProbablyPdf(imageUrl);


  useEffect(() => {
    const extractTextAndSummarize = async () => {
      if (!fileId && !imageUrl) {
        setError('⚠️ No file or text provided.');
        return;
      }

      setLoading(true);
      setError('');
      setSummary('');

      try {
        const token = localStorage.getItem('token');
        let response;

        if (fileId && isPdf) {
          // For PDFs, send fileId to backend
          response = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/explain-report`,
            { fileId },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );
        } else {
          // For images, perform OCR and send extracted text
          const Tesseract = (await import('tesseract.js')).default;
          const { data: { text: ocrText } } = await Tesseract.recognize(
            imageUrl,
            'eng',
            {
              logger: m => console.log(m.status, m.progress)
            }
          );

          response = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/explain-report`,
            { text: ocrText },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );
        }

        if (response.data?.summary) {
          setSummary(response.data.summary);
        } else {
          setError('❌ Failed to get summary from backend.');
        }
      } catch (err) {
        console.error('Error during summary:', err);
        setError(err.message || '❌ Something went wrong while analyzing your report.');
      } finally {
        setLoading(false);
      }
    };

    extractTextAndSummarize();
  }, [fileId, imageUrl, isPdf]);

  return (
    <div className="explain-report-container">
      <div className="explain-report-title">
        📄 Explain Report
      </div>

      {!imageUrl && <p>No image or PDF selected.</p>}

      {imageUrl && (
        <>
          <div className="explain-report-media">
            {isPdf ? (
              <embed
                src={imageUrl}
                type="application/pdf"
                width="100%"
                height="400px"
              />
            ) : (
              <img
                src={imageUrl}
                alt="Report"
              />
            )}
          </div>

          {loading && (
            <div className="explain-report-loading">
              🔄 Processing report, please wait...
            </div>
          )}
          {error && (
            <div className="explain-report-error">{error}</div>
          )}

          {!loading && !error && summary && (
            <>
              <div className="explain-report-summary-section">
                <h3>✅ Summary:</h3>
                <pre>{summary}</pre>
              </div>
              <div style={{ width: '100%' }}>
                <ChatBot summary={summary} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};


export default ExplainReport;

