import React, { useRef, useEffect, useState } from 'react';

const CameraCapture = ({ onCapture, onCancel }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let currentStream;

        const startCamera = async () => {
            try {
                const constraints = {
                    video: {
                        facingMode: { ideal: "environment" }
                    }
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(mediaStream);
                currentStream = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please ensure permissions are granted.");
            }
        };

        startCamera();

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                }
            }, 'image/jpeg', 0.8);
        }
    };

    return (
        <div className="camera-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {error ? (
                <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
                    <p>{error}</p>
                    <button onClick={onCancel} style={{ padding: '10px 20px', marginTop: '20px' }}>Close</button>
                </div>
            ) : (
                <>
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="camera-controls" style={{
                        position: 'absolute',
                        bottom: '30px',
                        display: 'flex',
                        gap: '20px',
                        width: '100%',
                        justifyContent: 'center'
                    }}>
                        <button 
                            onClick={onCancel} 
                            style={{
                                padding: '15px 30px',
                                borderRadius: '30px',
                                border: 'none',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={takePhoto} 
                            style={{
                                padding: '15px 30px',
                                borderRadius: '30px',
                                border: 'none',
                                backgroundColor: '#ffffff',
                                color: '#000',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                            }}
                        >
                            Snap Photo
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraCapture;
