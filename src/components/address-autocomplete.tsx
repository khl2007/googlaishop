
"use client";

import { useState, useRef, useCallback } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddressResult {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface AddressAutocompleteProps {
  onSelect: (address: AddressResult) => void;
}

const libraries: "places"[] = ["places"];

export function AddressAutocomplete({ onSelect }: AddressAutocompleteProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [geocodingStatus, setGeocodingStatus] = useState<"idle" | "loading" | "error">("idle");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const parseAddressComponents = useCallback((components: google.maps.GeocoderAddressComponent[]): AddressResult => {
    const address: AddressResult = { street: "", city: "", state: "", zip: "", country: "" };
    let streetNumber = "";
    let route = "";

    components.forEach(component => {
      const types = component.types;
      if (types.includes("street_number")) streetNumber = component.long_name;
      if (types.includes("route")) route = component.long_name;
      if (types.includes("locality")) address.city = component.long_name;
      if (types.includes("administrative_area_level_1")) address.state = component.short_name;
      if (types.includes("country")) address.country = component.long_name;
      if (types.includes("postal_code")) address.zip = component.long_name;
    });

    address.street = `${streetNumber} ${route}`.trim();
    return address;
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.address_components) {
        const parsedAddress = parseAddressComponents(place.address_components);
        onSelect(parsedAddress);
      } else {
        toast({
          title: "Incomplete Address",
          description: "Please select a more specific address from the list.",
          variant: "destructive",
        });
      }
    }
  }, [autocomplete, onSelect, parseAddressComponents, toast]);

  const handleGeolocate = useCallback(() => {
    if (navigator.geolocation) {
      setGeocodingStatus("loading");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geocoder = new window.google.maps.Geocoder();
          const latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === "OK" && results?.[0]) {
                const parsedAddress = parseAddressComponents(results[0].address_components);
                onSelect(parsedAddress);
                if (inputRef.current) {
                    inputRef.current.value = results[0].formatted_address;
                }
                setGeocodingStatus("idle");
            } else {
              toast({ title: "Geocoding failed", description: `Could not find address for your location. Status: ${status}`, variant: "destructive" });
              setGeocodingStatus("error");
            }
          });
        },
        (error) => {
          toast({ title: "Geolocation failed", description: error.message, variant: "destructive" });
          setGeocodingStatus("error");
        }
      );
    } else {
      toast({ title: "Geolocation not supported", description: "Your browser does not support geolocation.", variant: "destructive" });
    }
  }, [onSelect, parseAddressComponents, toast]);


  if (loadError) {
    return (
        <div className="p-4 text-center text-destructive border border-destructive/50 rounded-md bg-destructive/10">
            <p className="font-bold">Google Maps Error</p>
            <p className="text-sm">There was an issue loading Google Maps.</p>
            <p className="text-xs mt-2">
                This might be an <code className="text-xs">ApiNotActivatedMapError</code>. Please ensure the <strong>Maps JavaScript API</strong> is enabled in your Google Cloud project.
            </p>
        </div>
    );
  }
  if (!isLoaded) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <Autocomplete
        onLoad={setAutocomplete}
        onPlaceChanged={onPlaceChanged}
        fields={["address_components", "formatted_address"]}
      >
        <Input ref={inputRef} type="text" placeholder="Start typing your address..." />
      </Autocomplete>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGeolocate}
        disabled={geocodingStatus === 'loading'}
      >
        {geocodingStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
        Use my current location
      </Button>
    </div>
  );
}
