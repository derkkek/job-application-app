export interface Job {
  id: string;
  title: string;
  location_country_id: number;
  work_location: 'onsite' | 'remote' | 'hybrid';
  requirements: string;
  employer_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateJobData {
  title: string;
  location_country_id: number;
  work_location: 'onsite' | 'remote' | 'hybrid';
  requirements: string;
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