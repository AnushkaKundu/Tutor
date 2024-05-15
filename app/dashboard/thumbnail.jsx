import React, { useState, useEffect } from 'react';
import { getDownloadURL, ref, getStorage } from 'firebase/storage';
import firebase from '../firebaseConfig'; // Import your Firebase configuration

async function generateThumbnail(pdfUrl) {
  // Create a reference to the PDF file in Cloud Storage
  const storageRef = ref(getStorage(firebase), pdfUrl);

  // Get a temporary download URL for the PDF
  const downloadUrl = await getDownloadURL(storageRef);

  // CORS-compliant approach using a serverless function (Firebase Cloud Function)
  const response = await fetch('/api/generate-thumbnail', {
    method: 'POST',
    body: JSON.stringify({ downloadUrl }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to generate thumbnail');
  }

  const thumbnailData = await response.json();
  return thumbnailData.thumbnailUrl;
}

const Thumbnail = ({ url }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const thumbnail = await generateThumbnail(url);
        setThumbnailUrl(thumbnail);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchThumbnail();
  }, [url]); // Re-run useEffect when url changes

  return (
    <div style={{ width: '100%' }}> {/* Set width to 100% of containing element */}
      {thumbnailUrl && (
        <img src={thumbnailUrl} alt="PDF Thumbnail" />
      )}
      {error && <p>Error generating thumbnail: {error}</p>}
    </div>
  );
};

export default Thumbnail;
