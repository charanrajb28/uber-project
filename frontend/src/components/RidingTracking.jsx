import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
};

const RidingTracking = ({ origin, destination }) => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);

    // Load the Google Maps API
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        if (!isLoaded) return;

        // Get the user's current position
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude,
            });
        });

        // Watch for position updates
        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude,
            });
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [isLoaded]);

    useEffect(() => {
        if (!isLoaded || !origin || !destination) return;

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirectionsResponse(result);
                } else {
                    console.error(`Error fetching directions: ${status}`);
                }
            }
        );
    }, [isLoaded, origin, destination]);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition || { lat: 0, lng: 0 }}
            zoom={15}
        >
            {/* Marker for the current position */}
            {currentPosition && <Marker position={currentPosition} />}

            {/* Render the route */}
            {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
    );
};

export default RidingTracking;