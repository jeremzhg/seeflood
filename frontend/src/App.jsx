import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import UploadForm from './components/UploadForm';
import './App.css';

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [reports, setReports] = useState([]);

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
