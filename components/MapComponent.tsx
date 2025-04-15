'use client';

import { useEffect, useState } from 'react';
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

const ChangeMapView = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 13, { duration: 1.5 });
  }, [coords, map]);
  return null;
};

const MapComponent = ({ locations }: { locations: Location[] }) => {
  const [search, setSearch] = useState('');
  const [searchCoords, setSearchCoords] = useState<[number, number] | null>(null);

  const handleSearch = async () => {
    if (!search) return;

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        search
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const json = await res.json();
    if (json.status === 'OK') {
      const loc = json.results[0].geometry.location;
      setSearchCoords([loc.lat, loc.lng]);
    } else {
      alert('Location not found!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Title and Description */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>Interactive Map</h1>
        <p style={{ fontSize: '1.1rem', color: '#444' }}>
          Search and explore food bank locations near you.
        </p>
      </div>

      {/* Search Bar */}
      <div
        style={{
          marginBottom: '20px',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <input
          type="text"
          placeholder="Enter ZIP code or City (e.g., 20770 or Bethesda)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '16px',
            borderRadius: '10px',
            border: '3px solid #2c5f2d', // Thicker border
            backgroundColor: '#ffffff', // White background
            width: '300px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.3s',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            backgroundColor: '#2c5f2d',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s',
          }}
        >
          🔍 Search
        </button>
      </div>

      {/* Map */}
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <MapContainer
          center={searchCoords || [38.9072, -77.0369]}
          zoom={10}
          style={{ height: '600px', width: '100%', borderRadius: '1rem' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {searchCoords && <ChangeMapView coords={searchCoords} />}

          {locations.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={dropletIcon}>
              <Popup>
                <strong>{loc.name}</strong><br />
                📍 {loc.address}<br />
                📞 {loc.phone}<br />
                🕒 {loc.hours?.join(', ') || 'See website for hours'}<br />
                📦 {loc.food_format?.join(', ') || 'No format listed'}<br />
                {loc.by_appointment === 'Yes'
                  ? '📅 Appointment Required'
                  : '🚶 Walk-in Allowed'}
                <br /><br />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      loc.address
                    )}&travelmode=transit`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button
                      style={{
                        backgroundColor: '#2c5f2d',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      🚌 Transit Directions
                    </button>
                  </a>
                  <a href={`/foodbank/${loc.id}`}>
                    <button
                      style={{
                        backgroundColor: '#1d4ed8',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%',
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
    </div>
  );
};

export default MapComponent;
