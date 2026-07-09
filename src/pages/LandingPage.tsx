import React from 'react';
import { 
  Briefcase, 
  Shield, 
  Zap, 
  Star, 
  User, 
  Sparkles, 
  Wrench, 
  Store, 
  Home 
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onQuickLogin: (userId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onQuickLogin }) => {
  const mockUsers = [
    { id: 'f-1', name: 'Carlos Oliveira', role: 'freelancer', title: 'Garçom Profissional', rating: 4.8 },
    { id: 'f-2', name: 'Ana Souza', role: 'freelancer', title: 'Diarista Res./Comercial', rating: 5.0 },
    { id: 'f-3', name: 'Marcos Santos', role: 'freelancer', title: 'Eletricista/Encanador', rating: 4.6 },
    { id: 'c-1', name: 'Buffet Delícias', role: 'company', title: 'Organizador de Festas', rating: 4.5 },
    { id: 'c-2', name: 'Família Silva', role: 'company', title: 'Particular/Residencial', rating: 5.0 }
  ];

  const getAvatarIcon = (userId: string) => {
    switch (userId) {
      case 'f-1': return <User size={24} />;
      case 'f-2': return <Sparkles size={24} />;
      case 'f-3': return <Wrench size={24} />;
      case 'c-1': return <Store size={24} />;
      case 'c-2': return <Home size={24} />;
      default: return <User size={24} />;
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section className="hero">
        <h1>
          Conecte-se a Profissionais e Vagas de Formas <span className="gradient-text">Rápida e Local</span>
        </h1>
        <p>
          O **TrampoLocal** conecta garçons, diaristas, eletricistas e muito mais a contratantes e empresas na sua própria cidade. Sem taxas, sem burocracia e com contato direto via WhatsApp.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-primary" onClick={() => onNavigate('login')}>
            Criar Minha Conta
          </button>
          <a href="#quick-demo" className="btn btn-secondary">
            Simular Acesso Rápido
          </a>
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

      {/* Quick Demo Section */}
      <section id="quick-demo" style={{ paddingTop: '40px' }}>
        <h2 className="section-title">Área de Demonstração Interativa</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '600px', margin: '-20px auto 30px auto' }}>
          Para fins de testes rápidos, selecione um dos perfis pré-configurados abaixo para entrar instantaneamente e simular as ações do sistema:
        </p>

        <div className="grid-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {mockUsers.map(u => (
            <div 
              key={u.id} 
              className="glass-card glow-hover" 
              style={{ 
                cursor: 'pointer', 
                border: u.role === 'company' ? '1px solid rgba(99,102,241,0.2)' : '1px solid var(--border-color)',
                textAlign: 'center',
                padding: '20px'
              }}
              onClick={() => onQuickLogin(u.id)}
            >
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: 'var(--text-main)'
              }}>
                {getAvatarIcon(u.id)}
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{u.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                {u.title}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className={`badge ${u.role === 'company' ? 'badge-info' : 'badge-success'}`}>
                  {u.role === 'company' ? 'Empresa' : 'Autônomo'}
                </span>
                <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--secondary)' }}>
                  <Star size={12} fill="var(--secondary)" /> {u.rating.toFixed(1)}
                </span>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Entrar como este perfil
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
