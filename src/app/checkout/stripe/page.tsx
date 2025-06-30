import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";

export default function StripePaymentPage() {
    // In a real app, you would use Stripe Elements here
    return (
        <div className="container mx-auto my-12 flex min-h-[calc(100vh-20rem)] items-center justify-center">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard />
                        Pay with Stripe
                    </CardTitle>
                    <CardDescription>
                       This is a placeholder for the Stripe payment form.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="**** **** **** ****" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="***" />
                        </div>
                    </div>
                    <Button className="w-full" disabled>Pay Now (Coming Soon)</Button>
                </CardContent>
            </Card>
        </div>
    );
}
