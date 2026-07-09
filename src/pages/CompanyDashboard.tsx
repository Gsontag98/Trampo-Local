import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService, Job, Application } from '../services/db';
import { JobCard } from '../components/JobCard';
import { Modal } from '../components/Modal';
import { Plus, Check, Star, Phone, MessageSquare } from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Lists
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Create Job
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Garçom');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');

  // Candidates Cache per Job
  const [candidates, setCandidates] = useState<Record<string, Application[]>>({});

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<Job | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Fetch jobs
  const fetchJobs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const allJobs = await dbService.getJobs();
      // Filter only jobs from this company
      const companyJobs = allJobs.filter(j => j.company_id === user.id);
      setJobs(companyJobs);

      // Fetch candidates for open jobs
      const openJobs = companyJobs.filter(j => j.status === 'open');
      const candidatesMap: Record<string, Application[]> = {};
      for (const j of openJobs) {
        const apps = await dbService.getJobApplications(j.id);
        candidatesMap[j.id] = apps;
      }
      setCandidates(candidatesMap);
    } catch (err) {
      console.error('Error fetching company jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError('');

    if (!title.trim()) return setFormError('Título é obrigatório.');
    if (!description.trim()) return setFormError('Descrição é obrigatória.');
    if (!price || parseFloat(price) <= 0) return setFormError('Insira um valor válido maior que R$ 0.');
    if (!schedule) return setFormError('Data e hora do serviço são obrigatórios.');
    if (!location.trim()) return setFormError('Localização é obrigatória.');

    try {
      await dbService.createJob({
        company_id: user.id,
        title,
        category,
        description,
        price: parseFloat(price),
        schedule,
        location,
        city: user.city
      });

      // Clear form
      setTitle('');
      setCategory('Garçom');
      setDescription('');
      setPrice('');
      setSchedule('');
      setLocation('');
      setIsCreateOpen(false);

      // Refresh list
      fetchJobs();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar vaga.');
    }
  };

  const handleSelectCandidate = async (job: Job, app: Application) => {
    try {
      await dbService.selectFreelancerForJob(job.id, app.freelancer_id);
      
      // Generate WhatsApp Link
      const textMessage = `Olá ${app.freelancer_name}, vi sua candidatura no TrampoLocal para a vaga "${job.title}" e gostaria de fechar o serviço com você!`;
      const encodedMsg = encodeURIComponent(textMessage);
      const whatsAppLink = `https://wa.me/${app.freelancer_phone}?text=${encodedMsg}`;
      
      // Open WhatsApp in new tab
      window.open(whatsAppLink, '_blank');

      // Refresh list
      fetchJobs();
    } catch (err) {
      console.error('Error selecting candidate:', err);
    }
  };

  const handleMarkAsCompleted = async (jobId: string) => {
    try {
      await dbService.completeJob(jobId);
      fetchJobs();
    } catch (err) {
      console.error('Error completing job:', err);
    }
  };

  const openReviewModal = (job: Job) => {
    setSelectedJobForReview(job);
    setRating(5);
    setComment('');
    setReviewError('');
    setIsReviewOpen(true);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJobForReview || !selectedJobForReview.selected_freelancer_id) return;
    setReviewError('');

    if (!comment.trim()) {
      return setReviewError('Por favor, digite um comentário sobre o serviço prestado.');
    }

    try {
      await dbService.addReview({
        job_id: selectedJobForReview.id,
        job_title: selectedJobForReview.title,
        reviewer_id: user.id,
        reviewee_id: selectedJobForReview.selected_freelancer_id,
        rating,
        comment
      });

      setIsReviewOpen(false);
      setSelectedJobForReview(null);
      // Refresh list
      fetchJobs();
    } catch (err: any) {
      setReviewError(err.message || 'Erro ao salvar avaliação.');
    }
  };

  const categories = ['Garçom', 'Diarista', 'Passadeira', 'Eletricista', 'Encanador', 'Montador', 'Babá', 'Pintor', 'Outro'];

  // Segregate jobs by status
  const openGigs = jobs.filter(j => j.status === 'open');
  const inProgressGigs = jobs.filter(j => j.status === 'closed');
  const finishedGigs = jobs.filter(j => j.status === 'completed');

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem' }}>Painel da Empresa</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie suas vagas e contrate profissionais locais.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={20} />
          Criar Nova Vaga
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando vagas...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* 1. VAGAS ABERTAS / RECRUTANDO */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
              Recrutando ({openGigs.length})
            </h2>

            {openGigs.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhuma vaga aberta recrutando no momento. Clique em "Criar Nova Vaga" para começar!
              </div>
            ) : (
              <div className="job-list">
                {openGigs.map(job => (
                  <JobCard key={job.id} job={job} userRole="company">
                    <div className="candidates-list">
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <MessageSquare size={14} /> Candidatos Interessados ({candidates[job.id]?.length || 0})
                      </h4>
                      
                      {(!candidates[job.id] || candidates[job.id].length === 0) ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '8px' }}>
                          Aguardando candidatos locais aplicarem...
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {candidates[job.id].map(app => (
                            <div key={app.id} className="candidate-row">
                              <div>
                                <div className="candidate-name">
                                  {app.freelancer_name}
                                  <span style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--secondary)' }}>
                                    <Star size={10} fill="var(--secondary)" /> {app.freelancer_rating?.toFixed(1) || '5.0'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  WhatsApp: +{app.freelancer_phone}
                                </div>
                              </div>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSelectCandidate(job, app)}
                              >
                                <Check size={14} /> Contratar
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </JobCard>
                ))}
              </div>
            )}
          </div>

          {/* 2. TRAMPOS EM ANDAMENTO */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }}></span>
              Serviços em Andamento ({inProgressGigs.length})
            </h2>

            {inProgressGigs.length === 0 ? (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhum serviço em andamento no momento.
              </div>
            ) : (
              <div className="job-list">
                {inProgressGigs.map(job => (
                  <JobCard key={job.id} job={job} userRole="company">
                    <div className="dashboard-action-box action-box-blue">
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Profissional Contratado:</div>
                        <div style={{ fontWeight: 600 }}>{job.selected_freelancer_name || 'Profissional'}</div>
                      </div>
                      
                      <div className="dashboard-action-box-buttons">
                        <a 
                          href={`https://wa.me/${job.selected_freelancer_phone}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                        >
                          <Phone size={14} /> Falar no WhatsApp
                        </a>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleMarkAsCompleted(job.id)}
                        >
                          Marcar como Finalizado
                        </button>
                      </div>
                    </div>
                  </JobCard>
                ))}
              </div>
            )}
          </div>

          {/* 3. TRAMPOS FINALIZADOS */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}></span>
              Histórico / Concluídos ({finishedGigs.length})
            </h2>

            {finishedGigs.length === 0 ? (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhum serviço finalizado no histórico.
              </div>
            ) : (
              <div className="job-list">
                {finishedGigs.map(job => (
                  <JobCard key={job.id} job={job} userRole="company">
                    <div className="dashboard-action-box action-box-gray">
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Trabalho realizado por: <strong>{job.selected_freelancer_name}</strong>
                        </span>
                      </div>
                      
                      <div className="dashboard-action-box-buttons">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => openReviewModal(job)}
                        >
                          <Star size={14} fill="var(--secondary)" stroke="var(--secondary)" /> Avaliar Profissional
                        </button>
                      </div>
                    </div>
                  </JobCard>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL: CRIAR NOVA VAGA */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Anunciar Novo Trabalho">
        {formError && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
            {formError}
          </div>
        )}
        
        <form onSubmit={handleCreateJob}>
          <div className="form-group">
            <label className="form-label" htmlFor="job-title">Título do Serviço</label>
            <input 
              id="job-title"
              type="text" 
              className="form-control" 
              placeholder="Ex: Garçom para Festa de 15 Anos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="job-cat">Categoria</label>
              <select 
                id="job-cat"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ height: '48px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="job-price">Valor Oferecido (R$)</label>
              <input 
                id="job-price"
                type="number" 
                className="form-control" 
                placeholder="Ex: 150"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="job-time">Data e Hora do Início</label>
            <input 
              id="job-time"
              type="datetime-local" 
              className="form-control"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="job-loc">Localização (Bairro e Referência)</label>
            <input 
              id="job-loc"
              type="text" 
              className="form-control" 
              placeholder="Ex: Jardim América, Salão de Festas"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="job-desc">Descrição Detalhada do Serviço</label>
            <textarea 
              id="job-desc"
              className="form-control" 
              rows={4} 
              placeholder="Descreva as tarefas, requisitos (ex: roupa social, levar ferramentas), horário aproximado de término, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Publicar Vaga
          </button>
        </form>
      </Modal>

      {/* MODAL: AVALIAR PROFISSIONAL */}
      <Modal 
        isOpen={isReviewOpen} 
        onClose={() => { setIsReviewOpen(false); setSelectedJobForReview(null); }} 
        title="Avaliar Profissional"
      >
        {selectedJobForReview && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Como foi o serviço de <strong>{selectedJobForReview.selected_freelancer_name}</strong> na vaga <em>"{selectedJobForReview.title}"</em>?
            </p>
          </div>
        )}

        {reviewError && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
            {reviewError}
          </div>
        )}

        <form onSubmit={handleAddReview}>
          {/* Star selector */}
          <div className="form-group" style={{ alignItems: 'center', marginBottom: '24px' }}>
            <label className="form-label">Nota (1 a 5 estrelas)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    size={36} 
                    fill={star <= rating ? 'var(--secondary)' : 'none'} 
                    stroke="var(--secondary)"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rev-comment">Comentário / Crítica Construtiva</label>
            <textarea 
              id="rev-comment"
              className="form-control" 
              rows={3} 
              placeholder="Escreva como foi a pontualidade, qualidade do serviço e profissionalismo..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Enviar Avaliação
          </button>
        </form>
      </Modal>

    </div>
  );
};
