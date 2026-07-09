-- =============================================================
-- TRAMPOLOCAL DATABASE SCHEMA FOR SUPABASE / POSTGRESQL
-- =============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Stores profile details for both companies and freelancers.
-- Inherits from auth.users (Supabase Auth).
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('company', 'freelancer')),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    rating_avg NUMERIC(3,2) DEFAULT 5.0 CHECK (rating_avg BETWEEN 1.0 AND 5.0),
    city TEXT NOT NULL DEFAULT 'Campinas',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Permitir leitura pública de perfis" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Permitir que usuários modifiquem seu próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Permitir inserção pelo próprio usuário" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. JOBS TABLE
-- Stores gig details created by companies.
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price > 0),
    schedule TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Campinas',
    status VARCHAR(20) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'closed', 'completed')),
    selected_freelancer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Jobs Policies
CREATE POLICY "Permitir visualização pública de vagas" ON public.jobs
    FOR SELECT USING (true);

CREATE POLICY "Permitir criação de vagas por contratantes logados" ON public.jobs
    FOR INSERT WITH CHECK (
        auth.uid() = company_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'company'
        )
    );

CREATE POLICY "Permitir atualização de vagas pelo criador" ON public.jobs
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "Permitir deleção pelo criador" ON public.jobs
    FOR DELETE USING (auth.uid() = company_id);


-- 3. APPLICATIONS TABLE
-- Stores freelancer candidatures to jobs.
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(job_id, freelancer_id)
);

-- Enable Row Level Security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications Policies
CREATE POLICY "Permitir que freelancers vejam suas próprias candidaturas" ON public.applications
    FOR SELECT USING (auth.uid() = freelancer_id);

CREATE POLICY "Permitir que empresas vejam candidaturas para suas vagas" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE id = job_id AND company_id = auth.uid()
        )
    );

CREATE POLICY "Permitir que freelancers se candidatem" ON public.applications
    FOR INSERT WITH CHECK (
        auth.uid() = freelancer_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'freelancer'
        )
    );

CREATE POLICY "Permitir atualização do status da candidatura pelo contratante" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE id = job_id AND company_id = auth.uid()
        )
    );


-- 4. REVIEWS TABLE
-- Stores worker evaluations made by companies after job completion.
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    job_title TEXT,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews Policies
CREATE POLICY "Permitir leitura pública de avaliações" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Permitir criação de avaliação pelo contratante" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE id = job_id AND company_id = auth.uid() AND selected_freelancer_id = reviewee_id
        )
    );


-- 5. PROFILE TRIGGERS & FUNCTIONS (OPTIONAL FOR AUTOMATION)
-- Automatically creates a profile record when a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role, bio, city)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    (COALESCE(new.raw_user_meta_data->>'role', 'freelancer'))::varchar,
    'Perfil criado automaticamente.',
    COALESCE(new.raw_user_meta_data->>'city', 'Campinas')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automate profile insertion (uncomment if using Supabase Auth signup flow metadata)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
