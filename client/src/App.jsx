import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import { 
  Siren, 
  Hospital as HospitalIcon, 
  Navigation, 
  Activity, 
  AlertTriangle,
  RotateCcw,
  Clock,
  Terminal,
  Cpu,
  ChevronDown
} from 'lucide-react';
import './App.css';

const API_BASE_URL = window.location.origin + '/api';

// --- CUSTOM PREMIUM DROPDOWN ---
const CustomSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="custom-select-container" ref={containerRef}>
            <div className={`custom-select-trigger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <span>{value}</span>
                <ChevronDown size={18} className={isOpen ? 'rotate' : ''} />
            </div>
            {isOpen && (
                <div className="custom-select-options">
                    {options.map(opt => (
                        <div key={opt} className={`custom-option ${value === opt ? 'selected' : ''}`} onClick={() => { onChange(opt); setIsOpen(false); }}>
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [emergencyType, setEmergencyType] = useState("Cardiac Arrest (Critical)");
  const [hospitals, setHospitals] = useState([]);
  const [userLoc, setUserLoc] = useState({ lat: 12.9716, lng: 77.5946 });
  const [logs, setLogs] = useState(["[SYSTEM] INITIALIZING DISPATCH CORE...", "[NETWORK] SECURE LINK READY."]);
  const [etaSeconds, setEtaSeconds] = useState(0);

  const logRef = useRef(null);
  const emergencyOptions = [
    "Minor Injury", 
    "Accident / Trauma (Critical)", 
    "Cardiac Arrest (Critical)", 
    "Respiratory Distress", 
    "Stroke (Critical)"
  ];

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/hospitals`);
        setHospitals(response.data);
      } catch (err) {
        addLog("[FAIL] DATABASE SYNC ERROR");
      }
    };
    fetchHospitals();
  }, [result]);

  useEffect(() => {
    let timer;
    if (result && etaSeconds > 0) {
        timer = setInterval(() => setEtaSeconds(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [result, etaSeconds]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const reportEmergency = () => {
    setLoading(true);
    setResult(null);
    setError(null);
    addLog("[UPLINK] BROADCASTING EMERGENCY REQUEST...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLoc(coords);
            addLog(`[GPS] LOCATION SYNCED`);
            handleReport(coords);
        },
        () => handleReport(userLoc)
      );
    } else {
      handleReport(userLoc);
    }
  };

  const handleReport = async (location) => {
    addLog("[AI] CALCULATING OPTIMAL RESPONSE ROUTE...");
    try {
      const response = await axios.post(`${API_BASE_URL}/report-emergency`, {
        location,
        type: emergencyType
      });

      addLog(`[SUCCESS] UNIT ${response.data.emergency.assignedAmbulance.regNumber} DISPATCHED.`);
      setEtaSeconds(285); 
      setResult(response.data);
      setLoading(false);
    } catch (err) {
      setError("COMMUNICATION ERROR: SYSTEM OFFLINE.");
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <nav className="navbar">
        <h1 className="logo-brand">
            <Siren size={50} strokeWidth={3} className="siren-icon-blink" /> 
            SMART AMBULANCE AI
        </h1>
      </nav>

      <div className="main-content">
        <div className="left-panel">
            <div className="status-hero">
                <h2 className="title">EMERGENCY DISPATCH</h2>
                <p className="subtitle">🛰️ AI_MEDICAL_ROUTING_PRO</p>
            </div>

            <MapComponent 
                userLocation={userLoc} 
                assignedHospital={result?.emergency?.assignedHospital} 
                assignedAmbulance={result?.emergency?.assignedAmbulance}
                hospitals={hospitals}
            />

            {!result && !loading && (
            <div className="action-card">
                <div className="input-group">
                    <label className="label"><AlertTriangle size={20} strokeWidth={3} /> SELECT EMERGENCY TYPE</label>
                    <CustomSelect 
                        value={emergencyType} 
                        options={emergencyOptions} 
                        onChange={(val) => setEmergencyType(val)} 
                    />
                </div>

                <button className="emergency-btn" onClick={reportEmergency}>
                EXECUTE DISPATCH
                </button>
            </div>
            )}

            {loading && (
            <div className="loading-state">
                <div className="glitch-spinner"></div>
                <p className="subtitle">🛰️ SCANNING NEARBY HOSPITALS... [LOADING]</p>
            </div>
            )}

            {error && <div className="error-card">{error}</div>}

            {result && (
            <div className="result-grid">
                <div className="status-banner">
                🚨 MISSION ACTIVE: UNIT {result.emergency.assignedAmbulance.regNumber} EN ROUTE
                </div>

                <div className="card">
                <h2 className="card-title"><Navigation size={22} strokeWidth={3} /> ASSIGNED AMBULANCE</h2>
                <div className="info-item">
                    <span className="label">VEHICLE_NUMBER</span>
                    <span className="value bold-white">{result.emergency.assignedAmbulance.regNumber}</span>
                </div>
                <div className="info-item">
                    <span className="label"><Clock size={16} strokeWidth={3} /> ESTIMATED_ETA</span>
                    <span className="badge-countdown">{formatTime(etaSeconds)}</span>
                </div>
            </div>

            <div className="card">
                <h2 className="card-title"><HospitalIcon size={22} strokeWidth={3} /> ASSIGNED HOSPITAL</h2>
                <div className="info-item">
                    <span className="label">HOSPITAL_NAME</span>
                    <span className="value bold-white">{result.emergency.assignedHospital.name}</span>
                </div>
                <div className="info-item">
                    <span className="label">SPECIALIZATION</span>
                    <span className="value cyan-text">
                        {result.emergency.assignedHospital.isCriticalCare ? "⚠️ [CRITICAL CARE READY]" : "🏠 [GENERAL CARE]"}
                    </span>
                </div>
            </div>

            <button className="reset-btn" onClick={() => setResult(null)}>
                <RotateCcw size={18} strokeWidth={3} /> RESTART SYSTEM
            </button>
        </div>
        )}
    </div>

        <div className="hospitals-sidebar">
            <h3 className="sidebar-title-static">
                <Activity size={24} strokeWidth={3} style={{marginRight: '12px'}} /> 
                NEARBY HOSPITALS
            </h3>
            <div className="hosp-list">
                {hospitals.map(h => (
                    <div key={h.id} className="hosp-item">
                        <span className="hosp-name">{h.name.toUpperCase()}</span>
                        <div className="hosp-details">
                            <span className={h.isCriticalCare ? "crit-badge" : "gen-badge"}>
                                {h.isCriticalCare ? "CRITICAL CARE" : "GENERAL CARE"}
                            </span>
                            <span className="availability">
                                <Activity size={12} strokeWidth={3} color={h.isCriticalCare ? '#ff1744' : '#00ff7f'} /> 
                                {h.availability} BEDS AVAILABLE
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="sidebar-title-static" style={{marginTop: '40px'}}>
                <Terminal size={24} strokeWidth={3} style={{marginRight: '12px'}} /> 
                RECENT ACTIVITY
            </h3>
            <div className="mission-logs" ref={logRef}>
                {logs.map((log, i) => (
                    <div key={i} className="log-line">{log}</div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
