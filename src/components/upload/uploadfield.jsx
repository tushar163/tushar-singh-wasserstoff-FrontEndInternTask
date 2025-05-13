"use client";
import React, { useRef, useState } from 'react';
import "./uploadfield.css"; // Assuming you have a CSS file for styling
const UploadBox = () => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      if (file.size <= 5 * 1024 * 1024) { // 5MB
        setFileName(file.name);
      } else {
        alert('File size exceeds 5MB.');
      }
    } else {
      alert('Only .png or .jpg files are allowed.');
    }
  };

  return (
    <div className="upload-container">
      <label className="upload-label">Upload Avatar</label>
      <div
        onClick={handleClick}
        className="upload-box"
      >
        {fileName ? fileName : 'Drag and drop or click to upload'}
      </div>
      <input
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="file-input"
      />
      <p className="upload-hint">Only .png and .jpg files under 5MB.</p>
    </div>
  );
};

export default UploadBox;