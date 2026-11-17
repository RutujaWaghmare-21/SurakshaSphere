# 🛡️ SurakshaSphere

### AI-Powered Personal Safety and Emergency Response Application

SurakshaSphere is a React-based personal safety application designed to provide users with quick access to emergency assistance features. It combines GPS-based location tracking, camera-based object detection, motion sensing, voice-triggered SOS, and emergency contact management in a single interface.

The goal is to provide multiple ways for users to trigger an emergency alert and access safety-related tools through a responsive web application.

---

## ✨ Key Features

### 🚨 1. Emergency SOS System
- Large and easily accessible SOS button.
- Triggers an emergency alert.
- Uses device vibration where supported.
- Opens the device's messaging application with a pre-filled emergency message and location link.
- Supports emergency contact selection.

### 📍 2. Live Location Tracking and Maps
- Uses the browser Geolocation API to retrieve the user's current location.
- Displays the location using Leaflet and React Leaflet.
- Shows the user's current position on the map.
- Displays demo danger zones and safe-zone boundaries.

### 🏠 3. Safe Zone and Geofencing
- Allows users to set their current location as a safe zone.
- Monitors the distance between the user's location and the saved safe zone.
- Triggers an SOS alert when the user moves beyond the configured 500-metre boundary.

### 🤖 4. AI-Based Camera Detection
- Uses TensorFlow.js and the COCO-SSD object detection model.
- Accesses the device camera with permission.
- Analyses camera frames for configured object classes.
- Attempts to identify detected hazards and trigger an alert.

### 📱 5. Shake Detection
- Uses the Device Motion API to monitor device movement.
- Detects repeated strong shaking.
- Triggers an emergency alert after the configured shake threshold is reached.
- Includes a sensor simulation interface for testing.

### 🎙️ 6. Voice-Activated SOS
- Uses browser speech recognition where supported.
- Listens for the keyword "help".
- Triggers an emergency alert when the keyword is recognised.

### 📞 7. Fake Call Feature
- Provides a simulated incoming-call interface.
- Offers accept and decline interactions as a potential exit strategy.

### ⚙️ 8. Additional Safety Features
- Emergency contact management.
- Audible emergency siren.
- Stealth mode.
- Dark and light themes.
- Battery status monitoring where supported.
- Notifications and alert history during the current session.
- Local storage for emergency contacts and safe-zone settings.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Building reusable UI components |
| JavaScript (ES6+) | Application logic and interactions |
| Vite | Development server and build tool |
| Tailwind CSS | Responsive styling |
| TensorFlow.js | Browser-based machine learning |
| COCO-SSD | Object detection |
| Leaflet | Interactive maps |
| React Leaflet | Integrating maps into React |
| Lucide React | Icons |
| Browser APIs | Geolocation, camera, device motion, speech recognition, vibration and local storage |

---

## 🏗️ Application Architecture

SurakshaSphere is implemented as a client-side React application.

```text
                    USER
                      |
                      v
              React Application
                      |
           +----------+----------+
           |          |          |
           v          v          v
         Home        Map       Camera
           |          |          |
           v          v          v
          SOS      GPS/Map   TensorFlow.js
           |                     |
           +----------+----------+
                      |
                Emergency Logic
                      |
           +----------+----------+
           |          |          |
           v          v          v
         Voice      Shake    Geofencing
           |          |          |
           +----------+----------+
                      |
                      v
               Emergency Alert
                      |
                      v
               SMS Application
```

---

## 🔄 How It Works

1. The user opens the application and grants the required browser permissions.
2. The application retrieves the user's location through the Geolocation API.
3. The user can access the map, camera detection, sensor tools and emergency settings.
4. Emergency events can be triggered manually or through supported detection mechanisms.
5. The application records an alert and activates the configured emergency response.
6. The SOS interface prepares a message containing emergency information and a location link.
7. The user can open their device's messaging application to send the message.

---

## 📂 Project Structure

```text
SurakshaSphere/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── tailwind.config.cjs
├── postcss.config.cjs
├── eslint.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- A modern web browser

### 1. Clone the repository

```bash
git clone https://github.com/RutujaWaghmare-21/SurakshaSphere.git
```

### 2. Navigate to the project directory

```bash
cd SurakshaSphere
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the application

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

---

## 🔐 Browser Permissions

Some features require browser permissions or device support:

- **Location:** Required for GPS tracking and geofencing.
- **Camera:** Required for object detection.
- **Motion sensors:** Required for shake detection.
- **Microphone:** Required for voice recognition.
- **Vibration:** Supported only on compatible devices and browsers.

For camera, microphone and location access, use HTTPS or localhost where required by the browser.

---

## ⚠️ Current Implementation Notes and Limitations

- The application is currently a frontend-focused implementation without a dedicated backend service.
- Emergency contacts and safe-zone information are stored in browser local storage.
- Danger-zone information displayed on the map uses demo coordinates rather than a verified real-time crime or hazard database.
- Camera detection depends on the available COCO-SSD model classes and browser/device performance. It should not be treated as a reliable fire or weapon detection system.
- The SOS workflow opens the device's messaging application with a pre-filled message. Actual message delivery requires user action.
- Speech recognition, battery monitoring, vibration and motion sensing depend on browser and device compatibility.
- The fake-call interface is a simulation and does not place or receive an actual phone call.

**Important:** SurakshaSphere is an academic/project prototype and should not be relied upon as a replacement for official emergency services or verified safety systems.

---

## 🔮 Future Enhancements

- Backend integration for secure user accounts and emergency-contact management.
- Verified real-time safety and hazard data.
- More reliable hazard detection models.
- Automated emergency notification services with appropriate permissions and integrations.
- Caregiver or trusted-contact dashboard.
- Improved offline functionality.
- More comprehensive testing across mobile devices and browsers.

---



---

*SurakshaSphere — Technology for a safer tomorrow.*
