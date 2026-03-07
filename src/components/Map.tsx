import {GeoJSON, MapContainer, Marker, TileLayer, Tooltip, useMapEvents} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import React, {useEffect, useState} from 'react'
import {City} from "@/src/gameTypes";
import {divIcon, DivIcon, Icon, icon} from "leaflet";
import VectorTileLayer from 'react-leaflet-vector-tile-layer';
import {getDisplayString} from "@/src/utils";

type MapProps = {
    selectedMarker: City | null,
    setSelectedMarker: (marker: City | null) => void
    correctAnswer: string | null
    guessedCorrectly: boolean
}

const Map = ({selectedMarker, setSelectedMarker, correctAnswer, guessedCorrectly}: MapProps) => {

    const [markers, setMarkers] = useState([] as City[])

    useEffect(() => {
        async function fetchCities() {
            const response = await fetch("/cities.json");
            const data = await response.json();
            setMarkers(data);
        }

        fetchCities();
    }, []);

    const handleMarkerClick = (marker: City | null) => {
        setSelectedMarker(marker)
    }

    return (
        <MapContainer
            center={[51.505, -0.09]}
            zoom={4}
            minZoom={2}
            style={{height: '100%', width: '100%', minHeight: '60vh'}}

        >
            <VectorTileLayer
                attribution='<a href="https://github.com/maplibre/demotiles">MapLibre</a>'
                styleUrl="map/style.json"
            />
            {markers
                .filter((marker) => {
                    // correct answer is empty
                    if (correctAnswer === null || correctAnswer === '') {
                        return true
                    } else {
                        return marker.displayName === correctAnswer || marker.displayName === selectedMarker?.displayName
                    }
                })
                .map((marker) => (
                    <MarkerComponent marker={marker} selectedMarker={selectedMarker}
                                     correctAnswer={correctAnswer} guessedCorrectly={guessedCorrectly}
                                     handleMarkerClick={handleMarkerClick}
                                     key={marker.displayName}/>
            ))}
        </MapContainer>
    )
}

// create marker component
function MarkerComponent({marker, selectedMarker, correctAnswer, guessedCorrectly, handleMarkerClick}:
                             { marker: City,
                                 guessedCorrectly: boolean,
                                 correctAnswer: string | null,
                                 selectedMarker: City | null,
                                 handleMarkerClick: (marker: City | null) => void }) {
    const [zoomLevel, setZoomLevel] = useState(4);

    const mapEvents = useMapEvents({
        zoomend: () => {
            setZoomLevel(mapEvents.getZoom());
        },
    });

    const defaultIcon = icon({
        iconUrl: 'default-marker-icon.png',
        iconSize: [15, 15],
    })

    const selectedIcon = icon({
        iconUrl: 'selected-marker-icon.png',
        iconSize: [20, 20],
    })

    const correctIcon = icon({
        iconUrl: 'correct-marker-icon.png',
        iconSize: [20, 20],
    })

    const incorrectIcon = icon({
        iconUrl: 'incorrect-marker-icon.png',
        iconSize: [20, 20],
    })

    function getIconInner(marker: City | null, fallbackIcon: Icon = defaultIcon) {
        const name = fallbackIcon.options.iconSize as any
        return zoomLevel < 5 ? fallbackIcon : new DivIcon(
            {
                className: 'my-div-icon',
                html:
                    `<img style="width: ${name[0]}px" 
                            src=${fallbackIcon.options.iconUrl}>` +

                    `<strong>${marker?.displayName.split(':::')[0]}</strong>`,
            }
        );
    }

    function getIconForMarker(marker: City | null, selectedMarker: City | null, correctAnswer: string | null) {
        if (correctAnswer !== null && marker?.displayName === correctAnswer) {
            return getIconInner(marker, guessedCorrectly ? correctIcon : incorrectIcon)
        } else if (selectedMarker !== null && marker?.displayName === selectedMarker.displayName) {
            return getIconInner(marker, selectedIcon)
        } else {
            return getIconInner(marker)
        }
    }

    return <Marker
        key={marker.displayName}
        position={[marker.latitude, marker.longitude]}
        icon={getIconForMarker(marker, selectedMarker, correctAnswer)}
        eventHandlers={{
            click: () => {
                handleMarkerClick(marker)
            },
        }}
    >
        {/*<Tooltip>{getDisplayString(marker.displayName, "geo", true)}</Tooltip>*/}
    </Marker>
}

export default Map