"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Role {
  id: number;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/roles');
        if (res.ok) {
          const data = await res.json();
          setRoles(data);
          if (data.length > 0) {
            setRole(data[0].name); // Default to the first role
          }
        }
      } catch (error) {
        toast({
            title: "Error",
            description: "Could not load account types. Please try again later.",
            variant: "destructive",
        });
        console.error("Failed to fetch roles", error);
      }
    };
    fetchRoles();
  }, [toast]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: "Account created successfully. Please log in.",
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
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  placeholder="John Doe" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
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
              <Label htmlFor="role">Account Type</Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading || roles.length === 0}>
                <SelectTrigger id="role">
                    <SelectValue placeholder="Select an account type" />
                </SelectTrigger>
                <SelectContent>
                    {roles.map((r) => (
                        <SelectItem key={r.id} value={r.name}>
                            {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create an account
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
