import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Hash } from 'lucide-react';
import API from '../services/api';

const departments = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CE', 'AE', 'BT', 'MBA', 'MCA', 'AI&ML', 'AI&DS'];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', usn: '', password: '', department: 'CSE', year: 1 });
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^1RN\d{2}[A-Z]{2,4}\d{3}$/i.test(form.usn)) {
      return setError('Invalid USN format (e.g., 1RN22CS001)');
    }
    setLoading(true);
    try {
      const data = await signup(form);
      setSentOtp(data.otp);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { email: form.email, otp });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card animate-slideUp" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)', margin: '0 auto 16px',
            background: 'var(--text-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 600, color: 'var(--bg-primary)'
          }}>R</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            {step === 1 ? 'Create account' : 'Verify email'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {step === 1 ? 'Join the RNSIT community' : `Enter the OTP sent to ${form.email}`}
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '20px', border: '1px solid var(--danger)' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required style={{ paddingLeft: '38px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type="email" placeholder="email@rnsit.ac.in" value={form.email} onChange={e => set('email', e.target.value)} required style={{ paddingLeft: '38px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>USN</label>
              <div style={{ position: 'relative' }}>
                <Hash size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="1RN22CS001" value={form.usn} onChange={e => set('usn', e.target.value.toUpperCase())} required style={{ paddingLeft: '38px', textTransform: 'uppercase' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>Department</label>
                <select className="input" value={form.department} onChange={e => set('department', e.target.value)}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>Year</label>
                <select className="input" value={form.year} onChange={e => set('year', parseInt(e.target.value))}>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} style={{ paddingLeft: '38px', paddingRight: '38px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            {sentOtp && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.8rem', marginBottom: '20px', border: '1px solid var(--border)' }}>
                Demo OTP: <strong>{sentOtp}</strong>
              </div>
            )}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>6-digit OTP</label>
              <input className="input" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px', fontWeight: 600 }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
