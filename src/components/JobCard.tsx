import React from 'react';
import { Job } from '../services/db';
import { MapPin, Calendar, Star } from 'lucide-react';

interface JobCardProps {
  job: Job;
  userRole?: 'company' | 'freelancer';
  applied?: boolean;
  onApply?: () => void;
  onSelectCandidate?: () => void;
  children?: React.ReactNode;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  userRole,
  applied,
  onApply,
  children
}) => {
  // Format Date and Time
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusBadge = () => {
    switch (job.status) {
      case 'open':
        return <span className="badge badge-success">Aberto</span>;
      case 'closed':
        return <span className="badge badge-warning">Em Andamento</span>;
      case 'completed':
        return <span className="badge badge-info">Finalizado</span>;
      default:
        return null;
    }
  };

  // Border and glow styling for featured jobs
  const cardStyle: React.CSSProperties = job.is_featured ? {
    border: '2px solid var(--secondary)',
    boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)',
    position: 'relative'
  } : {};

  return (
    <div className="glass-card job-card" style={cardStyle}>
      {job.is_featured && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          right: '20px',
          backgroundColor: 'var(--secondary)',
          color: '#000',
          fontWeight: 700,
          fontSize: '0.7rem',
          padding: '2px 8px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <Star size={10} fill="#000" /> Destaque
        </div>
      )}

      <div className="job-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {getStatusBadge()}
          <span className="badge badge-info">{job.category}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Postado por: <strong>{job.company_name}</strong>
          </span>
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
          {job.title}
        </h3>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '16px', whiteSpace: 'pre-line' }}>
          {job.description}
        </p>

        <div className="job-meta-row">
          <div className="job-meta-item">
            <MapPin size={16} style={{ color: 'var(--primary)' }} />
            <span>{job.location}</span>
          </div>
          <div className="job-meta-item">
            <Calendar size={16} style={{ color: 'var(--primary)' }} />
            <span>{formatDateTime(job.schedule)}</span>
          </div>
        </div>
      </div>

      <div className="job-actions">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valor Oferecido</span>
          <span className="job-price">{formatCurrency(job.price)}</span>
        </div>

        {userRole === 'freelancer' && job.status === 'open' && (
          applied ? (
            <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.8, cursor: 'not-allowed' }}>
              Candidatado ✓
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onApply}>
              Candidatar-se
            </button>
          )
        )}
      </div>

      {children && (
        <div style={{ width: '100%', gridColumn: 'span 2' }}>
          {children}
        </div>
      )}
    </div>
  );
};
