export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  user_type: 'employer' | 'applicant'
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  id: string
  email: string
  first_name?: string
  last_name?: string
  user_type: 'employer' | 'applicant'
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  user_type?: 'employer' | 'applicant'
}
