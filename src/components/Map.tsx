import { MapContainer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import React, { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { City } from "@/src/gameTypes";
import { divIcon, DivIcon, Icon, icon, LatLngBounds } from "leaflet";
import VectorTileLayer from 'react-leaflet-vector-tile-layer';
import { getCachedCities } from "@/src/GameContext";

type MapProps = {
    selectedMarker: City | null,
    setSelectedMarker: (marker: City | null) => void
    correctAnswer: string | null
    guessedCorrectly: boolean
}

// Memoized icon creation - icons are created once and reused
const defaultIcon = icon({
    iconUrl: 'default-marker-icon.png',
    iconSize: [15, 15],
});

const selectedIcon = icon({
    iconUrl: 'selected-marker-icon.png',
    iconSize: [20, 20],
});

const correctIcon = icon({
    iconUrl: 'correct-marker-icon.png',
    iconSize: [20, 20],
});

const incorrectIcon = icon({
    iconUrl: 'incorrect-marker-icon.png',
    iconSize: [20, 20],
});

// Component to track map bounds and zoom for viewport filtering
function MapViewportTracker({ onBoundsChange, onZoomChange }: { 
    onBoundsChange: (bounds: LatLngBounds) => void;
    onZoomChange: (zoom: number) => void;
}) {
    const map = useMap();
    
    useMapEvents({
        moveend: () => {
            onBoundsChange(map.getBounds());
        },
        zoomend: () => {
            const zoom = map.getZoom();
            onZoomChange(zoom);
            onBoundsChange(map.getBounds());
        },
    });

    useEffect(() => {
        // Initial bounds and zoom
        const bounds = map.getBounds();
        const zoom = map.getZoom();
        onBoundsChange(bounds);
        onZoomChange(zoom);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

// Helper function to check if a point is within bounds
function isInBounds(lat: number, lng: number, bounds: LatLngBounds | null): boolean {
    if (!bounds) return true;
    return bounds.contains([lat, lng]);
}

// Memoized marker component
const MarkerComponent = memo(function MarkerComponent({
    marker,
    selectedMarker,
    correctAnswer,
    guessedCorrectly,
    handleMarkerClick,
    zoomLevel
}: {
    marker: City,
    guessedCorrectly: boolean,
    correctAnswer: string | null,
    selectedMarker: City | null,
    handleMarkerClick: (marker: City | null) => void,
    zoomLevel: number
}) {
    const getIconInner = useCallback((marker: City | null, fallbackIcon: Icon = defaultIcon) => {
        const size = fallbackIcon.options.iconSize as [number, number];
        return zoomLevel < 5 ? fallbackIcon : new DivIcon({
            className: 'my-div-icon',
            html:
                `<img style="width: ${size[0]}px" 
                        src=${fallbackIcon.options.iconUrl}>` +
                `<strong>${marker?.displayName.split(':::')[0]}</strong>`,
        });
    }, [zoomLevel]);

    const markerIcon = useMemo(() => {
        if (correctAnswer !== null && marker.displayName === correctAnswer) {
            return getIconInner(marker, guessedCorrectly ? correctIcon : incorrectIcon);
        } else if (selectedMarker !== null && marker.displayName === selectedMarker.displayName) {
            return getIconInner(marker, selectedIcon);
        } else {
            return getIconInner(marker);
        }
    }, [marker, selectedMarker, correctAnswer, guessedCorrectly, getIconInner]);

    const handleClick = useCallback(() => {
        handleMarkerClick(marker);
    }, [marker, handleMarkerClick]);

    return (
        <Marker
            position={[marker.latitude, marker.longitude]}
            icon={markerIcon}
            eventHandlers={{
                click: handleClick,
            }}
        />
    );
});

const Map = ({ selectedMarker, setSelectedMarker, correctAnswer, guessedCorrectly }: MapProps) => {
    const [markers, setMarkers] = useState<City[]>([]);
    const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
    const [zoomLevel, setZoomLevel] = useState(4);

    // Load cities from cache
    useEffect(() => {
        async function loadCities() {
            const cities = await getCachedCities();
            setMarkers(cities);
        }
        loadCities();
    }, []);

    const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
        setMapBounds(bounds);
    }, []);

    const handleZoomChange = useCallback((zoom: number) => {
        setZoomLevel(zoom);
    }, []);

    const handleMarkerClick = useCallback((marker: City | null) => {
        setSelectedMarker(marker);
    }, [setSelectedMarker]);

    // Memoize filtered markers based on correctAnswer and selectedMarker
    const filteredMarkers = useMemo(() => {
        if (correctAnswer === null || correctAnswer === '') {
            // When showing all markers, filter by viewport bounds for performance
            if (mapBounds && markers.length > 100) {
                // Only filter by bounds if we have many markers to improve performance
                return markers.filter(marker => 
                    isInBounds(marker.latitude, marker.longitude, mapBounds)
                );
            }
            return markers;
        } else {
            // When answer is revealed, only show relevant markers
            return markers.filter(marker => 
                marker.displayName === correctAnswer || marker.displayName === selectedMarker?.displayName
            );
        }
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

export default Map
