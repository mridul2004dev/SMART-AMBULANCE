const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Hospital = sequelize.define('Hospital', {
    name: { type: DataTypes.STRING, allowNull: false },
    lat: { type: DataTypes.FLOAT, allowNull: false },
    lng: { type: DataTypes.FLOAT, allowNull: false },
    traffic: { type: DataTypes.INTEGER, defaultValue: 0 },
    availability: { type: DataTypes.INTEGER, defaultValue: 0 },
    isCriticalCare: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Hospital;
