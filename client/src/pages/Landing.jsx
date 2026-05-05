import { useNavigate } from 'react-router-dom';
import { Shield, Users, Compass, MessageCircle } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Verified Only 🛡️', desc: 'USN-verified RNSIT accounts. No fake profiles.' },
  { icon: Compass, title: 'Discover 🔍', desc: 'Find students based on interests and skills.' },
  { icon: MessageCircle, title: 'Connect 💬', desc: 'Match and chat safely within the platform.' },
  { icon: Users, title: 'Community 🤝', desc: 'Find friends, study partners, or more.' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-sm)',
            background: 'var(--text-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 600, color: 'var(--bg-primary)'
          }}>R</div>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
            RNS Connect
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>Log In</button>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div className="animate-fadeIn" style={{ marginBottom: '24px' }}>
          <span className="badge" style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--border)' }}>
            Exclusively for RNSIT Students
          </span>
        </div>
        <h1 className="animate-slideUp" style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 600,
          lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em'
        }}>
          Find your people. ✨
        </h1>
        <p className="animate-slideUp" style={{
          fontSize: '1.1rem', color: 'var(--text-secondary)',
          maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.6
        }}>
          A minimal, safe, and verified platform to discover friends, project teammates, and meaningful connections on campus.
        </p>
        <div className="animate-slideUp" style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
            Join Now 🚀
          </button>
        </div>
      </main>

      {/* Features */}
      <section style={{
        maxWidth: '1000px', margin: '0 auto', padding: '0 24px 80px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px'
      }} className="stagger">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <div key={i} className="animate-fadeIn" style={{ opacity: 0, animationDelay: `${i * 0.1}s` }}>
            <Icon size={24} style={{ marginBottom: '16px', color: 'var(--text-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px', borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center'
      }}>
        <p>© 2024 RNS Connect. Minimal & verified.</p>
      </footer>
    </div>
  );
}
