import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CashSuccessPage() {
    return (
        <div className="container mx-auto my-12 flex min-h-[calc(100vh-20rem)] items-center justify-center">
            <Card className="max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-bold">Order Placed Successfully!</CardTitle>
                    <CardDescription>
                        Thank you for your purchase. You will pay with cash upon delivery. Your order is being processed and you will receive a confirmation email shortly.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
