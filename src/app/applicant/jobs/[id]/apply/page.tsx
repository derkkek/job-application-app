import { getJobByIdAction, getCountriesAction } from "@/actions/jobs";
import { getApplicationByJobAndApplicantAction } from "@/actions/applications";
import { getCurrentUserProfileServer } from "@/utils/auth-server";
import { ApplyJobForm } from "@/components/organisms/apply-job-form";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

interface ApplyJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyJobPage({ params }: ApplyJobPageProps) {
  const { id } = await params;
  
  // Get current user profile to get applicant ID
const { data: userProfile, error: profileError } = await getCurrentUserProfileServer();
  
  if (profileError || !userProfile) {
    console.log("profile error");
    redirect('/login');
  }

  // Fetch job data server-side
  const { data: job, error: jobError } = await getJobByIdAction(id);
  
  if (jobError || !job) {
    notFound();
  }

  // Fetch countries for the client component
  const { data: countries } = await getCountriesAction();

  // Check if application already exists
  const { data: existingApplicationData } = await getApplicationByJobAndApplicantAction(id, userProfile.id);

  // Convert null values to undefined and Date objects to strings to match the expected type
  const existingApplication = existingApplicationData ? {
    ...existingApplicationData,
    created_at: existingApplicationData.created_at instanceof Date 
      ? existingApplicationData.created_at.toISOString() 
      : existingApplicationData.created_at,
    updated_at: existingApplicationData.updated_at instanceof Date 
      ? existingApplicationData.updated_at.toISOString() 
      : existingApplicationData.updated_at,
    additional_expectations: existingApplicationData.additional_expectations ?? undefined,
    job_application_experiences: existingApplicationData.job_application_experiences.map(exp => ({
      ...exp,
      created_at: exp.created_at instanceof Date ? exp.created_at.toISOString() : exp.created_at,
      end_date: exp.end_date ?? undefined,
      summary: exp.summary ?? undefined,
    }))
  } : undefined;

  return (
    <ApplyJobForm 
      jobId={id}
      job={{
          ...job,
          work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
        }}  
      countries={countries || []} 
      existingApplication={existingApplication}
      applicantId={userProfile.id}
    />
  );
}