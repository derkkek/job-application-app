"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getApplicantApplications, deleteApplication, getApplicationExperiences } from "@/utils/applications";
import { ApplicationWithExperiences } from "@/types/application";
import Link from "next/link";

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState<ApplicationWithExperiences[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const { data, error } = await getApplicantApplications();
    if (error) {
      setError(error.message || "Failed to load applications");
    } else {
      // Load experiences for each application
      const applicationsWithExperiences = await Promise.all(
        (data || []).map(async (app) => {
          const { data: experiences } = await getApplicationExperiences(app.id);
          return {
            ...app,
            experiences: experiences || [],
          };
        })
      );
      setApplications(applicationsWithExperiences);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    const { error } = await deleteApplication(id);
    if (error) {
      setError(error.message || "Failed to delete application");
    } else {
      setApplications(applications.filter(app => app.id !== id));
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-gray-600">View and manage your job applications.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No applications yet.</p>
          <Link href="/applicant/jobs">
            <Button>Browse Available Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <div key={application.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                {application.job_postings?.title || "Unknown Job"}
              </h3>
              <p className="text-gray-600 mb-2">
                {application.first_name} {application.last_name}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Salary: ${application.salary_expectation?.toLocaleString()} • 
                Applied {new Date(application.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                {application.experiences?.length || 0} experience(s)
              </p>
              {application.additional_expectations && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {application.additional_expectations}
                </p>
              )}
              <div className="flex gap-2">
                <Link href={`/applicant/jobs/${application.job_postings?.id}/apply`}>
                  <Button variant="outline" size="sm">Edit Application</Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(application.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 