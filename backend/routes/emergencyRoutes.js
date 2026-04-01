const express = require('express');
const router = express.Router();
const Ambulance = require('../models/Ambulance');
const Hospital = require('../models/Hospital');
const Emergency = require('../models/Emergency');

// Simple Euclidean Distance Calculator
const calculateDistance = (loc1, loc2) => {
    return Math.sqrt(
        Math.pow(loc1.lat - loc2.lat, 2) + Math.pow(loc1.lng - loc2.lng, 2)
    ) * 111; // Approx 111 km per degree for rough calculation
};

// POST Report Emergency
router.post('/report-emergency', async (req, res) => {
    try {
        const { location, type } = req.body; // location: { lat, lng }

        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({ error: "Location coordinates required" });
        }

        console.log("📡 New Emergency Reported at:", location);

        // 1. Find all available ambulances using Sequelize
        const availableAmbulances = await Ambulance.findAll({ where: { isAvailable: true } });
        
        if (availableAmbulances.length === 0) {
            return res.status(500).json({ error: "No available ambulances found" });
        }

        // Find nearest ambulance
        let nearestAmbulance = availableAmbulances[0];
        let minDistanceAmbulance = calculateDistance(location, { lat: nearestAmbulance.lat, lng: nearestAmbulance.lng });

        availableAmbulances.forEach((amb) => {
            const dist = calculateDistance(location, { lat: amb.lat, lng: amb.lng });
            if (dist < minDistanceAmbulance) {
                minDistanceAmbulance = dist;
                nearestAmbulance = amb;
            }
        });

        console.log("🚑 Closest Ambulance Found:", nearestAmbulance.regNumber, "at dist:", minDistanceAmbulance.toFixed(2));

        // 2. Select Best Hospital using Sequelize
        const hospitals = await Hospital.findAll();
        if (hospitals.length === 0) {
            return res.status(500).json({ error: "No hospitals found in database" });
        }

        // Score = distance + traffic - availability
        let bestHospital = null;
        let lowestScore = Infinity;

        hospitals.forEach((hosp) => {
            const dist = calculateDistance(location, { lat: hosp.lat, lng: hosp.lng });
            
            // Score = distance + traffic - availability - (criticalCareBonus if emergency is critical)
            const isCriticalEmergency = type && (type.includes("Critical") || type.includes("Accident") || type.includes("Cardiac"));
            const criticalBonus = (isCriticalEmergency && hosp.isCriticalCare) ? 15 : 0;
            
            const score = dist + (hosp.traffic || 0) - (hosp.availability || 0) - criticalBonus;
            
            if (score < lowestScore) {
                lowestScore = score;
                bestHospital = hosp;
            }
        });

        console.log("🏥 Best Hospital Selected:", bestHospital.name, "with score:", lowestScore.toFixed(2));

        // 3. Mark Ambulance as Unavailable
        nearestAmbulance.isAvailable = false;
        await nearestAmbulance.save();

        // 4. Save the Emergency
        const newEmergency = await Emergency.create({
            lat: location.lat,
            lng: location.lng,
            type: type || "Emergency",
            status: "Assigned",
            AmbulanceId: nearestAmbulance.id,
            HospitalId: bestHospital.id
        });

        // 5. Populate and Return Response
        const populatedEmergency = await Emergency.findByPk(newEmergency.id, {
            include: [Ambulance, Hospital]
        });

        res.json({
            message: "Emergency reported and ambulance dispatched!",
            emergency: {
                assignedAmbulance: populatedEmergency.Ambulance,
                assignedHospital: populatedEmergency.Hospital,
                status: populatedEmergency.status,
                location: { lat: populatedEmergency.lat, lng: populatedEmergency.lng }
            }
        });

    } catch (err) {
        console.error("❌ ERROR REPORTING EMERGENCY:", err.message);
        console.error(err.stack);
        res.status(500).json({ error: "Internal Server Error", detail: err.message });
    }
});

// GET All Hospitals
router.get('/hospitals', async (req, res) => {
    try {
        const hospitals = await Hospital.findAll();
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch hospitals" });
    }
});

// GET All Ambulances
router.get('/ambulances', async (req, res) => {
    try {
        const ambulances = await Ambulance.findAll();
        res.json(ambulances);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch ambulances" });
    }
});

module.exports = router;
