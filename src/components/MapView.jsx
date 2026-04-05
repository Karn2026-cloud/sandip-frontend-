import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom bus icon
const createBusIcon = (color = '#6366f1', isActive = true) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isActive ? `<div style="
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${color}20;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>` : ''}
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${color}, ${color}dd);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px ${color}40;
          border: 2px solid white;
          font-size: 18px;
          z-index: 10;
        ">🚌</div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28],
  });
};

// Stop marker icon
const createStopIcon = (order) => {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        border: 2px solid #6366f1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
        color: #a5b4fc;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${order}</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
};

// Component to animate map to a position
function FlyToPosition({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom || 13, { duration: 1.5 });
    }
  }, [position, zoom, map]);
  return null;
}

export default function MapView({
  center = [19.9975, 73.7898], // Nashik default
  zoom = 13,
  busLocations = [],      // [{ id, number, lat, lng, isActive }]
  stops = [],             // [{ name, lat, lng, order }]
  routePath = [],         // [[lat, lng], ...]
  flyToPosition = null,
  height = '400px',
  className = '',
}) {
  return (
    <div className={`rounded-2xl overflow-hidden border border-white/10 ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {flyToPosition && <FlyToPosition position={flyToPosition} zoom={zoom} />}

        {/* Route path */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#6366f1',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Stop markers */}
        {stops.map((stop, i) => (
          <Marker
            key={`stop-${i}`}
            position={[stop.lat, stop.lng]}
            icon={createStopIcon(stop.order || i + 1)}
          >
            <Popup>
              <div style={{ color: '#1e293b', fontWeight: 600 }}>
                📍 {stop.name}
                <br />
                <span style={{ fontSize: '11px', color: '#64748b' }}>Stop #{stop.order || i + 1}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Bus markers */}
        {busLocations.map((bus) => (
          <Marker
            key={`bus-${bus.id}`}
            position={[bus.lat, bus.lng]}
            icon={createBusIcon(
              bus.isActive ? '#6366f1' : '#64748b',
              bus.isActive
            )}
          >
            <Popup>
              <div style={{ color: '#1e293b' }}>
                <strong>🚌 Bus {bus.number || bus.id}</strong>
                <br />
                <span style={{ fontSize: '11px', color: bus.isActive ? '#16a34a' : '#94a3b8' }}>
                  {bus.isActive ? '● On Route' : '● Idle'}
                </span>
                {bus.speed !== undefined && (
                  <><br /><span style={{ fontSize: '11px', color: '#64748b' }}>Speed: {Math.round(bus.speed)} km/h</span></>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
