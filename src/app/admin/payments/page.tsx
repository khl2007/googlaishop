import { getPaymentMethods } from "@/lib/data";
import { PaymentMethodsForm } from "@/components/admin/payment-methods-form";

export default async function PaymentsPage() {
  const paymentMethods = await getPaymentMethods();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payment Methods</h1>
      <p className="text-muted-foreground mb-6">Configure how your customers can pay for their orders.</p>
      <PaymentMethodsForm paymentMethods={paymentMethods} />
    </div>
  );
}
