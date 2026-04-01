import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🛑 PRECISION MEDICAL SVGS (LOCAL)
const createSVGIcon = (html, color) => L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="color: ${color}; filter: drop-shadow(0 0 10px ${color});">${html}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

// ⭐ OFFICIAL STAR OF LIFE (AMBULANCE)
const starOfLifeSVG = `
<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
  <path d="M10.5,2H13.5V6.03L16.29,4.42L17.79,7.02L15,8.63L18.66,10.74L17.16,13.34L13.5,11.23V15H10.5V11.23L6.84,13.34L5.34,10.74L9,8.63L6.21,7.02L7.71,4.42L10.5,6.03V2Z"/>
</svg>`;

// 🏥 OFFICIAL HOSPITAL CROSS
const hospitalSVG = `
<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
  <path d="M19,3H5C3.89,3 3,3.9 3,5V19C3,20.11 3.89,21 5,21H19C20.11,21 21,20.11 21,19V5C21,3.9 20.11,3 19,3M18,12.5H13.5V17H10.5V12.5H6V9.5H10.5V5H13.5V9.5H18V12.5Z"/>
</svg>`;

// 🚨 EMERGENCY RADAR
const radarSVG = `
<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10" opacity="0.3"/>
  <circle cx="12" cy="12" r="6" opacity="0.5"/>
  <circle cx="12" cy="12" r="2" fill="currentColor"/>
</svg>`;

const hospitalIcon = createSVGIcon(hospitalSVG, '#00ff7f');
const ambulanceMarkerIcon = createSVGIcon(starOfLifeSVG, '#00f5ff');

// Helper to auto-recenter map
function ChangeView({ center }) {
    const map = useMap();
    React.useEffect(() => {
        if (center) {
            const pos = Array.isArray(center) ? center : [center.lat || 12.9716, center.lng || 77.5946];
            map.setView(pos, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const MapComponent = ({ userLocation, assignedHospital, hospitals, assignedAmbulance }) => {
    const defaultCenter = userLocation || [12.9716, 77.5946];
    const centerPos = Array.isArray(defaultCenter) ? defaultCenter : [defaultCenter.lat, defaultCenter.lng];

    return (
        <div style={{ height: '450px', width: '100%', borderRadius: '30px', overflow: 'hidden', marginBottom: '30px', boxShadow: '0 20px 60px rgba(0,0,0,1)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <MapContainer center={centerPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                <ChangeView center={centerPos} />

                {/* 🚨 Emergency Location (Pulsing) */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({
                        className: 'pulse-marker',
                        html: `<div class="pulse-ring"></div><div class="pulse-point"></div>`,
                        iconSize: [20, 20], iconAnchor: [10, 10]
                    })}>
                        <Popup>🚨 EMERGENCY CORE_ZONE</Popup>
                    </Marker>
                )}

                {/* 🚑 Assigned Ambulance (Official STAR OF LIFE) */}
                {assignedAmbulance && (
                    <>
                        <Marker position={[assignedAmbulance.lat, assignedAmbulance.lng]} icon={ambulanceMarkerIcon}>
                            <Popup>🚑 UNIT: {assignedAmbulance.regNumber}</Popup>
                        </Marker>
                        <Polyline positions={[[assignedAmbulance.lat, assignedAmbulance.lng], [userLocation.lat, userLocation.lng]]} color="#00f5ff" weight={4} dashArray="5, 10"/>
                    </>
                )}

                {/* 🏥 All Hospitals (H-CROSS) */}
                {hospitals.map(hosp => (
                    <Marker key={hosp.id} position={[hosp.lat, hosp.lng]} icon={hospitalIcon} opacity={hosp.id === assignedHospital?.id ? 1 : 0.4}>
                        <Popup><strong>{hosp.name}</strong><br/>{hosp.isCriticalCare ? "⚠️ ICU_READY" : "GENERAL"}</Popup>
                    </Marker>
                ))}

                {/* 🏥 Connections */}
                {assignedHospital && (
                    <Polyline positions={[[userLocation.lat, userLocation.lng], [assignedHospital.lat, assignedHospital.lng]]} color="#ff1744" weight={5} dashArray="1, 12"/>
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
