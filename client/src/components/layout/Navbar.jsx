import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Compass, Heart, User, Settings, Shield, LogOut, MessageCircle } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: '/matches', icon: MessageCircle, label: 'Chats' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <nav className="glass" style={{
        position: 'sticky', top: 0, zIndex: 100, height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 600, color: 'var(--bg-primary)', overflow: 'hidden'
          }}>
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.charAt(0) || 'R'
            )}
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
            RNS Connect
          </span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.2s',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
            })}>
              <Icon size={16} />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
          {user?.isAdmin && (
            <NavLink to="/admin" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.85rem', fontWeight: 500,
              color: isActive ? 'var(--danger)' : 'var(--text-muted)'
            })}>
              <Shield size={16} /><span className="nav-label">Admin</span>
            </NavLink>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/settings')} style={{
            color: 'var(--text-muted)', transition: 'color 0.2s'
          }} className="hover:text-primary">
            <Settings size={18} />
          </button>
          <button onClick={handleLogout} style={{
            color: 'var(--text-muted)', transition: 'color 0.2s'
          }}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="glass mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        display: 'none', height: '64px', padding: '0 8px',
        alignItems: 'center', justifyContent: 'space-around',
        borderTop: '1px solid var(--border)', borderBottom: 'none'
      }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '4px', fontSize: '0.65rem', fontWeight: 500,
            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
          })}>
            <Icon size={20} />{label}
          </NavLink>
        ))}
      </div>

      <style>{`
        .hover\\:text-primary:hover { color: var(--text-primary) !important; }
        @media (max-width: 768px) {
          .desktop-nav .nav-label { display: none; }
          .mobile-nav { display: flex !important; }
          #root { padding-bottom: 72px; }
        }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
