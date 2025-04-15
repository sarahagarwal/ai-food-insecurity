'use client';

import { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L from 'leaflet';

const dropletIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

type Location = {
  id: string | number;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  hours?: string[];
  food_format?: string[];
  by_appointment?: string;
};

// helper component to allow imperative map control
const ChangeMapView = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  map.setView(coords, 13);
  return null;
};

const MapComponent = ({ locations }: { locations: Location[] }) => {
  const [zip, setZip] = useState('');
  const [zipCoords, setZipCoords] = useState<[number, number] | null>(null);

  const handleZipSearch = async () => {
    if (!zip) return;
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const json = await res.json();
    if (json.status === 'OK') {
      const loc = json.results[0].geometry.location;
      setZipCoords([loc.lat, loc.lng]);
    } else {
      alert('Zipcode not found!');
    }
  };

  return (
    <div>
      {/* ZIP Input */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter your ZIP code"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginRight: '10px',
            width: '200px',
          }}
        />
        <button
          onClick={handleZipSearch}
          style={{
            padding: '10px 16px',
            fontSize: '16px',
            backgroundColor: '#2c5f2d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          🔍 Search
        </button>
      </div>

      <MapContainer
        center={[38.9072, -77.0369]}
        zoom={10}
        style={{ height: '600px', width: '100%', borderRadius: '1rem' }}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; OpenStreetMap contributors'
        />

        {zipCoords && <ChangeMapView coords={zipCoords} />}

        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={dropletIcon}>
            {/* <Popup>
              <strong>{loc.name}</strong><br />
              📍 {loc.address}<br />
              📞 {loc.phone}<br />
              🕒 {loc.hours?.join(', ') || 'See website for hours'}<br />
              📦 {loc.food_format?.join(', ') || 'No format listed'}<br />
              {loc.by_appointment === 'Yes' ? '📅 Appointment Required' : '🚶 Walk-in Allowed'}<br /><br />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}&travelmode=transit`}
                target='_blank'
                rel='noopener noreferrer'
              >
                🚌 Transit Directions
              </a>
            </Popup> */}

<Popup>
  <strong>{loc.name}</strong><br />
  📍 {loc.address}<br />
  📞 {loc.phone}<br />
  🕒 {loc.hours?.join(', ') || 'See website for hours'}<br />
  📦 {loc.food_format?.join(', ') || 'No format listed'}<br />
  {loc.by_appointment === 'Yes' ? '📅 Appointment Required' : '🚶 Walk-in Allowed'}<br /><br />

  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        loc.address
      )}&travelmode=transit`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <button
        style={{
          backgroundColor: "#2c5f2d",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        🚌 Transit Directions
      </button>
    </a>

    <a href={`/search/${loc.id}`}>
      <button
        style={{
          backgroundColor: "#1d4ed8",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        📄 More Info
      </button>
    </a>
  </div>
</Popup>

          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
