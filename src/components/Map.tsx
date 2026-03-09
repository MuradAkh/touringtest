import { MapContainer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import React, { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { City } from "@/src/gameTypes";
import { divIcon, DivIcon, LatLngBounds } from "leaflet";
import VectorTileLayer from 'react-leaflet-vector-tile-layer';
import { getCachedCities } from "@/src/GameContext";

type MapProps = {
    selectedMarker: City | null,
    setSelectedMarker: (marker: City | null) => void
    correctAnswer: string | null
    guessedCorrectly: boolean
}

type MarkerState = 'default' | 'selected' | 'correct' | 'incorrect';

const MARKER_COLORS: Record<MarkerState, string> = {
    default:   '#a89880',
    selected:  '#2d7a70',
    correct:   '#4caf50',
    incorrect: '#c0392b',
};

const MARKER_SIZES: Record<MarkerState, number> = {
    default:   10,
    selected:  14,
    correct:   14,
    incorrect: 14,
};

function makeMarkerIcon(state: MarkerState, cityName: string, showLabel: boolean): DivIcon {
    const color = MARKER_COLORS[state];
    const size = MARKER_SIZES[state];
    const dot = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.9);box-shadow:0 1px 4px rgba(0,0,0,0.3);flex-shrink:0;"></div>`;
    const html = showLabel
        ? `<div style="display:flex;align-items:center;gap:4px;white-space:nowrap;">${dot}<span style="font-size:11px;font-family:'DM Sans',sans-serif;font-weight:600;color:#1c1814;text-shadow:0 0 3px #f6f2ec,0 0 3px #f6f2ec,0 0 3px #f6f2ec;">${cityName}</span></div>`
        : dot;
    return divIcon({
        className: '',
        html,
        iconAnchor: [size / 2, size / 2],
    });
}

// Component to track map bounds and zoom for viewport filtering
function MapViewportTracker({ onBoundsChange, onZoomChange }: {
    onBoundsChange: (bounds: LatLngBounds) => void;
    onZoomChange: (zoom: number) => void;
}) {
    const map = useMap();

    useMapEvents({
        moveend: () => { onBoundsChange(map.getBounds()); },
        zoomend: () => {
            onZoomChange(map.getZoom());
            onBoundsChange(map.getBounds());
        },
    });

    useEffect(() => {
        onBoundsChange(map.getBounds());
        onZoomChange(map.getZoom());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

function isInBounds(lat: number, lng: number, bounds: LatLngBounds | null): boolean {
    if (!bounds) return true;
    return bounds.contains([lat, lng]);
}

const MarkerComponent = memo(function MarkerComponent({
    marker,
    selectedMarker,
    correctAnswer,
    guessedCorrectly,
    handleMarkerClick,
    zoomLevel,
}: {
    marker: City,
    guessedCorrectly: boolean,
    correctAnswer: string | null,
    selectedMarker: City | null,
    handleMarkerClick: (marker: City) => void,
    zoomLevel: number,
}) {
    const markerIcon = useMemo(() => {
        const showLabel = zoomLevel >= 5;
        const cityName = marker.displayName.split(':::')[0];
        if (correctAnswer !== null && marker.displayName === correctAnswer) {
            return makeMarkerIcon(guessedCorrectly ? 'correct' : 'incorrect', cityName, showLabel);
        }
        if (selectedMarker !== null && marker.displayName === selectedMarker.displayName) {
            return makeMarkerIcon('selected', cityName, showLabel);
        }
        return makeMarkerIcon('default', cityName, showLabel);
    }, [marker, selectedMarker, correctAnswer, guessedCorrectly, zoomLevel]);

    const handleClick = useCallback(() => {
        handleMarkerClick(marker);
    }, [marker, handleMarkerClick]);

    return (
        <Marker
            position={[marker.latitude, marker.longitude]}
            icon={markerIcon}
            eventHandlers={{ click: handleClick }}
        />
    );
});

const Map = ({ selectedMarker, setSelectedMarker, correctAnswer, guessedCorrectly }: MapProps) => {
    const [markers, setMarkers] = useState<City[]>([]);
    const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
    const [zoomLevel, setZoomLevel] = useState(4);

    useEffect(() => {
        async function loadCities() {
            const cities = await getCachedCities();
            setMarkers(cities);
        }
        loadCities();
    }, []);

    const handleBoundsChange = useCallback((bounds: LatLngBounds) => setMapBounds(bounds), []);
    const handleZoomChange = useCallback((zoom: number) => setZoomLevel(zoom), []);
    const handleMarkerClick = useCallback((marker: City) => setSelectedMarker(marker), [setSelectedMarker]);

    const filteredMarkers = useMemo(() => {
        if (correctAnswer === null || correctAnswer === '') {
            if (mapBounds && markers.length > 100) {
                return markers.filter(m => isInBounds(m.latitude, m.longitude, mapBounds));
            }
            return markers;
        }
        return markers.filter(m =>
            m.displayName === correctAnswer || m.displayName === selectedMarker?.displayName
        );
    }, [markers, correctAnswer, selectedMarker, mapBounds]);

    return (
        <MapContainer
            center={[51.505, -0.09]}
            zoom={4}
            minZoom={2}
            style={{ height: '100%', width: '100%', minHeight: '200px' }}
        >
            <VectorTileLayer
                attribution='<a href="https://github.com/maplibre/demotiles">MapLibre</a>'
                styleUrl="map/style.json"
            />
            <MapViewportTracker
                onBoundsChange={handleBoundsChange}
                onZoomChange={handleZoomChange}
            />
            {filteredMarkers.map((marker) => (
                <MarkerComponent
                    key={marker.displayName}
                    marker={marker}
                    selectedMarker={selectedMarker}
                    correctAnswer={correctAnswer}
                    guessedCorrectly={guessedCorrectly}
                    handleMarkerClick={handleMarkerClick}
                    zoomLevel={zoomLevel}
                />
            ))}
        </MapContainer>
    );
};

export default Map;
