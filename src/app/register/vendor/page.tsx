
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCsrfToken } from "@/lib/csrf";

export default function VendorRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  useEffect(() => {
    const fetchDefaultCountry = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          const countryName = settings.country || "";
          setCountry(countryName);
        }
      } catch (error) {
        console.error("Failed to fetch settings for default country:", error);
      }
    };
    fetchDefaultCountry();
  }, []);

  useEffect(() => {
    if (country) {
      const fetchCities = async () => {
        setIsCitiesLoading(true);
        try {
          const res = await fetch(`/api/cities?country=${encodeURIComponent(country)}`);
          if (res.ok) {
            const data = await res.json();
            setCities(data);
          } else {
            setCities([]);
          }
        } catch (error) {
          console.error("Failed to fetch cities:", error);
          setCities([]);
        } finally {
          setIsCitiesLoading(false);
        }
      };
      fetchCities();
    }
  }, [country]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const role = 'vendor'; // Hardcode role for this registration form

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password, role, phoneNumber, country, city }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Application Submitted",
          description: "Your vendor account application has been received. Please log in.",
        });
        router.push("/login");
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Become a Vendor</CardTitle>
          <CardDescription>
            Enter your information to apply for a vendor account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="full-name">Company Name</Label>
                <Input 
                  id="full-name" 
                  placeholder="Your Company Inc." 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@yourcompany.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input 
                    id="phone-number" 
                    placeholder="e.g., +1 123 456 7890" 
                    required 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                        id="country" 
                        placeholder="Loading..." 
                        required 
                        value={country}
                        readOnly
                        disabled={true}
                        className="bg-muted/50"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Select
                        value={city}
                        onValueChange={setCity}
                        required
                        disabled={isLoading || isCitiesLoading || cities.length === 0}
                    >
                        <SelectTrigger id="city">
                            <SelectValue placeholder={isCitiesLoading ? "Loading cities..." : (cities.length > 0 ? "Select a city" : "No cities available")} />
                        </SelectTrigger>
                        <SelectContent>
                            {cities.map((cityName) => (
                                <SelectItem key={cityName} value={cityName}>
                                    {cityName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply for Vendor Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
