import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function VendorDashboard() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Vendor Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Here you can manage your products, view orders, and more.</p>
        </CardContent>
      </Card>
    </div>
  );
}
