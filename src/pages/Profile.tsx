import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService, Review } from '../services/db';
import { Star, Save, Clock } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills.join(', ') || '');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setBio(user.bio);
      setSkills(user.skills.join(', '));
      
      // Load user reviews
      const fetchReviews = async () => {
        try {
          const revs = await dbService.getReviews(user.id);
          setReviews(revs);
        } catch (err) {
          console.error('Error fetching reviews:', err);
        }
      };
      fetchReviews();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccess(false);
    try {
      const skillsArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
        
      await updateProfile({
        name,
        phone: phone.replace(/\D/g, ''),
        bio,
        skills: skillsArray
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '32px' }}>Meu Perfil</h1>

      <div className="dashboard-grid">
        {/* Left Side: Edit Profile */}
        <div>
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Editar Informações</h2>
            
            {success && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500 }}>
                Perfil atualizado com sucesso!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-name">Nome / Razão Social</label>
                <input 
                  id="prof-name"
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-phone">WhatsApp (apenas números)</label>
                <input 
                  id="prof-phone"
                  type="tel" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-bio">Sobre Mim / Descrição da Empresa</label>
                <textarea 
                  id="prof-bio"
                  className="form-control" 
                  rows={4} 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {user.role === 'freelancer' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-skills">Habilidades (separadas por vírgula)</label>
                  <input 
                    id="prof-skills"
                    type="text" 
                    className="form-control" 
                    value={skills} 
                    onChange={(e) => setSkills(e.target.value)} 
                    placeholder="Ex: Garçom, Buffet, Organização"
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                <Save size={18} />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Reputação / Avaliações */}
        <div>
          <div className="glass-card" style={{ height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Minha Reputação</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{
                background: 'var(--primary-glow)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 700,
                color: 'var(--primary)'
              }}>
                {user.rating_avg.toFixed(1)}
              </div>
              <div>
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i < Math.round(user.rating_avg) ? 'var(--secondary)' : 'none'} 
                      stroke="var(--secondary)"
                    />
                  ))}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Baseado em {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Avaliações Recentes</h3>
            
            <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                  Nenhuma avaliação recebida ainda.
                </p>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="review-card">
                    <div className="review-header">
                      <span className="review-author">{rev.reviewer_name}</span>
                      <div className="rating-stars" style={{ gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < rev.rating ? 'var(--secondary)' : 'none'} 
                            stroke="var(--secondary)"
                          />
                        ))}
                      </div>
                    </div>
                    {rev.job_title && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '6px', fontWeight: 500 }}>
                        {rev.job_title}
                      </div>
                    )}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <Clock size={10} style={{ marginRight: '4px', alignSelf: 'center' }} />
                      {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
