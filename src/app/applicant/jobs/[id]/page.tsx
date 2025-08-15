import { Button } from "@/components/ui/button";
import { getJobByIdAction } from "@/actions/jobs";
import { getCountriesAction } from "@/actions/jobs";
import { JobDetailsClient } from "@/components/organisms/job-details-client";
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
              {getWorkLocationDisplay(job.work_location)} • Posted {formatDate(job.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/applicant/jobs/${id}/apply`}>
              <Button>Apply Now</Button>
            </Link>
          </div>
        </div>
      </div>

      <JobDetailsClient job={job} countries={countries || []} />
    </div>
  );
} 