export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  
  // Personal information
  first_name: string;
  last_name: string;
  country_id: number;
  phone_number: string;
  email: string;
  
  // Expectations
  salary_expectation: number;
  additional_expectations?: string;
  
  created_at: string;
  updated_at: string;
}

export interface JobApplicationExperience {
  id: string;
  application_id: string;
  position: string;
  start_date: string;
  end_date?: string;
  still_working: boolean;
  summary?: string;
  created_at: string;
}

export interface CreateApplicationData {
  job_id: string;
  first_name: string;
  last_name: string;
  country_id: number;
  phone_number: string;
  email: string;
  salary_expectation: number;
  additional_expectations?: string;
  experiences?: JobApplicationExperience[];
}

export interface UpdateApplicationData extends CreateApplicationData {
  id: string;
}

export interface CreateExperienceData {
  application_id: string;
  position: string;
  start_date: string;
  end_date?: string;
  still_working: boolean;
  summary?: string;
}

export interface UpdateExperienceData extends CreateExperienceData {
  id: string;
}

export interface ApplicationWithExperiences extends JobApplication {
  experiences: JobApplicationExperience[];
  job_postings?: {
    id: string;
    title: string;
    countries?: {
      name: string;
    };
  };
}

export const applicationSchema = {
  first_name: { required: true, minLength: 1, maxLength: 100 },
  last_name: { required: true, minLength: 1, maxLength: 100 },
  country_id: { required: true, type: 'number' },
  phone_number: { required: true, minLength: 1, maxLength: 20 },
  email: { required: true, email: true },
  salary_expectation: { required: true, type: 'number', min: 0 },
  additional_expectations: { optional: true, maxLength: 250 },
} as const;

export const experienceSchema = {
  position: { required: true, minLength: 1, maxLength: 100 },
  start_date: { required: true, type: 'date' },
  end_date: { optional: true, type: 'date' },
  still_working: { required: true, type: 'boolean' },
  summary: { optional: true, maxLength: 500 },
} as const; 