
"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";

export function LogoutButton() {
  const { toast } = useToast();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': getCsrfToken(),
      },
    });

    if (res.ok) {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      window.location.href = '/login'; // Full page reload to clear session
    } else {
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive" });
    }
  };

  return (
    <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
      <LogOut className="size-4" />
      Logout
    </Button>
  );
}
