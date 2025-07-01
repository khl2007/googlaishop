
"use client";

import { useState, useRef, useCallback } from "react";
import { useJsApiLoader, Autocomplete, GoogleMap, MarkerF } from "@react-google-maps/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2, LocateFixed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./ui/card";

interface AddressResult {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface AddressAutocompleteProps {
  onSelect: (address: AddressResult, location: { lat: number; lng: number } | null) => void;
}

const libraries: "places"[] = ["places"];
const mapContainerStyle = {
  height: "100%",
  width: "100%",
};

export function AddressAutocomplete({ onSelect }: AddressAutocompleteProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [geocodingStatus, setGeocodingStatus] = useState<"idle" | "loading" | "error">("idle");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: 31.963158, lng: 35.930359 }); // Default: Amman, Jordan
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const parseAddressComponents = useCallback((place: google.maps.places.PlaceResult | google.maps.GeocoderResult): AddressResult => {
    const components = place.address_components || [];
    const address: AddressResult = { street: "", city: "", state: "", zip: "", country: "" };
    
    const getComponent = (type: string, useShortName = false) => {
        const component = components.find(c => c.types.includes(type));
        return component ? (useShortName ? component.short_name : component.long_name) : "";
    }

    let streetNumber = getComponent("street_number");
    let route = getComponent("route");
    let street = `${streetNumber} ${route}`.trim();
    
    if (!street && place.formatted_address) {
        const addressParts = place.formatted_address.split(', ');
        if (addressParts.length >= 3) {
            street = addressParts[0];
        }
    }

    address.street = street;
    address.city = getComponent("locality") || getComponent("postal_town");
    address.state = getComponent("administrative_area_level_1", true);
    address.zip = getComponent("postal_code");
    address.country = getComponent("country");

    if (!address.city && components.length > 0) {
        const cityComponent = components.find(c => c.types.includes('administrative_area_level_3') || c.types.includes('political'));
        if (cityComponent) address.city = cityComponent.long_name;
    }

    return address;
  }, []);
  
  const handleAddressResult = useCallback((place: google.maps.places.PlaceResult | google.maps.GeocoderResult) => {
      const location = place.geometry?.location ? {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
      } : null;
      
      if (place.address_components) {
        const parsedAddress = parseAddressComponents(place);
        if (inputRef.current && place.formatted_address) {
            inputRef.current.value = place.formatted_address;
        }
        onSelect(parsedAddress, location);
      } else {
        toast({
          title: "Incomplete Address",
          description: "Could not determine a full address for this location.",
          variant: "destructive",
        });
      }
      
      if (location) {
          setCenter(location);
          setMarkerPosition(location);
          map?.panTo(location);
          map?.setZoom(17);
      }
  }, [map, onSelect, parseAddressComponents, toast]);


  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      handleAddressResult(place);
    }
  }, [autocomplete, handleAddressResult]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const location = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(location);
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          handleAddressResult(results[0]);
        } else {
          toast({ title: "Geocoding failed", description: `Could not find address for this location. Status: ${status}`, variant: "destructive" });
        }
      });
    }
  }, [handleAddressResult, toast]);

  const handleGeolocate = useCallback(() => {
    if (navigator.geolocation) {
      setGeocodingStatus("loading");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeocodingStatus("idle");
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location }, (results, status) => {
            if (status === "OK" && results?.[0]) {
               handleAddressResult(results[0]);
            } else {
              toast({ title: "Geocoding failed", description: `Could not find address for your location. Status: ${status}`, variant: "destructive" });
            }
          });
        },
        (error) => {
          setGeocodingStatus("error");
          toast({ title: "Geolocation failed", description: error.message, variant: "destructive" });
        }
      );
    } else {
      toast({ title: "Geolocation not supported", description: "Your browser does not support geolocation.", variant: "destructive" });
    }
  }, [handleAddressResult, toast]);


  if (loadError) {
    return (
        <div className="p-4 text-center text-destructive border border-destructive/50 rounded-md bg-destructive/10">
            <p className="font-bold">Google Maps Error</p>
            <p className="text-sm">There was an issue loading Google Maps.</p>
            <p className="text-xs mt-2">
                This might be an <code className="text-xs">ApiNotActivatedMapError</code>. Please ensure the <strong>Maps JavaScript API</strong> and <strong>Geocoding API</strong> are enabled in your Google Cloud project.
            </p>
        </div>
    );
  }
  if (!isLoaded) return <div className="flex items-center justify-center h-full w-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        id="address-map"
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={{
            zoomControl: true,
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
        }}
      >
        {markerPosition && <MarkerF position={markerPosition} />}
      </GoogleMap>
      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="shadow-lg">
            <Autocomplete
                onLoad={setAutocomplete}
                onPlaceChanged={onPlaceChanged}
                fields={["address_components", "formatted_address", "geometry"]}
            >
                <Input ref={inputRef} type="text" placeholder="Start typing your address..." className="w-full h-12 text-base" />
            </Autocomplete>
        </Card>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Button
            type="button"
            className="h-12 px-6 shadow-lg"
            onClick={handleGeolocate}
            disabled={geocodingStatus === 'loading'}
        >
            {geocodingStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
            Locate Me
        </Button>
      </div>
    </div>
  );
}
