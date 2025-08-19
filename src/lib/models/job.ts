export interface Job {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  description: string | null;
  location_country_id: number;
  work_location: 'onsite' | 'remote' | 'hybrid';
  requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  job_type: string | null;
  employer_id: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
  // Related data
  country?: {
    id: number;
    name: string;
    code: string;
  };
  employer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export interface CreateJobData {
  title: string;
  location_country_id: number;
  work_location: 'onsite' | 'remote' | 'hybrid';
  requirements: string;
  company?: string;
  location?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
}

export interface UpdateJobData extends CreateJobData {
  id: string;
}

export interface Country {
  id: number;
  name: string;
  code: string;
}

export const jobSchema = {
  title: { required: true, minLength: 1, maxLength: 100 },
  location_country_id: { required: true, type: 'number' },
  work_location: { required: true, enum: ['onsite', 'remote', 'hybrid'] },
  requirements: { required: true, minLength: 10, maxLength: 2000 },
} as const; 