import React from 'react';
import { 
  Briefcase, 
  Shield, 
  Zap 
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section className="hero">
        <h1>
          Conecte-se a Profissionais e Vagas de Forma <span className="gradient-text">Rápida e Local</span>
        </h1>
        <p>
          O **TrampoLocal** conecta garçons, diaristas, eletricistas e muito mais a contratantes e empresas na sua própria cidade. Sem taxas, sem burocracia e com contato direto via WhatsApp.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-primary" onClick={() => onNavigate('login')}>
            Criar Minha Conta
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-section">
        <h2 className="section-title">Por que usar o TrampoLocal?</h2>
        <div className="grid-3">
          <div className="glass-card glow-hover" style={{ textAlign: 'center' }}>
            <div style={{
              background: 'var(--primary-glow)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: 'var(--primary)'
            }}>
              <Zap size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Agilidade Máxima</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Publique uma vaga de freelancer em menos de 1 minuto. Profissionais locais recebem e aplicam na mesma hora.
            </p>
          </div>

          <div className="glass-card glow-hover" style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: 'var(--secondary)'
            }}>
              <Shield size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Segurança & Reputação</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Avalie e seja avaliado a cada serviço. Veja o histórico e as avaliações dos profissionais antes de aprovar a vaga.
            </p>
          </div>

          <div className="glass-card glow-hover" style={{ textAlign: 'center' }}>
            <div style={{
              background: 'var(--success-glow)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: 'var(--success)'
            }}>
              <Briefcase size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Zero Taxas sobre Serviço</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              O pagamento é feito diretamente da empresa para o trabalhador. A plataforma é 100% gratuita para conexões normais.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ margin: '60px 0' }}>
        <div className="stats-grid">
          <div className="dark-accent-card stat-card">
            <div className="stat-number">120+</div>
            <div className="stat-label">Profissionais Ativos</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-number">340+</div>
            <div className="stat-label">Serviços Conectados</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-number">4.9/5</div>
            <div className="stat-label">Média de Avaliações</div>
          </div>
        </div>
      </section>
    </div>
  );
};
