const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Ambulance = require('./Ambulance');
const Hospital = require('./Hospital');

const Emergency = sequelize.define('Emergency', {
    lat: { type: DataTypes.FLOAT, allowNull: false },
    lng: { type: DataTypes.FLOAT, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: "General" },
    status: { type: DataTypes.ENUM('Pending', 'Assigned', 'Completed'), defaultValue: 'Pending' }
});

// Relationships
Emergency.belongsTo(Ambulance);
Emergency.belongsTo(Hospital);

module.exports = Emergency;
