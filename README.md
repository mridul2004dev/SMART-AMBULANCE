# AI-Powered Emergency Response and Smart Ambulance Routing System

A full-stack MERN application for managing medical emergencies by assigning the nearest available ambulance and the most optimal hospital based on proximity, traffic, and availability.

## Folder Structure
```
emergency-response-system/
├── backend/                # Node.js + Express + MongoDB
│   ├── models/             # Mongoose Schemas (Ambulance, Hospital, Emergency)
│   ├── routes/             # API Endpoints & Scoring Logic
│   └── server.js           # Server Entry & DB Seeding
└── client/                 # Vite + React (Modern Frontend)
    ├── src/                # App Logic & Styles
    ├── index.html          # Entry Point
    └── package.json
```

## Setup Instructions

### 1. Prerequisites
- Node.js installed (supports v20+)
- MongoDB installed and running (default: `localhost:27017`)

### 2. Backend Setup
```bash
cd backend
npm install
node server.js
```
The server will automatically seed initial ambulance and hospital data into your MongoDB database.

### 3. Frontend Setup (Vite)
```bash
cd client
npm install
npm run dev
```
The application will be available at the URL shown in the terminal (usually `http://localhost:5173`).

## How the System Works
1.  **Report Emergency**: The user clicks the "Report Emergency" button.
2.  **Geolocation**: The browser captures the user's current GPS coordinates (lat, lng).
3.  **Ambulance Selection**: The backend identifies the nearest available ambulance using Euclidean distance.
4.  **Hospital Scoring**: The system calculates a score for all hospitals using the formula:
    `score = distance + (traffic score * 2) - bed availability`
    The hospital with the **lowest** score is selected.
5.  **Response**: The system returns the assigned ambulance and selected hospital details to the user.
