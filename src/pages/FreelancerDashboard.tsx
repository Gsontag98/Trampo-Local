import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService, Job, Application } from '../services/db';
import { JobCard } from '../components/JobCard';
import { Search, Briefcase, Phone, Clock } from 'lucide-react';

export const FreelancerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Lists
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<(Application & { job_title?: string; job_price?: number; job_status?: string; company_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');

  // Error/Success Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'danger'>('success');

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch open jobs
      const allJobs = await dbService.getJobs();
      setJobs(allJobs);

      // Fetch my applications
      const apps = await dbService.getFreelancerApplications(user.id);
      setMyApplications(apps);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const showToast = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    try {
      await dbService.applyToJob(jobId, user.id);
      showToast('Candidatura enviada com sucesso! Aguarde a seleção do contratante.', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao candidatar-se.', 'danger');
    }
  };

  // Filters
  const userCity = user?.city;
  const filteredJobs = jobs.filter(job => {
    if (job.status !== 'open') return false;
    
    const matchesCity = job.city?.toLowerCase() === userCity?.toLowerCase();
    
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.description.toLowerCase().includes(search.toLowerCase()) ||
                          job.location.toLowerCase().includes(search.toLowerCase());
                          
    const matchesCategory = category === 'Todas' || job.category === category;
    
    return matchesCity && matchesSearch && matchesCategory;
  });

  const categories = ['Todas', 'Garçom', 'Diarista', 'Passadeira', 'Eletricista', 'Encanador', 'Montador', 'Babá', 'Pintor', 'Outro'];

  // Check if I applied to a specific job
  const hasApplied = (jobId: string) => {
    return myApplications.some(app => app.job_id === jobId);
  };

  const getApplicationStatusBadge = (status: string, jobStatus?: string) => {
    if (status === 'accepted') {
      return <span className="badge badge-success">Selecionado!</span>;
    }
    if (status === 'rejected') {
      return <span className="badge badge-danger">Não Selecionado</span>;
    }
    // If job was closed but I wasn't accepted, or if it is still pending
    if (jobStatus && jobStatus !== 'open' && status === 'pending') {
      return <span className="badge badge-danger">Vaga Fechada</span>;
    }
    return <span className="badge badge-warning">Aguardando Seleção</span>;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (!user) return null;

  return (
    <div className="container">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toastType === 'success' ? '#065f46' : '#991b1b',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          border: `1px solid ${toastType === 'success' ? '#10b981' : '#ef4444'}`,
          fontWeight: 600,
          animation: 'fadeIn var(--transition-fast) forwards',
          fontSize: '0.92rem'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Welcome header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem' }}>Painel do Profissional</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Encontre trabalhos rápidos na sua cidade e gerencie suas candidaturas.
        </p>
      </div>

      <div className="dashboard-grid">
        
        {/* Left Side: Jobs Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Briefcase size={20} /> Vagas Disponíveis
            </h2>
            <span className="badge badge-info" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
              Mostrando vagas em: <strong>{user.city}</strong>
            </span>
          </div>

           {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Buscar por cargo, descrição ou bairro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* Category Pills (Match dashboard filter tabs style) */}
            <div className="pill-filter-bar">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`pill-button ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Carregando vagas...</p>
          ) : filteredJobs.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhuma vaga disponível no momento que corresponda aos filtros de busca.
            </div>
          ) : (
            <div className="job-list">
              {filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  userRole="freelancer" 
                  applied={hasApplied(job.id)}
                  onApply={() => handleApply(job.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: My Applications */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} /> Minhas Candidaturas
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Carregando candidaturas...</p>
          ) : myApplications.length === 0 ? (
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Você ainda não se candidatou a nenhuma vaga.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myApplications.map(app => {
                // Find company phone number to build WhatsApp contact
                const textMessage = `Olá, sou ${user.name} do TrampoLocal. Fui selecionado para a vaga "${app.job_title}" e gostaria de alinhar os detalhes!`;
                const encodedMsg = encodeURIComponent(textMessage);
                // We'll fallback to a mock phone if we don't have it joined
                const companyPhone = '5511911111111'; // default mock company phone
                const whatsAppLink = `https://wa.me/${companyPhone}?text=${encodedMsg}`;

                return (
                  <div key={app.id} className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Empresa: <strong>{app.company_name}</strong>
                      </span>
                      {getApplicationStatusBadge(app.status, app.job_status)}
                    </div>
                    
                    <h3 style={{ fontSize: '1rem', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                      {app.job_title}
                    </h3>
                    
                    <div className="dashboard-action-box" style={{ marginTop: '12px', padding: 0, background: 'none', border: 'none', width: '100%' }}>
                      <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.95rem' }}>
                        {formatCurrency(app.job_price || 0)}
                      </span>
                      
                      {app.status === 'accepted' && (
                        <div className="dashboard-action-box-buttons">
                          <a 
                            href={whatsAppLink}
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ background: 'var(--success)', border: 'none', padding: '6px 12px', fontSize: '0.78rem' }}
                          >
                            <Phone size={12} /> WhatsApp do Contratante
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
