import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import UploadForm from './components/UploadForm';
import './App.css';

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
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
          // Fallback or alert could go here
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleReportSubmitted = (newReport) => {
    setReports((prevReports) => [...prevReports, newReport]);
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
        
        <aside className="sidebar">
          <UploadForm 
            userLocation={userLocation} 
            onReportSubmitted={handleReportSubmitted} 
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
