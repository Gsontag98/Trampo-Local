import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, User } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Signin fields
  const [selectedPresetId, setSelectedPresetId] = useState('f-1');
  const [error, setError] = useState('');

  // Signup fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'freelancer' | 'company'>('freelancer');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [city, setCity] = useState('Campo Mourão - PR');

  const presetAccounts = [
    { id: 'f-1', label: 'Carlos Oliveira (Garçom)' },
    { id: 'f-2', label: 'Ana Souza (Diarista)' },
    { id: 'f-3', label: 'Marcos Santos (Eletricista)' },
    { id: 'c-1', label: 'Buffet Delícias (Empresa)' },
    { id: 'c-2', label: 'Família Silva (Contratante Particular)' }
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(selectedPresetId);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) return setError('Nome é obrigatório.');
    if (!phone.trim()) return setError('WhatsApp é obrigatório.');
    
    try {
      const skillsArray = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
        
      await register(name, phone, role, bio, skillsArray, city);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    }
  };

  const addPresetSkill = (skill: string) => {
    if (skillsInput.includes(skill)) return;
    setSkillsInput(prev => prev ? `${prev}, ${skill}` : skill);
  };

  const recommendedSkills = ['Garçom', 'Diarista', 'Passadeira', 'Eletricista', 'Encanador', 'Montador', 'Babá', 'Pintor'];

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '40px 24px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '36px' }}>
        
        {/* Toggle tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '30px' }}>
          <button 
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'signin' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'signin' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => { setActiveTab('signin'); setError(''); }}
          >
            Entrar
          </button>
          <button 
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'signup' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'signup' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => { setActiveTab('signup'); setError(''); }}
          >
            Cadastrar-se
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label className="form-label">Selecione uma conta de simulação</label>
              <select 
                className="form-control"
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                style={{ height: '48px' }}
              >
                {presetAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.label}</option>
                ))}
              </select>
            </div>
            
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', lineHeight: 1.4 }}>
              💡 <strong>Nota de Arquitetura:</strong> Em produção, o login será autenticado via Supabase OTP (código via WhatsApp ou SMS) garantindo segurança. Para testes rápidos, este protótipo permite login instantâneo.
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Entrar no Painel
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            {/* Role Selection */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Tipo de Cadastro</label>
              <div className="role-selection-container">
                <button
                  type="button"
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: role === 'freelancer' ? 'var(--primary-glow)' : 'transparent',
                    border: role === 'freelancer' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    color: role === 'freelancer' ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => setRole('freelancer')}
                >
                  <User size={20} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sou Profissional</span>
                </button>
                
                <button
                  type="button"
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: role === 'company' ? 'var(--primary-glow)' : 'transparent',
                    border: role === 'company' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    color: role === 'company' ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => setRole('company')}
                >
                  <Building2 size={20} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sou Contratante</span>
                </button>
              </div>
            </div>

            {/* General Fields */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Nome Completo / Nome Fantasia</label>
              <input 
                id="reg-name"
                className="form-control" 
                type="text" 
                placeholder="Ex: Carlos Silva ou Buffet Estrela" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">WhatsApp para Contato</label>
              <input 
                id="reg-phone"
                className="form-control" 
                type="tel" 
                placeholder="Ex: 5511999999999 (com DDI + DDD)" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Utilize apenas números incluindo DDI e DDD (ex: 55 para Brasil).</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-city">Cidade de Lançamento</label>
              <select
                id="reg-city"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ height: '48px' }}
                disabled
              >
                <option value="Campo Mourão - PR">Campo Mourão - PR</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No momento, a plataforma está operando em fase piloto exclusivamente para Campo Mourão.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-bio">Apresentação / Descrição</label>
              <textarea 
                id="reg-bio"
                className="form-control" 
                rows={3}
                placeholder="Escreva brevemente sobre seus serviços ou sua empresa..." 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Freelancer specific fields */}
            {role === 'freelancer' && (
              <div className="form-group">
                <label className="form-label" htmlFor="reg-skills">Habilidades / Categorias (separadas por vírgula)</label>
                <input 
                  id="reg-skills"
                  className="form-control" 
                  type="text" 
                  placeholder="Ex: Garçom, Barista, Eventos" 
                  value={skillsInput} 
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
                
                {/* Recommended tags chips */}
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Sugestões rápidas (clique para adicionar):</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {recommendedSkills.map(s => (
                      <span 
                        key={s} 
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-color)',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)'
                        }}
                        onClick={() => addPresetSkill(s)}
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Finalizar Cadastro
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
