import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DeliveryDashboard() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Delivery Partner!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Here you can view your assigned deliveries and update their status.</p>
        </CardContent>
      </Card>
    </div>
  );
}
