const express = require('express');
const cors = require('cors');
const sequelize = require('../backend/database');
const Ambulance = require('../backend/models/Ambulance');
const Hospital = require('../backend/models/Hospital');
const Emergency = require('../backend/models/Emergency');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const emergencyRoutes = require('../backend/routes/emergencyRoutes');
app.use('/api', emergencyRoutes);

// Database Sync and Seeding
sequelize.sync({ force: true }) // REBUILD FOR MAP UPGRADE
    .then(async () => {
        console.log("✅ SQLite Database Synced (Map Upgrade)");
        
        // --- SEED SEED DATA IF EMPTY ---
        const ambulanceCount = await Ambulance.count();
        if (ambulanceCount === 0) {
            console.log("🚑 Seeding initial ambulances...");
            await Ambulance.bulkCreate([
                { regNumber: "AMB-01", lat: 12.9716, lng: 77.5946, isAvailable: true },
                { regNumber: "AMB-02", lat: 12.9279, lng: 77.6271, isAvailable: true },
                { regNumber: "AMB-03", lat: 13.0827, lng: 80.2707, isAvailable: true },
                { regNumber: "AMB-04", lat: 12.9141, lng: 77.6413, isAvailable: true },
                { regNumber: "AMB-05", lat: 12.9984, lng: 77.5912, isAvailable: true },
                { regNumber: "AMB-06", lat: 13.0561, lng: 77.5921, isAvailable: true }
            ]);
        }

        const hospitalCount = await Hospital.count();
        if (hospitalCount === 0) {
            console.log("🏥 Seeding dynamic hospital network...");
            await Hospital.bulkCreate([
                { name: "Super Specialist Health", lat: 12.9716, lng: 77.5946, traffic: 1, availability: 10, isCriticalCare: true },
                { name: "Downtown Trauma Center", lat: 12.9279, lng: 77.6271, traffic: 8, availability: 45, isCriticalCare: true },
                { name: "Green Park Hospital", lat: 13.0827, lng: 80.2707, traffic: 3, availability: 12, isCriticalCare: false },
                { name: "Riverside Care", lat: 12.9561, lng: 77.6921, traffic: 5, availability: 33, isCriticalCare: false },
                { name: "Global Heart Institute", lat: 12.9056, lng: 77.6021, traffic: 2, availability: 5, isCriticalCare: true },
                { name: "Skyline Multispeciality", lat: 12.9801, lng: 77.4921, traffic: 6, availability: 22, isCriticalCare: false },
                { name: "MediCross Central", lat: 13.0112, lng: 77.7121, traffic: 0, availability: 8, isCriticalCare: true },
                { name: "LifeLine Clinic", lat: 12.8712, lng: 77.5421, traffic: 4, availability: 18, isCriticalCare: false }
            ]);
        }
        // ------------------------------
    })
    .catch(err => {
        console.error("❌ Database sync error:", err);
    });

// Start Server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
