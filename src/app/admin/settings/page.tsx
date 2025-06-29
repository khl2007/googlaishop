import { getSettings } from "@/lib/data";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  // In a real app, these would come from a more robust source like a library or API
  const timezones = [
    "Africa/Abidjan", "America/New_York", "America/Los_Angeles", "Asia/Tokyo", 
    "Australia/Sydney", "Europe/London", "Europe/Paris", "Pacific/Auckland", "UTC"
  ];
  const countries = [
    "USA", "Canada", "United Kingdom", "Australia", "Japan", "Germany", "France"
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Website Settings</h1>
      <p className="text-muted-foreground mb-6">Manage general settings for your e-commerce site.</p>
      <SettingsForm settings={settings} timezones={timezones} countries={countries} />
    </div>
  );
}
