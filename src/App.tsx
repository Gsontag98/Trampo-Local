import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { FreelancerDashboard } from './pages/FreelancerDashboard';
import { 
  Briefcase, 
  User, 
  Home, 
  LogOut, 
  LogIn, 
  Moon, 
  Sun,
  Wrench 
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('light'); // default light theme (new style)

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('trampolocal_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    } else {
      // By default, set light theme (matching the requested image)
      document.body.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('trampolocal_theme', nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };



  const getPageTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'Início';
      case 'login':
        return 'Entrar / Cadastro';
      case 'profile':
        return 'Meu Perfil';
      case 'dashboard':
        return user?.role === 'company' ? 'Painel do Contratante' : 'Painel do Freelancer';
      default:
        return 'TrampoLocal';
    }
  };

  const renderActivePage = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando dados da sessão...</p>
        </div>
      );
    }

    switch (currentTab) {
      case 'home':
        return <LandingPage onNavigate={setCurrentTab} />;
      case 'login':
        return <Login onLoginSuccess={() => setCurrentTab('dashboard')} />;
      case 'profile':
        return user ? <Profile /> : <Login onLoginSuccess={() => setCurrentTab('dashboard')} />;
      case 'dashboard':
        if (!user) return <Login onLoginSuccess={() => setCurrentTab('dashboard')} />;
        return user.role === 'company' ? <CompanyDashboard /> : <FreelancerDashboard />;
      default:
        return <LandingPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="app-container">
      
      {/* 1. SIDEBAR (Desktop only) */}
      <aside className="sidebar">
        <div>
          {/* Logo */}
          <div className="sidebar-logo" onClick={() => setCurrentTab('home')}>
            <Wrench size={20} style={{ color: 'var(--text-main)', strokeWidth: 2.5 }} />
            <span>Trampo<span style={{ fontWeight: 400 }}>Local</span></span>
          </div>

          {/* Menu Items */}
          <nav className="sidebar-menu">
            <span 
              className={`sidebar-item ${currentTab === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentTab('home')}
            >
              <Home size={18} />
              Início
            </span>

            <span 
              className={`sidebar-item ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentTab(user ? 'dashboard' : 'login')}
            >
              <Briefcase size={18} />
              Painel
            </span>

            <span 
              className={`sidebar-item ${currentTab === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentTab(user ? 'profile' : 'login')}
            >
              <User size={18} />
              Meu Perfil
            </span>

            {!user && (
              <span 
                className={`sidebar-item ${currentTab === 'login' ? 'active' : ''}`}
                onClick={() => setCurrentTab('login')}
              >
                <LogIn size={18} />
                Entrar / Cadastro
              </span>
            )}
          </nav>

          {/* Sidebar Promo (Matching "Upgrade to Pro" card in image) */}
          <div className="sidebar-promo-card">
            <div className="sidebar-promo-title">Vagas em Destaque</div>
            <div className="sidebar-promo-desc">
              Destaque seus anúncios para atrair profissionais locais 3x mais rápido no topo da página.
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', fontSize: '0.78rem', fontWeight: 700 }}>
              Destacar Vaga
            </button>
          </div>
        </div>

        {/* Footer Session (Sidebar base) */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)'
              }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  {user.role === 'company' ? 'Contratante' : 'Profissional'}
                </span>
              </div>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px', borderRadius: '50%', width: '30px', height: '30px' }}
              onClick={() => {
                logout();
                setCurrentTab('home');
              }}
              title="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            TrampoLocal © 2026
          </div>
        )}
      </aside>

      {/* 2. MAIN BODY */}
      <div className="main-content">
        
        {/* Header */}
        <header className="top-header">
          <div className="header-title-section">
            <h1>{getPageTitle()}</h1>
          </div>
          
          <div className="header-right">
            {/* Theme selector */}
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Alternar Tema">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Session Quick Display */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="header-user-badge">
                <span className={`badge ${user.role === 'company' ? 'badge-info' : 'badge-success'}`}>
                  {user.role === 'company' ? 'Empresa' : 'Autônomo'}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="page-body">
          {renderActivePage()}
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-nav">
        <span 
          className={`mobile-nav-item ${currentTab === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentTab('home')}
        >
          <Home size={20} />
          Início
        </span>

        <span 
          className={`mobile-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab(user ? 'dashboard' : 'login')}
        >
          <Briefcase size={20} />
          Painel
        </span>

        <span 
          className={`mobile-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab(user ? 'profile' : 'login')}
        >
          <User size={20} />
          Perfil
        </span>

        {user ? (
          <span 
            className="mobile-nav-item"
            onClick={() => {
              logout();
              setCurrentTab('home');
            }}
          >
            <LogOut size={20} />
            Sair
          </span>
        ) : (
          <span 
            className={`mobile-nav-item ${currentTab === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentTab('login')}
          >
            <LogIn size={20} />
            Entrar
          </span>
        )}
      </nav>

    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
