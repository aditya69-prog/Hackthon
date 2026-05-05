import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import { Save, CheckCircle } from 'lucide-react';

const departments = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CE', 'AE', 'BT', 'MBA', 'MCA', 'AI&ML', 'AI&DS'];
const allInterests = ['Coding', 'Music', 'Sports', 'Gaming', 'Art', 'Dance', 'Photography', 'Travel', 'Reading', 'Cooking', 'Fitness', 'Movies', 'Anime', 'Fashion', 'Nature', 'Volunteering', 'AI', 'Robotics'];
const allSkills = ['React', 'Python', 'Java', 'JavaScript', 'C++', 'Node.js', 'MongoDB', 'SQL', 'Figma', 'UI/UX', 'Machine Learning', 'Data Science', 'Flutter'];

export default function Profile() {
  const { user, updateUser, fetchUser } = useAuth();
  const [form, setForm] = useState({
    name: '', bio: '', department: 'CSE', year: 1, interests: [], skills: [], intent: 'friends', profilePhoto: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeForm = async () => {
      if (!user) {
        try {
          await fetchUser();
        } catch (err) {
          console.error('Failed to fetch user:', err);
        }
      }
      setIsInitializing(false);
    };
    initializeForm();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', bio: user.bio || '', department: user.department || 'CSE',
        year: user.year || 1, interests: user.interests || [], skills: user.skills || [], intent: user.intent || 'friends', profilePhoto: user.profilePhoto || ''
      });
    }
  }, [user]);

  const toggleTag = (field, val) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(v => v !== val) : [...prev[field], val]
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/users/profile', form);
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (isInitializing) {
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="gradient-text" style={{fontSize:'1.5rem',fontWeight:700}}>Loading profile...</div></div>;
  }

  if (!user) {
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column'}}><div className="gradient-text" style={{fontSize:'1.5rem',fontWeight:700}}>Error loading profile</div><p style={{marginTop:'16px',color:'var(--text-secondary)'}}>Please try logging in again</p></div>;
  }

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div className="page-header animate-fadeIn">
        <h1>Profile 👤</h1>
        <p>Manage your public identity ✨</p>
      </div>

      {/* Photo Upload */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px' }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', background: 'var(--bg-secondary)',
          border: '2px dashed var(--border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', overflow: 'hidden', position: 'relative', marginBottom: '16px'
        }}>
          {form.profilePhoto ? (
            <img src={form.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '3rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {form.name?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
          Upload Photo
          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
        </label>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>JPEG or PNG, max 5MB.</p>
      </div>

      {/* Basic Info */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Basic Info 📝</h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Bio</label>
            <textarea className="input" rows={3} maxLength={300} placeholder="A brief description about yourself" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Department</label>
              <select className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Year</label>
              <select className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Intent */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Looking For 🎯</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[{ v: 'friends', l: 'Friends' }, { v: 'study', l: 'Study Partner' }, { v: 'relationship', l: 'Relationship' }, { v: 'all', l: 'Open' }].map(({ v, l }) => (
            <button key={v} onClick={() => setForm(f => ({ ...f, intent: v }))}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 500,
                background: form.intent === v ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: form.intent === v ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: `1px solid ${form.intent === v ? 'var(--text-primary)' : 'var(--border)'}`, transition: 'all 0.2s'
              }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Interests 🌟</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {allInterests.map(tag => (
            <button key={tag} onClick={() => toggleTag('interests', tag)}
              style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 500,
                background: form.interests.includes(tag) ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                color: form.interests.includes(tag) ? 'var(--text-primary)' : 'var(--text-muted)',
                border: `1px solid ${form.interests.includes(tag) ? 'var(--text-primary)' : 'var(--border)'}`, transition: 'all 0.2s'
              }}>{tag}</button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Skills 💻</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {allSkills.map(tag => (
            <button key={tag} onClick={() => toggleTag('skills', tag)}
              style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 500,
                background: form.skills.includes(tag) ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                color: form.skills.includes(tag) ? 'var(--text-primary)' : 'var(--text-muted)',
                border: `1px solid ${form.skills.includes(tag) ? 'var(--text-primary)' : 'var(--border)'}`, transition: 'all 0.2s'
              }}>{tag}</button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}
        style={{ width: '100%', padding: '14px' }}>
        {saved ? <><CheckCircle size={16} /> Saved</> : saving ? 'Saving...' : <><Save size={16} /> Save Profile</>}
      </button>
    </div>
  );
}
