import { getEmailSettings } from "@/lib/data";
import { EmailSettingsForm } from "@/components/admin/email-settings-form";

export default async function EmailSettingsPage() {
  const settings = await getEmailSettings();

  // If settings don't exist (e.g., first run), provide a default object
  // so the form can still be rendered and settings can be saved.
  const initialData = settings || {
      id: 1,
      provider: 'smtp',
      host: '',
      port: 587,
      username: '',
      password: '',
      from_email: '',
      from_name: '',
      secure: true
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Email Settings</h1>
      <p className="text-muted-foreground mb-6">Configure how your application sends emails for things like invoices and notifications.</p>
      <EmailSettingsForm settings={initialData} />
    </div>
  );
}
