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

// -------------------------------------------------------------
// SUPABASE CLIENT INITIALIZATION (IF KEYS EXIST)
// -------------------------------------------------------------
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isRealSupabase = !!(supabaseUrl && supabaseAnonKey);
export const supabase = isRealSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (isRealSupabase) {
  console.log('🔌 Conectado ao Supabase de Produção!');
} else {
  console.log('💾 Utilizando Banco de Dados Local (Simulado via LocalStorage)');
}

// -------------------------------------------------------------
// LOCALSTORAGE SIMULATION LAYER (FALLBACK)
// -------------------------------------------------------------
const STORAGE_PREFIX = 'trampolocal_';

const initialProfiles: Profile[] = [
  {
    id: 'f-1',
    role: 'freelancer',
    name: 'Carlos Oliveira',
    phone: '5511999999999',
    bio: 'Garçom profissional com mais de 5 anos de experiência em eventos corporativos e casamentos. Pontual, organizado e sempre de bom humor.',
    skills: ['Garçom', 'Eventos', 'Barista', 'Atendimento'],
    rating_avg: 4.8,
    city: 'Campo Mourão - PR',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f-2',
    role: 'freelancer',
    name: 'Ana Souza',
    phone: '5521988888888',
    bio: 'Diarista experiente com referências excelentes na cidade. Limpeza residencial e comercial minuciosa. Trago meus próprios produtos ecológicos.',
    skills: ['Diarista', 'Limpeza', 'Passadeira', 'Organização'],
    rating_avg: 5.0,
    city: 'Campo Mourão - PR',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f-3',
    role: 'freelancer',
    name: 'Marcos Santos',
    phone: '5519977777777',
    bio: 'Eletricista e Encanador certificado pelo SENAI. Pequenos reparos residenciais, troca de fiação, instalação de luminárias e desentupimentos rápidos.',
    skills: ['Eletricista', 'Encanador', 'Reparos', 'Montador'],
    rating_avg: 4.6,
    city: 'Campo Mourão - PR',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c-1',
    role: 'company',
    name: 'Buffet Delícias Festas',
    phone: '5511911111111',
    bio: 'Organização de festas infantis e confraternizações locais.',
    skills: [],
    rating_avg: 4.5,
    city: 'Campo Mourão - PR',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c-2',
    role: 'company',
    name: 'Residência Família Silva',
    phone: '5511922222222',
    bio: 'Contratante particular do bairro Centro.',
    skills: [],
    rating_avg: 5.0,
    city: 'Campo Mourão - PR',
    created_at: new Date().toISOString(),
  }
];

const initialJobs: Job[] = [
  {
    id: 'j-1',
    company_id: 'c-1',
    title: 'Garçom para Casamento no Sábado',
    category: 'Garçom',
    description: 'Buscamos garçom experiente para atuar em festa de casamento. Necessário roupa social completa (camisa social branca, calça social preta e sapato social). Evento com duração aproximada de 6 horas.',
    price: 180,
    schedule: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T17:00',
    location: 'Bairro Jardim América, Salão Nobre',
    city: 'Campo Mourão - PR',
    status: 'open',
    is_featured: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j-2',
    company_id: 'c-2',
    title: 'Limpeza Geral em Apartamento de 2 quartos',
    category: 'Diarista',
    description: 'Faxina geral incluindo janelas e geladeira. Apartamento pequeno no centro da cidade. Preferência para quem puder começar no período da manhã. Oferecemos almoço no local.',
    price: 150,
    schedule: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:00',
    location: 'Bairro Centro, Rua das Flores',
    city: 'Campo Mourão - PR',
    status: 'open',
    is_featured: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j-3',
    company_id: 'c-1',
    title: 'Ajudante Geral para Montagem de Brinquedos',
    category: 'Montador',
    description: 'Montar pula-pula e piscina de bolinhas para evento infantil de aniversário. Serviço rápido de montagem na sexta à tarde e desmontagem no sábado à noite.',
    price: 120,
    schedule: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T13:00',
    location: 'Chácara dos Pinheiros',
    city: 'Campo Mourão - PR',
    status: 'open',
    is_featured: false,
    created_at: new Date().toISOString()
  }
];

const initialApplications: Application[] = [
  {
    id: 'a-1',
    job_id: 'j-1',
    freelancer_id: 'f-1',
    status: 'pending',
    created_at: new Date().toISOString(),
  }
];

