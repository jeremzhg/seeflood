import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = ({ userLocation, onReportSubmitted, onClose }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
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
                // Reset file input
                e.target.reset();
                if (onClose) onClose();
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.response?.data?.error || "Failed to submit report.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-form-container">
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
                <div className="form-group">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="file-input"
                    />
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
