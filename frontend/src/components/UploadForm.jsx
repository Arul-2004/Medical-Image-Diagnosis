import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

const UploadForm = ({ onUploadSuccess, onUploadStart }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Only accept images
    if (!file.type.match('image.*')) {
      alert("Please upload an image file (e.g. JPG, PNG)");
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    onUploadStart();
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await axios.post('http://localhost:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onUploadSuccess(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to analyze image. Please ensure backend is running.");
      onUploadSuccess({ error: true });
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>
        Upload Scan
      </h2>
      
      {!preview ? (
        <form 
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input 
            id="file-upload" 
            type="file" 
            accept="image/*" 
            onChange={handleChange} 
            style={{ display: 'none' }}
          />
          <UploadCloud className="upload-icon" />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Drag & drop an X-ray or MRI
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            or click to browse files (JPEG, PNG)
          </p>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <img src={preview} alt="Upload preview" className="preview-image" />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="clear-btn" onClick={clearSelection}>
              Cancel
            </button>
            <button className="upload-btn" onClick={handleSubmit}>
              Analyze Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
