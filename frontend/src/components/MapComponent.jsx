import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RiskColors = {
    none: 'green',
    light_yellow: '#FFFFE0',
    yellow: 'yellow',
    light_red: '#FF7F7F',
    red: 'red'
};

// Component to update map center when location changes
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const MapComponent = ({ userLocation, reports }) => {
    const defaultCenter = [51.505, -0.09]; // Default to London if no location
    const center = userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter;

    const getMarkerIcon = (riskLevel) => {
        const color = RiskColors[riskLevel] || 'blue';
        // Create a custom div icon with the color
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    };

    return (
        <div className="map-container">
            <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {userLocation && (
                    <Marker position={[userLocation.latitude, userLocation.longitude]}>
                        <Popup>
                            Your Location
                        </Popup>
                    </Marker>
                )}

                {reports.map((report) => (
                    <Marker 
                        key={report.id} 
                        position={[report.latitude, report.longitude]}
                        icon={getMarkerIcon(report.risk_level)}
                    >
                        <Popup>
                            <div>
                                <h3>Flood Report</h3>
                                <p>Risk: {report.risk_level}</p>
                                <p>Depth: {report.flood_depth}</p>
                                {report.image_url && (
                                    <img 
                                        src={`http://localhost:8080/${report.image_url}`} 
                                        alt="Flood" 
                                        style={{ width: '100px', height: 'auto' }} 
                                    />
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
