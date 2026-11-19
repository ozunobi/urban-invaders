'use dom';

import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import type { DOMProps } from 'expo/dom';

export type SightingCoordinates = {
  latitude: number;
  longitude: number;
};

export type SightingMapCenter = SightingCoordinates & {
  zoom: number;
};

export type SightingMapPin = SightingCoordinates & {
  id: string;
  intensity: number;
  selected?: boolean;
};

type SightingMapProps = {
  center: SightingMapCenter;
  selectedLocation: SightingCoordinates | null;
  onLocationSelect?: (coordinates: SightingCoordinates) => void;
  pins?: SightingMapPin[];
  onPinSelect?: (pinId: string) => void;
  dom?: DOMProps;
};

type MapLibraries = {
  Circle: typeof import('react-leaflet').Circle;
  CircleMarker: typeof import('react-leaflet').CircleMarker;
  MapContainer: typeof import('react-leaflet').MapContainer;
  Marker: typeof import('react-leaflet').Marker;
  TileLayer: typeof import('react-leaflet').TileLayer;
  useMap: typeof import('react-leaflet').useMap;
  useMapEvents: typeof import('react-leaflet').useMapEvents;
  markerIcon: import('leaflet').DivIcon;
};

function MapCenterUpdater({
  useMap,
  center,
}: {
  useMap: MapLibraries['useMap'];
  center: SightingMapCenter;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.latitude, center.longitude], center.zoom);
  }, [center.latitude, center.longitude, center.zoom, map]);

  return null;
}

function MapLocationPicker({
  useMapEvents,
  onLocationSelect,
}: {
  useMapEvents: MapLibraries['useMapEvents'];
  onLocationSelect: (coordinates: SightingCoordinates) => void;
}) {
  useMapEvents({
    click: (event) => {
      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function SightingMap({
  center,
  selectedLocation,
  onLocationSelect,
  pins = [],
  onPinSelect,
}: SightingMapProps) {
  const [libraries, setLibraries] = useState<MapLibraries | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([import('leaflet'), import('react-leaflet')])
      .then(([leafletModule, reactLeaflet]) => {
        if (!active) return;

        const leaflet = leafletModule.default;
        setLibraries({
          Circle: reactLeaflet.Circle,
          CircleMarker: reactLeaflet.CircleMarker,
          MapContainer: reactLeaflet.MapContainer,
          Marker: reactLeaflet.Marker,
          TileLayer: reactLeaflet.TileLayer,
          useMap: reactLeaflet.useMap,
          useMapEvents: reactLeaflet.useMapEvents,
          markerIcon: leaflet.divIcon({
            className: 'sighting-map-marker',
            html: '<span class="sighting-map-marker-pin"></span>',
            iconSize: [28, 38],
            iconAnchor: [14, 38],
          }),
        });
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : 'Unable to load the map.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!libraries) {
    return (
      <div className="sighting-map-root">
        <div className="sighting-map-message">
          {loadError || 'Loading map...'}
        </div>
      </div>
    );
  }

  return (
    <div className="sighting-map-root">
      <libraries.MapContainer
        center={[center.latitude, center.longitude]}
        zoom={center.zoom}
        scrollWheelZoom
        style={{ width: '100%', height: '100%' }}
      >
        <libraries.TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterUpdater useMap={libraries.useMap} center={center} />
        {onLocationSelect && (
          <MapLocationPicker
            useMapEvents={libraries.useMapEvents}
            onLocationSelect={onLocationSelect}
          />
        )}
        {pins.map((pin) => {
          const intensity = Math.max(0, Math.min(pin.intensity, 1));

          return (
            <React.Fragment key={pin.id}>
              <libraries.Circle
                center={[pin.latitude, pin.longitude]}
                radius={700 + intensity * 1800}
                pathOptions={{
                  stroke: false,
                  fillColor: '#EC6425',
                  fillOpacity: 0.1 + intensity * 0.12,
                }}
                interactive={false}
              />
              <libraries.Marker
                position={[pin.latitude, pin.longitude]}
                icon={libraries.markerIcon}
                eventHandlers={
                  onPinSelect
                    ? { click: () => onPinSelect(pin.id) }
                    : undefined
                }
              />
            </React.Fragment>
          );
        })}
        {selectedLocation && (
          <libraries.Marker
            position={[selectedLocation.latitude, selectedLocation.longitude]}
            icon={libraries.markerIcon}
          />
        )}
      </libraries.MapContainer>
      <style>{`
        html, body, #root { width: 100%; height: 100%; margin: 0; }
        .sighting-map-root { width: 100%; height: 100%; }
        .sighting-map-message { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #555; }
        .leaflet-container { width: 100%; height: 100%; font-family: Arial, sans-serif; }
        .sighting-map-marker { border: 0; background: transparent; }
        .sighting-map-marker-pin {
          display: block;
          width: 22px;
          height: 22px;
          border: 3px solid #fff;
          border-radius: 50% 50% 50% 0;
          background: #ec6425;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          transform: rotate(-45deg);
        }
      `}</style>
    </div>
  );
}
