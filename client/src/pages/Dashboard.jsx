import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Compass, Heart, User, Settings, Star, Zap } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { icon: Compass, label: 'Discover', desc: 'Find new connections', to: '/discover' },
    { icon: Heart, label: 'Matches', desc: 'View your matches', to: '/matches' },
    { icon: User, label: 'Profile', desc: 'Edit your profile', to: '/profile' },
    { icon: Settings, label: 'Settings', desc: 'Preferences', to: '/settings' },
  ];

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="animate-fadeIn" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '4px', letterSpacing: '-0.02em' }}>
          Hey, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Welcome to your minimalist campus hub. ✨
        </p>
      </div>

      {/* Status Card */}
      <div className="card animate-slideUp" style={{ marginBottom: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {user?.verificationBadge && <span className="badge">Verified</span>}
              {!user?.isVerified && <span className="badge" style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}>Pending Verification</span>}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {user?.department} • Year {user?.year} • {user?.swipesLeft || 0} swipes left today
            </p>
          </div>
          {!user?.profileCompleted && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile')}>
              Complete Profile
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Quick Actions ⚡</h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        {quickActions.map(({ icon: Icon, label, desc, to }, i) => (
          <div key={i} className="card animate-fadeIn" onClick={() => navigate(to)}
            style={{ cursor: 'pointer', opacity: 0, animationDelay: `${i * 0.08}s`, padding: '20px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
              border: '1px solid var(--border)'
            }}>
              <Icon size={18} color="var(--text-primary)" />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>{label}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={16} /> Guidelines 📌
        </h3>
        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
          <li>Complete your profile with interests to improve match quality</li>
          <li>Write a genuine bio to spark better conversations</li>
          <li>Be respectful in chats — we maintain a safe community</li>
        </ul>
      </div>
    </div>
  );
}
