import { createClient } from '@supabase/supabase-js';

// Types
export interface Profile {
  id: string;
  role: 'company' | 'freelancer';
  name: string;
  phone: string;
  bio: string;
  skills: string[];
  rating_avg: number;
  city: string;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  company_name?: string; // joined
  title: string;
  category: string;
  description: string;
  price: number;
  schedule: string;
  location: string;
  city: string;
  status: 'open' | 'closed' | 'completed';
  selected_freelancer_id?: string;
  selected_freelancer_name?: string; // joined
  selected_freelancer_phone?: string; // joined
  is_featured: boolean;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  freelancer_id: string;
  freelancer_name?: string; // joined
  freelancer_rating?: number; // joined
  freelancer_phone?: string; // joined
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Review {
  id: string;
  job_id: string;
  job_title?: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -------------------------------------------------------------
// DATABASE SERVICE METHODS (PRODUCTION ONLY)
// -------------------------------------------------------------
export const dbService = {
  // Profiles
  async getProfile(id: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) return null;
    return data as Profile;
  },

  async saveProfile(profile: Profile): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
    if (error) throw error;
    return data as Profile;
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        profiles:company_id (name)
      `)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((item: any) => ({
      ...item,
      company_name: item.profiles?.name || 'Empresa Anônima'
    })) as Job[];
  },

  async createJob(job: Omit<Job, 'id' | 'created_at' | 'status' | 'is_featured'>): Promise<Job> {
    const newJob = {
      ...job,
      id: crypto.randomUUID(),
      status: 'open',
      is_featured: false,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('jobs').insert(newJob).select().single();
    if (error) throw error;
    return data as Job;
  },

  async closeJob(jobId: string, freelancerId: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'closed', selected_freelancer_id: freelancerId })
      .eq('id', jobId);
    if (error) throw error;
  },

  async completeJob(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'completed' })
      .eq('id', jobId);
    if (error) throw error;
  },

  // Applications
  async getJobApplications(jobId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        profiles:freelancer_id (name, rating_avg, phone)
      `)
      .eq('job_id', jobId);
    if (error) throw error;
    return data.map((item: any) => ({
      ...item,
      freelancer_name: item.profiles?.name || 'Profissional',
      freelancer_rating: item.profiles?.rating_avg || 5.0,
      freelancer_phone: item.profiles?.phone || ''
    })) as Application[];
  },

  async applyToJob(jobId: string, freelancerId: string): Promise<Application> {
    const newApp = {
      id: crypto.randomUUID(),
      job_id: jobId,
      freelancer_id: freelancerId,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('applications').insert(newApp).select().single();
    if (error) throw error;
    return data as Application;
  },

  async updateApplicationStatus(appId: string, status: 'accepted' | 'rejected'): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', appId);
    if (error) throw error;
  },

  async selectFreelancerForJob(jobId: string, freelancerId: string): Promise<void> {
    // 1. Accept this freelancer's application
    const { error: appError } = await supabase
      .from('applications')
      .update({ status: 'accepted' })
      .eq('job_id', jobId)
      .eq('freelancer_id', freelancerId);
    if (appError) throw appError;

    // 2. Reject all other applications for this job
    const { error: rejectError } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('job_id', jobId)
      .not('freelancer_id', 'eq', freelancerId);
    if (rejectError) throw rejectError;

    // 3. Close the job and assign selected freelancer
    await this.closeJob(jobId, freelancerId);
  },

  async getFreelancerApplications(freelancerId: string): Promise<(Application & { job_title?: string; job_price?: number; job_status?: string; company_name?: string })[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs:job_id (title, price, status, company_id, profiles:company_id (name))
      `)
      .eq('freelancer_id', freelancerId);
    if (error) throw error;
    return data.map((item: any) => ({
      ...item,
      job_title: item.jobs?.title,
      job_price: item.jobs?.price,
      job_status: item.jobs?.status,
      company_name: item.jobs?.profiles?.name || 'Contratante'
    }));
  },

  // Reviews
  async getReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:reviewer_id (name)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((item: any) => ({
      ...item,
      reviewer_name: item.profiles?.name || 'Usuário Anônimo'
    })) as Review[];
  },

  async addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const newReview = {
      ...review,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('reviews').insert(newReview).select().single();
    if (error) throw error;
    return data as Review;
  }
};
