import { Button } from "@/components/ui/button";
import { getJobByIdAction, getCountriesAction } from "@/actions/jobs";
import { EmployerJobDetailsClient } from "@/components/organisms/employer-job-details-client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getWorkLocationDisplay } from "@/lib/utils";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  
  // Fetch job data server-side
  const { data: job, error: jobError } = await getJobByIdAction(id);
  
  if (jobError || !job) {
    notFound();
  }

  // Fetch countries for the client component
  const { data: countries } = await getCountriesAction();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <p className="text-gray-600 text-lg">{job.country?.name || `Country ID: ${job.location_country_id}`}</p>
            <p className="text-gray-500">
              {getWorkLocationDisplay(job.work_location)} • Created {formatDate(job.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/employer/jobs/${id}/edit`}>
              <Button variant="outline">Update</Button>
            </Link>
            <EmployerJobDetailsClient 
              job={{
                ...job,
                work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
              }} 
              countries={countries || []} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Job Requirements</h2>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-gray-700">{job.requirements}</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/employer/jobs">
          <Button variant="outline">Back to My Jobs</Button>
        </Link>
      </div>
    </div>
  );
} 