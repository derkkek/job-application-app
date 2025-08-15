"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { deleteApplicationAction } from "@/actions/applications";
import { ApplicationWithExperiences } from "@/types/application";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ApplicationsListClientProps {
  userType: "employer" | "applicant";
  userId: string;
}

export function ApplicationsListClient({ userType, userId }: ApplicationsListClientProps) {
  const [applications, setApplications] = useState<ApplicationWithExperiences[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Load applications when component mounts
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetch(`/api/applications?userType=${userType}&userId=${userId}`).then(res => res.json());
      if (error) {
        setError(error.message || "Failed to load applications");
      } else {
        setApplications(data || []);
      }
    } catch (err) {
      setError("Failed to load applications");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    setLoading(true);
    try {
      const { error } = await deleteApplicationAction(id);
      if (error) {
        setError(error.message || "Failed to delete application");
      } else {
        setApplications(applications.filter(app => app.id !== id));
      }
    } catch (err) {
      setError("Failed to delete application");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 mb-4">No applications yet.</p>
        <Link href="/applicant/jobs">
          <Button>Browse Available Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {applications.map((application) => (
        <div key={application.id} className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            {application.job?.title || "Unknown Job"}
          </h3>
          <p className="text-gray-600 mb-2">
            {application.first_name} {application.last_name}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Salary: {formatCurrency(application.salary_expectation)} • 
            Applied {formatDate(application.created_at)}
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
                         <Link href={`/applicant/jobs/${application.job?.id}/apply`}>
               <Button variant="outline" size="sm">Edit Application</Button>
             </Link>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDelete(application.id)}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
