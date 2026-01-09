import React, { useState, useRef } from 'react';
import axios from 'axios';
import CameraCapture from './CameraCapture';

const UploadForm = ({ userLocation, onReportSubmitted, onClose }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile);
            setPreview(URL.createObjectURL(droppedFile));
            setError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select an image.");
            return;
        }
        if (!userLocation) {
            setError("Location not available yet.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('latitude', userLocation.latitude);
        formData.append('longitude', userLocation.longitude);

        try {
            const response = await axios.post('http://localhost:8080/api/report', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data.status === 'success') {
                onReportSubmitted(response.data.data);
                setFile(null);
                setPreview(null);
                if (onClose) onClose();
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.response?.data?.error || "Failed to submit report.");
        } finally {
            setLoading(false);
        }
    };

    const handleCameraCapture = (file) => {
        setFile(file);
        setPreview(URL.createObjectURL(file));
        setError(null);
        setShowCamera(false);
    };

    return (
        <div className="upload-form-container">
            {showCamera && (
                <CameraCapture 
                    onCapture={handleCameraCapture} 
                    onCancel={() => setShowCamera(false)} 
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Report Flood</h2>
                {onClose && (
                    <button onClick={onClose} className="close-button" aria-label="Close">
                        &times;
                    </button>
                )}
            </div>
            
            {userLocation ? (
                <p className="location-info">
                    Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </p>
            ) : (
                <p className="location-warning">Waiting for location...</p>
            )}
            
            <form onSubmit={handleSubmit}>
                <div 
                    className="file-upload-area"
                    onClick={() => fileInputRef.current.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="file-input-hidden"
                        ref={fileInputRef}
                    />
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="file-input-hidden"
                        ref={fileInputRef}
                    />
                    
                    {preview ? (
                        <div className="image-preview">
                            <img src={preview} alt="Preview" />
                            <p className="file-name">{file.name}</p>
                        </div>
                    ) : (
                        <div className="upload-placeholder">
                            <span className="upload-icon">📷</span>
                            <p>Click or drag image here</p>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}
                                    className="secondary-button"
                                    style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', position: 'relative', zIndex: 10 }}
                                >
                                    Take Photo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <button 
                    type="submit" 
                    disabled={loading || !userLocation} 
                    className="submit-button"
                    style={{ width: '100%', marginTop: '1rem' }}
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
};

export default UploadForm;
