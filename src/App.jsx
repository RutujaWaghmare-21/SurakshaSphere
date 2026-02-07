import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, MapPin, Mic, Camera, 
  Activity, Users, Flame, Bell, 
  Phone, Radio, AlertTriangle, Smartphone, Search, 
  Settings, EyeOff, Wifi, WifiOff, X, 
  Battery, BatteryCharging, Moon, Sun, Trash2,
  Plus, Home, UserPlus, PhoneCall, PhoneOff
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
// --- UI Components ---

const GlassCard = ({ children, className = "", onClick, isDark = true }) => (
  <div 
    onClick={onClick} 
    className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-5 shadow-2xl transition-all duration-300 
    ${isDark 
      ? 'bg-gray-900/40 border-white/10 hover:bg-gray-800/40 hover:border-blue-500/30' 
      : 'bg-white/60 border-black/5 hover:bg-white/80 hover:border-blue-500/30 shadow-gray-200/50'} 
    ${className}`}
  >
    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent opacity-50 ${isDark ? 'via-white/20' : 'via-black/10'}`}></div>
    {children}
  </div>
);

const NavBtn = ({ icon: Icon, active, onClick, isDark }) => (
  <button 
    onClick={onClick}
    className={`relative group p-2 transition-all ${active ? 'text-blue-500' : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')}`}
  >
    <Icon size={24} className={`transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
    {active && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>}
  </button>
);
const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return 0;
  const R = 6371e3; 
  const lat1 = point1.latitude ?? point1[0];
  const lon1 = point1.longitude ?? point1[1];
  const lat2 = point2.latitude ?? point2[0];
  const lon2 = point2.longitude ?? point2[1];

  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
// --- Sub Views ---

const SOSScreen = ({ onClose, alerts, contacts, location }) => {
  const sendSmsManually = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    // Use ; for iOS and ? for Android for the body separator
    const separator = isIOS ? ';' : '?'; 
    
    const primaryContact = (contacts && contacts.length > 0) ? contacts[0].number : '112';
    
    // Use a standard Google Maps URL - it's more reliable than the usercontent one
    const lat = location?.latitude || "";
    const lng = location?.longitude || "";
    const mapsUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : "Location Unavailable";
    
    const smsBody = `EMERGENCY! I need help. My location: ${mapsUrl}`;
    
    // Create the URI
    const finalUrl = `sms:${primaryContact}${separator}body=${encodeURIComponent(smsBody)}`;
    
    console.log("User-initiated SMS launch:", finalUrl);
    
    // Use window.location.assign for better mobile compatibility
    window.location.assign(finalUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0f0202] text-center">
      <div className="absolute inset-0 bg-red-600 animate-pulse opacity-20"></div>
      <div className="relative z-10 w-full max-w-sm">
          <AlertTriangle size={80} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-2">SOS SENT</h1>
          <p className="text-red-300 mb-8">{alerts[0]?.type || 'EMERGENCY TRIGGERED'}</p>
          
          <button 
            onClick={sendSmsManually}
            className="w-full py-5 mb-4 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl animate-bounce"
          >
            SEND SMS NOW
          </button>

          <button onClick={onClose} className="w-full py-4 bg-white/10 text-white rounded-2xl border border-white/20">
            CANCEL
          </button>
      </div>
    </div>
  );
};

const HomeView = ({ onTrigger, location, isDark, setFakeCallActive }) => (
  <div className="p-6 space-y-8">
    <div className="flex justify-center py-4">
      <button onClick={() => onTrigger('MANUAL PANIC')} className="group relative w-64 h-64 rounded-full flex items-center justify-center transition-transform active:scale-95">
        <div className="absolute inset-0 bg-red-600 rounded-full blur-[40px] opacity-40 animate-pulse group-hover:opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-red-500 to-red-800 rounded-full shadow-[inset_0_4px_20px_rgba(255,255,255,0.3),0_10px_30px_rgba(185,28,28,0.5)] border-4 border-red-950/50"></div>
        <div className="relative z-10 flex flex-col items-center"><Shield className="w-20 h-20 text-white drop-shadow-lg mb-2" /><span className="text-4xl font-black text-white tracking-widest drop-shadow-lg font-mono">SOS</span></div>
      </button>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <GlassCard className="flex flex-col gap-2" isDark={isDark}><div className="flex items-center gap-2 text-green-500 mb-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]"></div><span className="text-xs font-bold uppercase tracking-wider">Status</span></div><span className={`text-2xl font-mono tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>SECURE</span></GlassCard>
      <GlassCard className="flex flex-col gap-2" isDark={isDark}><div className="flex items-center gap-2 text-blue-500 mb-1"><MapPin size={12} /><span className="text-xs font-bold uppercase tracking-wider">Location</span></div><span className={`text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{location ? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}` : 'Scanning...'}</span></GlassCard>
    </div>
    <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Quick Access</h3>
        <button onClick={() => setFakeCallActive(true)} className={`w-full border p-4 rounded-xl flex items-center gap-4 transition-all group ${isDark ? 'bg-gray-800/50 hover:bg-gray-800 border-white/5' : 'bg-white/50 hover:bg-white border-black/5'}`}><div className="bg-purple-500/10 p-2 rounded-lg text-purple-500 group-hover:text-purple-400"><Phone size={20} /></div><div className="text-left"><div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Fake Call</div><div className="text-xs text-gray-500">Exit Strategy</div></div></button>
    </div>
  </div>
);

const MapView = ({ location, isDark, safeZone }) => {
  const position = location ? [location.latitude, location.longitude] : [20.5937, 78.9629];

  // Mock data for your demo: High-risk areas
  const redZones = [
    { id: 1, center: [location?.latitude + 0.005, location?.longitude + 0.005], radius: 300, label: "High Crime Area" },
    { id: 2, center: [location?.latitude - 0.008, location?.longitude - 0.002], radius: 400, label: "Unlit Zone" }
  ];

  return (
    <div className="h-full w-full relative">
      <MapContainer center={position} zoom={14} className="h-full w-full">
        <TileLayer
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />
        
        {location && (
          <>
            <Marker position={position}><Popup>Current Location</Popup></Marker>

            {/* --- SAFE ZONE (GREEN) --- */}
            {safeZone && (
              <Circle 
                center={[safeZone.latitude, safeZone.longitude]} 
                radius={500} 
                pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.15, dashArray: '5, 10' }}
              >
                <Popup>Safe Geofence Active</Popup>
              </Circle>
            )}

            {/* --- RED ZONES (DANGER) --- */}
            {redZones.map(zone => (
              <Circle 
                key={zone.id}
                center={zone.center} 
                radius={zone.radius} 
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3 }}
              >
                <Popup>{zone.label}</Popup>
              </Circle>
            ))}
          </>
        )}
      </MapContainer>

      {/* Map Legend HUD */}
      <div className="absolute bottom-24 left-4 z-[1000] space-y-2 pointer-events-none">
         <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-green-500/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-white font-mono">SAFE PATHS ACTIVE</span>
         </div>
         <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-red-500/50">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-[10px] text-white font-mono">DANGER ZONES DETECTED</span>
         </div>
      </div>
    </div>
  );
};
const CameraAIView = ({ onAlert, isDark }) => {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionTimeout = useRef(null);
  const lastSeenRef = useRef(0);
  // Load Model on Mount
  useEffect(() => {
      const loadModel = async () => {
          const loadedModel = await cocossd.load();
          setModel(loadedModel);
          console.log("AI Model Loaded");
      };
      loadModel();
  }, []);

  // Detection Logic
  const detectFrame = async () => {
    if (model && videoRef.current && videoRef.current.readyState === 4) {
        const predictions = await model.detect(videoRef.current);
        
        const hazard = predictions.find(p => 
          (p.class === 'knife' || p.class === 'fire') && p.score > 0.45 
        );
      
        if (hazard) {
          lastSeenRef.current = Date.now(); 
          
          if (!detectionTimeout.current) {
            detectionTimeout.current = setTimeout(() => {
              if (Date.now() - lastSeenRef.current < 500) {
                onAlert(`AI DETECTED: ${hazard.class.toUpperCase()}`);
              }
              detectionTimeout.current = null;
            }, 2000);
          }
        } else {
          if (Date.now() - lastSeenRef.current > 1000) { 
            if (detectionTimeout.current) {
              clearTimeout(detectionTimeout.current);
              detectionTimeout.current = null;
            }
          }
        }
    }
    requestAnimationFrame(detectFrame);
};
  useEffect(() => {
      let stream = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(s => {
              stream = s;
              if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                  videoRef.current.onloadedmetadata = () => {
                      setIsDetecting(true);
                  };
              }
          });
      }
      return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);

  // Start detection loop once video and model are ready
  useEffect(() => {
      if (isDetecting && model) {
          detectFrame();
      }
  }, [isDetecting, model]);

  return (
      <div className="h-full relative bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
          
          {/* AI HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              <div className="flex justify-between">
                  <div className="text-[10px] font-mono text-cyan-500">
                      SYSTEM_STATUS: {model ? 'AI_ACTIVE' : 'LOADING_MODEL...'}
                      <br/>AUTO_SCAN: ENABLED
                  </div>
                  {detectionTimeout.current && (
                      <div className="bg-red-500/20 text-red-500 text-[10px] px-2 py-1 rounded animate-pulse border border-red-500/50">
                          HAZARD DETECTED: VERIFYING...
                      </div>
                  )}
              </div>

              {/* Scanning Reticle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-500/30 rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
                  {/* Animated Scanning Line */}
                  <div className="w-full h-[1px] bg-cyan-400/50 absolute top-0 animate-[scan_2s_linear_infinite]"></div>
              </div>

              <div className="flex gap-4 pointer-events-auto">
                  <button onClick={() => onAlert('MANUAL FIRE REPORT')} className="flex-1 bg-red-900/80 border border-red-500/50 text-red-100 py-3 rounded-xl text-xs font-bold">REPORT FIRE</button>
                  <button onClick={() => onAlert('SUSPICIOUS ACTIVITY')} className="flex-1 bg-yellow-900/80 border border-yellow-500/50 text-yellow-100 py-3 rounded-xl text-xs font-bold">REPORT ACTIVITY</button>
              </div>
          </div>
      </div>
  );
};
const SensorLabView = ({ onTrigger, shakeEnabled, setShakeEnabled, shakeDebug, isIOS, requestPermission, isDark }) => (
    <div className="p-6 space-y-6">
        {isIOS && <button onClick={requestPermission} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_blue] animate-pulse transition-all">TAP TO ENABLE IPHONE SENSORS</button>}
        
        <GlassCard isDark={isDark}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shakeEnabled ? 'bg-orange-500/20 text-orange-500' : (isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400')}`}>
                        <Smartphone className={shakeEnabled ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Shake Detection</h3>
                        <p className="text-xs text-gray-500">Sensitivity: High</p>
                    </div>
                </div>
                <button onClick={() => setShakeEnabled(!shakeEnabled)} className={`w-12 h-6 rounded-full relative transition-colors ${shakeEnabled ? 'bg-orange-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')}`}>
                    <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${shakeEnabled ? 'right-1' : 'left-1'}`}></div>
                </button>
            </div>
            <div className={`flex gap-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div className={`flex-1 transition-all duration-300 ${shakeDebug >= 1 ? 'bg-orange-500' : 'bg-transparent'}`}></div>
                <div className={`flex-1 transition-all duration-300 ${shakeDebug >= 2 ? 'bg-orange-400' : 'bg-transparent'}`}></div>
                <div className={`flex-1 transition-all duration-300 ${shakeDebug >= 3 ? (isDark ? 'bg-white' : 'bg-gray-500') : 'bg-transparent'}`}></div>
            </div>
        </GlassCard>

        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Simulation Lab</h3>
        
        <div className="grid grid-cols-1 gap-4">
            <button onClick={() => onTrigger('FALL DETECTED')} className={`group relative overflow-hidden border p-6 rounded-2xl text-left transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:border-yellow-500' : 'bg-white border-gray-200 hover:border-yellow-500'}`}>
                <div className="absolute inset-0 bg-yellow-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <div className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Simulate Fall</div>
                        <div className="text-xs text-gray-500">Trigger Gyroscope Alert</div>
                    </div>
                    <Activity className="text-yellow-500" />
                </div>
            </button>
            
            <button onClick={() => onTrigger('CRASH DETECTED')} className={`group relative overflow-hidden border p-6 rounded-2xl text-left transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:border-red-500' : 'bg-white border-gray-200 hover:border-red-500'}`}>
                <div className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <div className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Simulate Crash</div>
                        <div className="text-xs text-gray-500">Trigger G-Force Alert</div>
                    </div>
                    <AlertTriangle className="text-red-500" />
                </div>
            </button>
        </div>
    </div>
);

const SettingsView = ({ stealthMode, setStealthMode, shakeEnabled, setShakeEnabled, isIOS, isDark, setIsDark, contacts, setContacts, location, safeZone, setSafeZone,sirenEnabled, setSirenEnabled }) => {
   const [newContact, setNewContact] = useState({ name: '', number: '' });
   
   const addContact = () => {
     if (newContact.name && newContact.number) {
       setContacts([...contacts, { ...newContact, id: Date.now() }]);
       setNewContact({ name: '', number: '' });
     }
   };

   const removeContact = (id) => {
     setContacts(contacts.filter(c => c.id !== id));
   };

   return (
   <div className="p-6 space-y-6">
      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings & Setup</h2>
      
      {/* --- EMERGENCY CONTACTS --- */}
      <GlassCard isDark={isDark}>
         <h3 className={`font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><UserPlus size={18}/> Emergency Contacts</h3>
         <div className="space-y-3">
            <div className="flex gap-2">
               <input placeholder="Name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className={`flex-1 p-2 rounded-lg text-sm outline-none border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-black'}`} />
               <input placeholder="Phone (+91..)" value={newContact.number} onChange={e => setNewContact({...newContact, number: e.target.value})} className={`flex-1 p-2 rounded-lg text-sm outline-none border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-black'}`} />
               <button onClick={addContact} className="p-2 bg-blue-600 rounded-lg text-white"><Plus size={18}/></button>
            </div>
            <div className="space-y-2">
               {contacts.map(c => (
                  <div key={c.id} className={`flex justify-between items-center p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                     <div><div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{c.name}</div><div className="text-xs text-gray-500">{c.number}</div></div>
                     <button onClick={() => removeContact(c.id)} className="text-red-400"><X size={16}/></button>
                  </div>
               ))}
               {contacts.length === 0 && <div className="text-xs text-gray-500 text-center py-2">No contacts added. SMS will fail.</div>}
            </div>
         </div>
      </GlassCard>
      {/* --- NEW SIREN TOGGLE CARD --- */}
      <GlassCard className="flex items-center justify-between" isDark={isDark}>
         <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
               {sirenEnabled ? <Bell className="text-red-400"/> : <Radio className="text-gray-500"/>}
            </div>
            <div>
               <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Audible Siren</div>
               <div className="text-xs text-gray-500">{sirenEnabled ? 'Loud Alarm Active' : 'Silent SOS Mode'}</div>
            </div>
         </div>
         <button onClick={() => setSirenEnabled(!sirenEnabled)} className={`w-12 h-6 rounded-full relative transition-colors ${sirenEnabled ? 'bg-red-500' : 'bg-gray-600'}`}>
            <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${sirenEnabled ? 'right-1' : 'left-1'}`}></div>
         </button>
      </GlassCard>
      {/* --- CHILD SAFETY / GEOFENCING --- */}
      <GlassCard isDark={isDark}>
         <h3 className={`font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><Home size={18}/> Child Safety Zone</h3>
         <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
               {safeZone ? `Active at: ${safeZone.latitude.toFixed(4)}, ${safeZone.longitude.toFixed(4)}` : 'No Safe Zone set.'}
            </div>
            <button 
               onClick={() => location ? setSafeZone(location) : alert("Waiting for GPS...")} 
               className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${safeZone ? 'bg-green-500/20 text-green-500 border-green-500' : 'bg-blue-600 text-white border-blue-600'}`}
            >
               {safeZone ? 'UPDATE ZONE' : 'SET CURRENT LOCATION'}
            </button>
         </div>
      </GlassCard>

      {/* --- SYSTEM PREFS --- */}
      <GlassCard className="flex items-center justify-between" isDark={isDark}>
         <div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>{isDark ? <Moon className="text-blue-400"/> : <Sun className="text-orange-500"/>}</div><div><div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Appearance</div><div className="text-xs text-gray-500">{isDark ? 'Dark Mode' : 'Light Mode'}</div></div></div>
         <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full border transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'}`}>{isDark ? <div className="w-4 h-4 bg-blue-500 rounded-full"></div> : <div className="w-4 h-4 bg-orange-500 rounded-full"></div>}</button>
      </GlassCard>

      <GlassCard className="flex items-center justify-between" isDark={isDark}>
         <div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}><EyeOff className="text-gray-400"/></div><div><div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Stealth Mode</div><div className="text-xs text-gray-500">Double tap to exit</div></div></div>
         <button onClick={() => setStealthMode(!stealthMode)} className={`w-12 h-6 rounded-full relative transition-colors ${stealthMode ? 'bg-blue-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')}`}><div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${stealthMode ? 'right-1' : 'left-1'}`}></div></button>
      </GlassCard>
      
      <div className={`mt-8 p-4 rounded-xl border text-center ${isDark ? 'border-blue-500/20 bg-blue-900/10' : 'border-blue-200 bg-blue-50'}`}>
         <p className="text-blue-500 text-xs font-mono mb-2">SURAKSHASPHERE v2.0</p>
         <p className="text-gray-500 text-[10px]">Secure Connection Established</p>
      </div>
   </div>
   );
};

// --- Main App Component ---

export default function SurakshaSphereApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [sosActive, setSosActive] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false); 
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sirenEnabled, setSirenEnabled] = useState(true); // New state for Smart Siren
  const [location, setLocation] = useState(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(true);
  const [shakeDebug, setShakeDebug] = useState(0);
  const [stealthMode, setStealthMode] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [isIOS, setIsIOS] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100); 
  const [isCharging, setIsCharging] = useState(false); 

  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('suraksha_contacts');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });
  const [safeZone, setSafeZone] = useState(() => {
    try {
      const saved = localStorage.getItem('suraksha_safezone');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });

  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Persistence
  useEffect(() => { localStorage.setItem('suraksha_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('suraksha_safezone', JSON.stringify(safeZone)); }, [safeZone]);

  // --- LOGIC: SIREN SYSTEM ---
  const stopSiren = useCallback(() => {
    if (oscillatorRef.current) {
      try { 
        oscillatorRef.current.stop(); 
        oscillatorRef.current.disconnect();
      } catch(e) {}
      oscillatorRef.current = null;
    }
  }, []);

  const startSiren = useCallback(() => {
    try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        
        // Stop previous before starting new
        if (oscillatorRef.current) {
            try { oscillatorRef.current.stop(); } catch(e) {}
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1.0);
        
        gain.gain.value = 0.5; 
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.0); // Auto-stop after 1s to prevent infinite loop
        
        oscillatorRef.current = osc;
    } catch (e) { console.warn("Audio Context Error", e); }
  }, []);
  useEffect(() => {
    let interval;
    // Only start the siren if SOS is active AND sirenEnabled is true
    if (sosActive && sirenEnabled) {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      startSiren();
      interval = setInterval(startSiren, 1000); 
    } else {
      stopSiren(); // Instantly stops if siren is disabled or SOS is cancelled
    }
    return () => {
      if (interval) clearInterval(interval);
      stopSiren();
    };
  }, [sosActive, sirenEnabled, startSiren, stopSiren]);

  // --- LOGIC: BATTERY MONITOR ---
  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        setBatteryLevel(Math.floor(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => setBatteryLevel(Math.floor(battery.level * 100)));
        battery.addEventListener('chargingchange', () => setIsCharging(battery.charging));
      }).catch(e => console.log("Battery API not supported"));
    }
  }, []);

  // --- LOGIC: iOS Permission Check ---
  useEffect(() => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      setIsIOS(true);
    }
  }, []);

  const requestSensorPermission = () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            alert("Sensors Granted! Shake detection active.");
          } else {
            alert("Permission Denied. Shake detection disabled.");
          }
        })
        .catch(console.error);
    }
  };

  // --- LOGIC: GEOFENCING ---
 // 1. Define this helper function OUTSIDE of your component or at the top


// 2. Inside your SurakshaSphereApp component  // --- LOGIC: EMERGENCY TRIGGER ---
const triggerEmergency = useCallback((type) => {
  // 1. First, define the OS-specific separator
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? ';' : '?';

  setSosActive(prev => {
    if (prev) return true;
    
    const time = new Date().toLocaleTimeString();
    const locString = location ? `${location.latitude},${location.longitude}` : 'Unknown Location';
    
    // Update Alerts
    setAlerts(prevAlerts => [{ id: Date.now(), type, time, read: false }, ...prevAlerts]);
    
    // Haptic Feedback
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]); 

    // 2. Build the SMS Link
    const primaryContact = contacts.length > 0 ? contacts[0].number : '112';
    const smsBody = encodeURIComponent(
      `EMERGENCY SOS: ${type}. Track me at: http://googleusercontent.com/maps.google.com/q=${locString}`
    );

    // Now 'separator' is guaranteed to be defined here
    const smsUrl = `sms:${primaryContact}${separator}body=${smsBody}`;
    
    // 3. Fire the SMS protocol
   

    return true;
  });
}, [location, contacts]);
  // --- LOGIC: SENSORS (Shake, Voice, GPS) ---
  
useEffect(() => {
  if (location) {
    // Shared mock data - ensures logic and Map visual match!
    const activeRedZones = [
      { id: 1, center: [location.latitude + 0.003, location.longitude + 0.003], radius: 200 },
      { id: 2, center: [location.latitude - 0.004, location.longitude - 0.002], radius: 300 }
    ];

    // Check Red Zones (Vibrate warning)
    const inDanger = activeRedZones.some(zone => {
      const dist = calculateDistance(location, { latitude: zone.center[0], longitude: zone.center[1] });
      return dist < zone.radius;
    });

    if (inDanger) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      console.log("ALERT: User entered a high-risk red zone.");
    }

    // Check Safe Zone (SOS trigger)
    if (safeZone) {
      const distanceToSafe = calculateDistance(location, safeZone);
      if (distanceToSafe > 500 && !sosActive) {
        triggerEmergency('SAFE ZONE BREACHED');
      }
    }
  }
}, [location, safeZone, sosActive, triggerEmergency]);
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        pos => setLocation(pos.coords),
        err => console.warn("GPS Error:", err.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (!shakeEnabled) return;
    let shakeCount = 0, lastShakeTime = 0;
    const handleMotion = (e) => {
      if (!e.accelerationIncludingGravity) return;
      const { x, y, z } = e.accelerationIncludingGravity;
      const magnitude = Math.sqrt(x*x + y*y + z*z);
      if (magnitude > 25) { 
        const now = Date.now();
        if (now - lastShakeTime > 300) {
          shakeCount++;
          lastShakeTime = now;
          setShakeDebug(c => c + 1);
          if (shakeCount >= 3) { triggerEmergency('VIOLENT SHAKE'); shakeCount = 0; }
          setTimeout(() => { if (Date.now() - lastShakeTime > 1500) { shakeCount = 0; setShakeDebug(0); } }, 1500);
        }
      }
    };
    if (typeof window !== 'undefined' && window.DeviceMotionEvent) window.addEventListener('devicemotion', handleMotion);
    return () => { if (typeof window !== 'undefined' && window.DeviceMotionEvent) window.removeEventListener('devicemotion', handleMotion); };
  }, [shakeEnabled, triggerEmergency]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      if (e.results && e.results.length > 0) {
        const transcript = e.results[e.results.length - 1][0].transcript.toLowerCase();
        if (transcript.includes('help')) { triggerEmergency('VOICE SOS'); setVoiceListening(false); recognition.stop(); }
      }
    };
    if (voiceListening) { try { recognition.start(); } catch (e) {} } else { try { recognition.stop(); } catch (e) {} }
    return () => { try { recognition.stop(); } catch (e) {} };
  }, [voiceListening, triggerEmergency]);

  // --- RENDER START ---
  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#050b14] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {stealthMode && (
        <div className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center" onDoubleClick={() => setStealthMode(false)}>
            <div className="text-gray-900 text-[10px] select-none">System Standby</div>
        </div>
      )}

      {fakeCallActive && (
          <div className="fixed inset-0 z-[90] bg-gray-900 flex flex-col items-center pt-20 pb-10 px-8 animate-in fade-in duration-300">
             <div className="flex-1 flex flex-col items-center gap-4">
                 <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                     <Users size={40} className="text-gray-400" />
                 </div>
                 <div className="text-center">
                     <h2 className="text-3xl text-white font-thin">Mom</h2>
                     <p className="text-white text-lg">Mobile</p>
                 </div>
             </div>
             <div className="w-full flex justify-between items-center mb-10 px-4">
                 <div onClick={() => setFakeCallActive(false)} className="flex flex-col items-center gap-2 cursor-pointer">
                     <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg"><PhoneOff className="text-white" size={28}/></div>
                     <span className="text-white text-sm">Decline</span>
                 </div>
                 <div onClick={() => setFakeCallActive(false)} className="flex flex-col items-center gap-2 cursor-pointer">
                     <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce"><PhoneCall className="text-white" size={28}/></div>
                     <span className="text-white text-sm">Accept</span>
                 </div>
             </div>
          </div>
      )}

      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20" onClick={() => setShowNotifications(false)}>
           <div className={`border w-[90%] max-w-sm rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
              <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                 <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                 <button onClick={() => setShowNotifications(false)}><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                 {alerts.length === 0 ? <div className="text-center py-8 text-gray-500 text-sm">No new notifications</div> : alerts.map(alert => (
                    <div key={alert.id} className={`p-3 mb-2 rounded-xl border flex gap-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                       <div className="bg-red-500/20 p-2 rounded-full h-fit"><AlertTriangle size={16} className="text-red-400"/></div>
                       <div><div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{alert.type}</div><div className="text-xs text-gray-400">{alert.time}</div></div>
                    </div>
                 ))}
              </div>
              {alerts.length > 0 && <button onClick={() => setAlerts([])} className={`w-full p-3 text-red-400 text-xs font-bold border-t flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}><Trash2 size={14} /> CLEAR ALL</button>}
           </div>
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none transition-opacity duration-700">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(${isDark ? '#ffffff1a' : '#0000001a'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}></div>
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-pulse transition-colors duration-500 ${isDark ? 'bg-blue-900/20' : 'bg-blue-300/30'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-pulse transition-colors duration-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-300/30'}`} style={{ animationDelay: '2s' }}></div>
      </div>

      {!sosActive && (
        <header className={`relative z-10 flex items-center justify-between p-5 backdrop-blur-md border-b transition-colors duration-300 animate-in fade-in slide-in-from-top-4 ${isDark ? 'border-white/5 bg-gray-900/30' : 'border-black/5 bg-white/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${isDark ? 'bg-blue-600/20 border-blue-500/30' : 'bg-blue-100 border-blue-200'}`}>
              <Shield className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-lg font-bold tracking-widest leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>SURAKSHA<span className="text-blue-500">SPHERE</span></h1>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Armed</span>
                <span className="text-[8px] text-gray-500">|</span>
                {onlineStatus ? <Wifi size={10} className="text-green-500"/> : <WifiOff size={10} className="text-red-500"/>}
                <span className="text-[8px] text-gray-500">|</span>
                <div className="flex items-center gap-1">
                   {isCharging ? <BatteryCharging size={10} className="text-green-500" /> : <Battery size={10} className={batteryLevel < 20 ? "text-red-500" : "text-gray-400"} />}
                   <span className="text-[9px] font-mono text-gray-500">{batteryLevel}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setStealthMode(true)} className={`p-2 rounded-full transition-colors ${isDark ? 'bg-gray-800/50 text-gray-400 hover:text-white' : 'bg-white/60 text-gray-600 hover:text-gray-900'}`}><EyeOff size={18} /></button>
            <button onClick={() => setVoiceListening(!voiceListening)} className={`relative p-3 rounded-full transition-all duration-500 ${voiceListening ? 'bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : (isDark ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700' : 'bg-white/60 text-gray-600 hover:bg-white')}`}>
              <Mic size={18} />
              {voiceListening && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
            </button>
            <button className="relative p-2" onClick={() => setShowNotifications(true)}>
              <Bell size={20} className={isDark ? "text-gray-300" : "text-gray-600"} />
              {alerts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red]"></span>}
            </button>
          </div>
        </header>
      )}

      <main className="relative z-10 flex-1 overflow-y-auto pb-24 scrollbar-hide">
      {sosActive && (
  <SOSScreen 
    onClose={() => setSosActive(false)} 
    alerts={alerts} 
    contacts={contacts} // Pass the contacts list
    location={location} // Pass the GPS data
  />
)}
        {!sosActive && (
          <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             {activeTab === 'home' && <HomeView onTrigger={triggerEmergency} location={location} isDark={isDark} setFakeCallActive={setFakeCallActive} />}
             {activeTab === 'map' && <MapView location={location} isDark={isDark} safeZone={safeZone} />}
             {activeTab === 'camera' && <CameraAIView onAlert={triggerEmergency} isDark={isDark} />}
             {activeTab === 'sensors' && <SensorLabView onTrigger={triggerEmergency} shakeEnabled={shakeEnabled} setShakeEnabled={setShakeEnabled} shakeDebug={shakeDebug} isIOS={isIOS} requestPermission={requestSensorPermission} isDark={isDark} />}
             {activeTab === 'settings' && (
  <SettingsView 
    stealthMode={stealthMode} setStealthMode={setStealthMode} 
    shakeEnabled={shakeEnabled} setShakeEnabled={setShakeEnabled}
    isIOS={isIOS} isDark={isDark} setIsDark={setIsDark}
    contacts={contacts} setContacts={setContacts}
    location={location} safeZone={safeZone} setSafeZone={setSafeZone}
    sirenEnabled={sirenEnabled} // ADD THIS
    setSirenEnabled={setSirenEnabled} // ADD THIS
  />
)}
          </div>
        )}
      </main>

      {!sosActive && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md animate-in slide-in-from-bottom-10 fade-in duration-700">
          <nav className={`flex justify-between items-center backdrop-blur-2xl border rounded-2xl px-6 py-4 shadow-2xl transition-colors duration-300 ${isDark ? 'bg-gray-900/80 border-white/10' : 'bg-white/80 border-black/5'}`}>
            <NavBtn icon={Shield} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} isDark={isDark} />
            <NavBtn icon={MapPin} label="Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} isDark={isDark} />
            <button onClick={() => setActiveTab('camera')} className={`-mt-12 bg-gradient-to-tr from-blue-600 to-cyan-500 p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] border-4 transition-transform hover:scale-110 active:scale-95 ${isDark ? 'border-[#050b14]' : 'border-gray-50'} ${activeTab === 'camera' ? 'ring-2 ring-white/50' : ''}`}><Camera size={24} className="text-white" /></button>
            <NavBtn icon={Activity} label="Sensors" active={activeTab === 'sensors'} onClick={() => setActiveTab('sensors')} isDark={isDark} />
            <NavBtn icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isDark={isDark} />
          </nav>
        </div>
      )}
    </div>
  );
}