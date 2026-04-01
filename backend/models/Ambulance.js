const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Ambulance = sequelize.define('Ambulance', {
    regNumber: { type: DataTypes.STRING, allowNull: false },
    lat: { type: DataTypes.FLOAT, allowNull: false },
    lng: { type: DataTypes.FLOAT, allowNull: false },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = Ambulance;
