import { ActivityHistory } from "@/components/activity/ActivityHistory";
import { SettingsSection } from "@/components/settings/SettingsSection";

export default function SettingsPage() {
  return (
    <div className="min-h-screen max-w-5xl w-full bg-gray-50 py-6 px-6">
      <SettingsSection />
      <ActivityHistory />
    </div>
  );
}
