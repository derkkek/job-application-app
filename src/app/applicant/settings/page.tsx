import { Button } from "@/components/ui/button";

export default function ApplicantSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">user@example.com</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">Jane Smith</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Type</label>
            <p className="text-gray-900">Applicant</p>
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="destructive">Logout</Button>
        </div>
      </div>
    </div>
  );
} 