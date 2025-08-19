import { getCountriesAction } from "@/lib/actions/jobs-server";
import { CreateJobForm } from "@/components/organisms/create-job-form";

export default async function CreateJobPage() {
  // Fetch countries server-side
  const countriesResult = await getCountriesAction();
  
  if (!countriesResult.success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Job</h1>
          <p className="text-gray-600">Fill out the form below to create a new job posting.</p>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Failed to load countries
        </div>
      </div>
    );
  }

  const countries = countriesResult.data;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Job</h1>
        <p className="text-gray-600">Fill out the form below to create a new job posting.</p>
      </div>

      <CreateJobForm countries={countries || []} />
    </div>
  );
} 