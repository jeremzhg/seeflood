import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import UploadForm from './components/UploadForm';
import './App.css';

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    // Fetch existing reports
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/reports');
        if (response.data.status === 'success') {
          setReports(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchReports();
  }, []);

  const handleReportSubmitted = (newReport) => {
    setReports((prevReports) => [newReport, ...prevReports]);
    setShowModal(false);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>SeeFlood</h1>
      </header>
      
      <main className="main-content">
        <div className="map-wrapper">
          <MapComponent userLocation={userLocation} reports={reports} />
        </div>
        
        <button 
          className="fab" 
          onClick={() => setShowModal(true)}
          aria-label="Report Flood"
        >
          +
        </button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <UploadForm 
                userLocation={userLocation} 
                onReportSubmitted={handleReportSubmitted}
                onClose={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
