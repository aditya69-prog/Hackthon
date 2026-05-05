import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import API from '../services/api';
import { Palette, Trash2, Shield, Lock, Check } from 'lucide-react';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, themes, changeTheme } = useTheme();
  const [privacy, setPrivacy] = useState(user?.privacySettings || { showProfile: true, showDepartment: true, showYear: true });
  const [saving, setSaving] = useState(false);

  const savePrivacy = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/users/profile', { privacySettings: privacy });
      updateUser(data.user);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    if (!confirm('FINAL WARNING: All your data, matches, and messages will be permanently deleted.')) return;
    try {
      await API.delete('/users/account');
      logout();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div className="page-header animate-fadeIn">
        <h1>Settings</h1>
        <p>Manage your preferences and appearance</p>
      </div>

      {/* Appearance */}
      <div className="card animate-slideUp" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={18} /> Appearance
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              style={{
                padding: '16px 12px',
                borderRadius: 'var(--radius-md)',
                background: t.color,
                border: `2px solid ${theme === t.id ? 'var(--text-primary)' : 'var(--border)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                color: t.id === 'dark' ? '#fff' : '#171717'
              }}
            >
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: theme === t.id ? (t.id === 'dark' ? '#fff' : '#171717') : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {theme === t.id && <Check size={12} color={t.id === 'dark' ? '#000' : '#fff'} />}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} /> Privacy Controls
        </h3>
        {[
          { key: 'showProfile', label: 'Show Profile', desc: 'Let others discover you' },
          { key: 'showDepartment', label: 'Show Department', desc: 'Display your department on your profile' },
          { key: 'showYear', label: 'Show Year', desc: 'Display your year on your profile' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{label}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</p>
            </div>
            <button onClick={() => setPrivacy(p => ({ ...p, [key]: !p[key] }))} style={{
              width: 44, height: 24, borderRadius: 12, padding: '2px',
              background: privacy[key] ? 'var(--text-primary)' : 'var(--border)',
              display: 'flex', alignItems: 'center', transition: 'all 0.2s',
              justifyContent: privacy[key] ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-primary)', transition: 'all 0.2s' }} />
            </button>
          </div>
        ))}
        <button className="btn btn-primary btn-sm" onClick={savePrivacy} disabled={saving} style={{ marginTop: '20px' }}>
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </button>
      </div>

      {/* Safety */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} /> Safety & Security
        </h3>
        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
          <li>Your USN is encrypted and never shown publicly</li>
          <li>Messages are filtered for inappropriate content</li>
          <li>You can block and report any user</li>
          <li>Admin team reviews all reports within 24 hours</li>
        </ul>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: '1px solid var(--danger)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={18} /> Danger Zone
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Once you delete your account, there is no going back.
        </p>
        <button className="btn btn-danger btn-sm" onClick={deleteAccount}>
          Delete My Account
        </button>
      </div>
    </div>
  );
}
