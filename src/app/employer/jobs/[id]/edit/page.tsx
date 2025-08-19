import { getJobByIdAction, getCountriesAction } from "@/lib/actions/jobs-server";
import { EditJobForm } from "@/components/organisms/edit-job-form";
import { notFound } from "next/navigation";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  
  // Fetch job data server-side
  const jobResult = await getJobByIdAction(id);
  
  if (!jobResult.success || !jobResult.data) {
    notFound();
  }

  const job = jobResult.data;

  // Fetch countries for the client component
  const countriesResult = await getCountriesAction();
  const countries = countriesResult.success ? countriesResult.data : [];
  
  if (!countriesResult.success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Job</h1>
          <p className="text-gray-600">Update the job posting details below.</p>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Failed to load countries
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Job</h1>
        <p className="text-gray-600">Update the job posting details below.</p>
      </div>

      <EditJobForm 
        job={{
          ...job,
          work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
        }} 
        countries={countries || []} 
      />
    </div>
  );
} 