const initialReviews: Review[] = [
  {
    id: 'r-1',
    job_id: 'j-0',
    job_title: 'Garçom em Evento Corporativo',
    reviewer_id: 'c-1',
    reviewer_name: 'Buffet Delícias Festas',
    reviewee_id: 'f-1',
    rating: 5,
    comment: 'Carlos foi excepcional! Atendimento impecável, muito educado com todos os convidados e ajudou na organização geral. Com certeza contrataremos novamente.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r-2',
    job_id: 'j-00',
    job_title: 'Faxina Geral Pós-Reforma',
    reviewer_id: 'c-2',
    reviewer_name: 'Residência Família Silva',
    reviewee_id: 'f-2',
    rating: 5,
    comment: 'A Ana fez um trabalho maravilhoso de limpeza pós-obra. O apartamento ficou brilhando. Recomendo muito!',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Helper functions for LocalStorage
function getLocalData<T>(key: string, initialData: T[]): T[] {
  const stored = localStorage.getItem(STORAGE_PREFIX + key);
  if (!stored) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
}

function setLocalData<T>(key: string, data: T[]): void {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

// -------------------------------------------------------------
// DATABASE SERVICE METHODS (HYBRID)
// -------------------------------------------------------------
export const dbService = {
  // Profiles
  async getProfile(id: string): Promise<Profile | null> {
    if (isRealSupabase && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) return null;
      return data as Profile;
    } else {
      const profiles = getLocalData('profiles', initialProfiles);
      return profiles.find(p => p.id === id) || null;
    }
  },

  async saveProfile(profile: Profile): Promise<Profile> {
    if (isRealSupabase && supabase) {
      const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
      if (error) throw error;
      return data as Profile;
    } else {
      const profiles = getLocalData('profiles', initialProfiles);
      const index = profiles.findIndex(p => p.id === profile.id);
      if (index >= 0) {
        profiles[index] = { ...profiles[index], ...profile };
      } else {
        profiles.push(profile);
      }
      setLocalData('profiles', profiles);
      return profile;
    }
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    if (isRealSupabase && supabase) {
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
    } else {
      const jobs = getLocalData('jobs', initialJobs);
      const profiles = getLocalData('profiles', initialProfiles);
      return jobs
        .map(job => {
          const company = profiles.find(p => p.id === job.company_id);
          return {
            ...job,
            company_name: company?.name || 'Empresa Anônima'
          };
        })
        .sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }
  },

  async createJob(job: Omit<Job, 'id' | 'created_at' | 'status' | 'is_featured'>): Promise<Job> {
    const newJob: Job = {
      ...job,
      id: 'j-' + Math.random().toString(36).substr(2, 9),
      status: 'open',
      is_featured: false, // For testing, defaults to normal. Toggle is_featured manually in lists.
      created_at: new Date().toISOString()
    };

    if (isRealSupabase && supabase) {
      const { data, error } = await supabase.from('jobs').insert(newJob).select().single();
      if (error) throw error;
      return data as Job;
    } else {
      const jobs = getLocalData('jobs', initialJobs);
      jobs.push(newJob);
      setLocalData('jobs', jobs);
      return newJob;
    }
  },

  async closeJob(jobId: string, freelancerId: string): Promise<void> {
    if (isRealSupabase && supabase) {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'closed', selected_freelancer_id: freelancerId })
        .eq('id', jobId);
      if (error) throw error;
    } else {
      const jobs = getLocalData('jobs', initialJobs);
      const index = jobs.findIndex(j => j.id === jobId);
      if (index >= 0) {
        jobs[index].status = 'closed';
        jobs[index].selected_freelancer_id = freelancerId;
        setLocalData('jobs', jobs);
      }
    }
  },

  async completeJob(jobId: string): Promise<void> {
    if (isRealSupabase && supabase) {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', jobId);
      if (error) throw error;
    } else {
      const jobs = getLocalData('jobs', initialJobs);
      const index = jobs.findIndex(j => j.id === jobId);
      if (index >= 0) {
        jobs[index].status = 'completed';
        setLocalData('jobs', jobs);
      }
    }
  },

  // Applications
  async getApplications(jobId: string): Promise<Application[]> {
    if (isRealSupabase && supabase) {
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
    } else {
      const apps = getLocalData('applications', initialApplications);
      const profiles = getLocalData('profiles', initialProfiles);
      return apps
        .filter(app => app.job_id === jobId)
        .map(app => {
          const free = profiles.find(p => p.id === app.freelancer_id);
          return {
            ...app,
            freelancer_name: free?.name || 'Profissional',
            freelancer_rating: free?.rating_avg || 5.0,
            freelancer_phone: free?.phone || ''
          };
        });
    }
  },

  async applyToJob(jobId: string, freelancerId: string): Promise<Application> {
    const newApp: Application = {
      id: 'a-' + Math.random().toString(36).substr(2, 9),
      job_id: jobId,
      freelancer_id: freelancerId,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (isRealSupabase && supabase) {
      const { data, error } = await supabase.from('applications').insert(newApp).select().single();
      if (error) throw error;
      return data as Application;
    } else {
      const apps = getLocalData('applications', initialApplications);
      const alreadyApplied = apps.some(a => a.job_id === jobId && a.freelancer_id === freelancerId);
      if (alreadyApplied) throw new Error('Você já se candidatou a esta vaga!');
      apps.push(newApp);
      setLocalData('applications', apps);
      return newApp;
    }
  },

  async selectFreelancerForJob(jobId: string, freelancerId: string): Promise<void> {
    // 1. Update applications status
    if (isRealSupabase && supabase) {
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('job_id', jobId)
        .eq('freelancer_id', freelancerId);
      if (appError) throw appError;

      const { error: appRejError } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('job_id', jobId)
        .neq('freelancer_id', freelancerId);
      if (appRejError) throw appRejError;

      // 2. Update job status
      await this.closeJob(jobId, freelancerId);
    } else {
      const apps = getLocalData('applications', initialApplications);
      apps.forEach(app => {
        if (app.job_id === jobId) {
          app.status = app.freelancer_id === freelancerId ? 'accepted' : 'rejected';
        }
      });
      setLocalData('applications', apps);
      await this.closeJob(jobId, freelancerId);
    }
  },

  async getFreelancerApplications(freelancerId: string): Promise<(Application & { job_title?: string; job_price?: number; job_status?: string; company_name?: string })[]> {
    if (isRealSupabase && supabase) {
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
    } else {
      const apps = getLocalData('applications', initialApplications);
      const jobs = getLocalData('jobs', initialJobs);
      const profiles = getLocalData('profiles', initialProfiles);

      return apps
        .filter(app => app.freelancer_id === freelancerId)
        .map(app => {
          const job = jobs.find(j => j.id === app.job_id);
          const company = job ? profiles.find(p => p.id === job.company_id) : null;
          return {
            ...app,
            job_title: job?.title || 'Vaga Não Encontrada',
            job_price: job?.price || 0,
            job_status: job?.status || 'closed',
            company_name: company?.name || 'Contratante'
          };
        });
    }
  },

  // Reviews
  async getReviews(userId: string): Promise<Review[]> {
    if (isRealSupabase && supabase) {
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
    } else {
      const reviews = getLocalData('reviews', initialReviews);
      const profiles = getLocalData('profiles', initialProfiles);
      return reviews
        .filter(r => r.reviewee_id === userId)
        .map(r => {
          const reviewer = profiles.find(p => p.id === r.reviewer_id);
          return {
            ...r,
            reviewer_name: reviewer?.name || 'Usuário Anônimo'
          };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: 'r-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    if (isRealSupabase && supabase) {
      const { data, error } = await supabase.from('reviews').insert(newReview).select().single();
      if (error) throw error;
      
      // Update profile rating in background
      await this.updateUserRatingAverage(review.reviewee_id);
      
      return data as Review;
    } else {
      const reviews = getLocalData('reviews', initialReviews);
      reviews.push(newReview);
      setLocalData('reviews', reviews);
      
      // Update profile rating
      const profiles = getLocalData('profiles', initialProfiles);
      const userReviews = reviews.filter(r => r.reviewee_id === review.reviewee_id);
      const sum = userReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = parseFloat((sum / userReviews.length).toFixed(1));
      
      const index = profiles.findIndex(p => p.id === review.reviewee_id);
      if (index >= 0) {
        profiles[index].rating_avg = avg;
        setLocalData('profiles', profiles);
      }
      
      return newReview;
    }
  },

  // Recalculates and updates rating average for Supabase
  async updateUserRatingAverage(userId: string): Promise<void> {
    if (!isRealSupabase || !supabase) return;
    const { data: reviews } = await supabase.from('reviews').select('rating').eq('reviewee_id', userId);
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = parseFloat((sum / reviews.length).toFixed(1));
      await supabase.from('profiles').update({ rating_avg: avg }).eq('id', userId);
    }
  }
};
