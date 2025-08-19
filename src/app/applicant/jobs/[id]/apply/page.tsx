import { getJobByIdAction, getCountriesAction } from "@/lib/actions/jobs-server";
import { getApplicationByJobAndApplicantAction } from "@/lib/actions/applications-server";
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
  const jobResult = await getJobByIdAction(id);
  
  if (!jobResult.success || !jobResult.data) {
    notFound();
  }

  const job = jobResult.data;

  // Fetch countries for the client component
  const countriesResult = await getCountriesAction();
  const countries = countriesResult.success ? countriesResult.data : [];

  // Check if application already exists
  const applicationResult = await getApplicationByJobAndApplicantAction(id, userProfile.id);
  const existingApplicationData = applicationResult.success ? applicationResult.data : null;

  // Convert null values to undefined and Date objects to strings to match the expected type
  const existingApplication = existingApplicationData ? {
    ...existingApplicationData,
    created_at: typeof existingApplicationData.created_at === 'object' && existingApplicationData.created_at !== null 
      ? (existingApplicationData.created_at as Date).toISOString() 
      : existingApplicationData.created_at as string,
    updated_at: typeof existingApplicationData.updated_at === 'object' && existingApplicationData.updated_at !== null 
      ? (existingApplicationData.updated_at as Date).toISOString() 
      : existingApplicationData.updated_at as string,
    additional_expectations: existingApplicationData.additional_expectations ?? undefined,
    job_application_experiences: existingApplicationData.experiences?.map((exp: any) => ({
      ...exp,
      created_at: typeof exp.created_at === 'object' && exp.created_at !== null ? (exp.created_at as Date).toISOString() : exp.created_at,
      end_date: exp.end_date ?? undefined,
      summary: exp.summary ?? undefined,
    })) || []
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