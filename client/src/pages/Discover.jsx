import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import { X, Heart, Filter, RefreshCw, Sparkles, GraduationCap, CheckCircle, UserPlus, Inbox } from 'lucide-react';

const departments = ['All', 'CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CE', 'AE', 'BT', 'MBA', 'MCA', 'AI&ML', 'AI&DS'];
const intentLabels = { friends: 'Friends', study: 'Study', relationship: 'Relationship', all: 'Open' };

function SwipeCard({ profile, onSwipe, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipe('like');
    else if (info.offset.x < -100) onSwipe('pass');
  };

  if (!isTop) {
    return (
      <motion.div style={{
        position: 'absolute', width: '100%', height: '100%',
        borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
        border: '1px solid var(--border)', scale: 0.95, y: 10
      }} />
    );
  }

  return (
    <motion.div
      drag="x" dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, position: 'absolute', width: '100%', height: '100%', cursor: 'grab', zIndex: 10 }}
      whileDrag={{ cursor: 'grabbing' }}
      exit={{ x: 500, opacity: 0, transition: { duration: 0.3 } }}
    >
      <div style={{
        width: '100%', height: '100%', borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-card)', position: 'relative'
      }}>
        <motion.div style={{
          position: 'absolute', top: '24px', left: '24px', zIndex: 20, opacity: likeOpacity,
          padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--text-primary)',
          color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', transform: 'rotate(-10deg)',
          background: 'var(--bg-card)'
        }}>REQUEST</motion.div>
        <motion.div style={{
          position: 'absolute', top: '24px', right: '24px', zIndex: 20, opacity: nopeOpacity,
          padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--text-primary)',
          color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', transform: 'rotate(10deg)',
          background: 'var(--bg-card)'
        }}>SKIP</motion.div>

        <div style={{
          height: '45%', background: 'var(--bg-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          borderBottom: '1px solid var(--border)', overflow: 'hidden'
        }}>
          {profile.profilePhoto ? (
            <img src={profile.profilePhoto} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '4rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {profile.name?.charAt(0)}
            </span>
          )}
        </div>

        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{profile.name}</h2>
            {profile.verificationBadge && <CheckCircle size={14} color="var(--text-secondary)" />}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge"><GraduationCap size={10} style={{ marginRight: '4px' }} />{profile.department}</span>
            <span className="badge">Year {profile.year}</span>
            {profile.intent && <span className="badge">{intentLabels[profile.intent] || profile.intent}</span>}
          </div>
          {profile.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>{profile.bio}</p>}
          {profile.interests?.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
              {profile.interests.slice(0, 5).map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Discover() {
  const { user } = useAuth();
  const [tab, setTab] = useState('discover'); // 'discover' or 'requests'
  const [profiles, setProfiles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swipesLeft, setSwipesLeft] = useState(user?.swipesLeft || 10);
  const [matchAlert, setMatchAlert] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ department: 'All', year: '', intent: '' });

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.department !== 'All') params.department = filters.department;
      if (filters.year) params.year = filters.year;
      if (filters.intent) params.intent = filters.intent;
      const { data } = await API.get('/matches/discover', { params });
      setProfiles(data.profiles);
      setSwipesLeft(data.swipesLeft);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/matches/requests');
      setRequests(data.requests);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'discover') fetchProfiles();
    else fetchRequests();
  }, [tab]);

  const handleSwipe = async (action) => {
    if (profiles.length === 0) return;
    const target = profiles[0];
    try {
      const { data } = await API.post('/matches/swipe', { targetId: target._id, action });
      setSwipesLeft(data.swipesLeft);
      if (data.matched) {
        setMatchAlert({ ...target, type: 'match' });
        setTimeout(() => setMatchAlert(null), 2500);
      } else if (action === 'like') {
        setMatchAlert({ ...target, type: 'request' });
        setTimeout(() => setMatchAlert(null), 2000);
      }
      setProfiles(prev => prev.slice(1));
    } catch (err) { console.error(err); }
  };

  const handleActionRequest = async (id, action) => {
    try {
      await API.put(`/matches/requests/${id}/${action}`);
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading && tab === 'discover' && profiles.length === 0) {
    return <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading...</p></div>;
  }

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      {/* Alerts */}
      <AnimatePresence>
        {matchAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'var(--bg-glass)', backdropFilter: 'blur(8px)'
            }}>
            <div style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              {matchAlert.type === 'match' ? (
                <>
                  <Heart size={48} color="var(--text-primary)" style={{ margin: '0 auto 16px' }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>Mutual Match! 🎉</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You and {matchAlert.name} are now connected. 💖</p>
                </>
              ) : (
                <>
                  <UserPlus size={48} color="var(--text-primary)" style={{ margin: '0 auto 16px' }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>Request Sent</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Friend request sent to {matchAlert.name}.</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.02em' }}>People</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{tab === 'discover' ? `${swipesLeft} swipes left` : `${requests.length} pending requests`}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button onClick={() => setTab('discover')} style={{
            padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 500,
            background: tab === 'discover' ? 'var(--text-primary)' : 'transparent',
            color: tab === 'discover' ? 'var(--bg-primary)' : 'var(--text-secondary)', transition: 'all 0.2s'
          }}>Discover</button>
          <button onClick={() => setTab('requests')} style={{
            padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 500,
            background: tab === 'requests' ? 'var(--text-primary)' : 'transparent',
            color: tab === 'requests' ? 'var(--bg-primary)' : 'var(--text-secondary)', transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Requests {requests.length > 0 && <span style={{ background: 'var(--danger)', color: 'white', fontSize: '0.65rem', padding: '0 6px', borderRadius: '10px' }}>{requests.length}</span>}
            </div>
          </button>
        </div>
      </div>

      {tab === 'discover' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}><Filter size={14} /></button>
            <button className="btn btn-secondary btn-sm" onClick={fetchProfiles}><RefreshCw size={14} /></button>
          </div>
          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                    <select className="input" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} style={{ padding: '8px' }}>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="input" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} style={{ padding: '8px' }}>
                      <option value="">Any Year</option>
                      {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                    <select className="input" value={filters.intent} onChange={e => setFilters(f => ({ ...f, intent: e.target.value }))} style={{ padding: '8px' }}>
                      <option value="">Any Intent</option>
                      <option value="friends">Friends</option>
                      <option value="study">Study</option>
                      <option value="relationship">Relationship</option>
                    </select>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={fetchProfiles} style={{ marginTop: '12px', width: '100%' }}>Apply Filters</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Swipe Deck */}
          {profiles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '340px', height: '480px', margin: '0 auto 24px' }}>
                <AnimatePresence>
                  {profiles.slice(0, 3).map((p, i) => (
                    <SwipeCard key={p._id} profile={p} isTop={i === 0} onSwipe={handleSwipe} />
                  ))}
                </AnimatePresence>
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button onClick={() => handleSwipe('pass')} style={{
                  width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.2s',
                }}>
                  <X size={24} />
                </button>
                <button onClick={() => handleSwipe('like')} style={{
                  width: 56, height: 56, borderRadius: '50%', background: 'var(--text-primary)',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--bg-primary)', transition: 'all 0.2s'
                }}>
                  <UserPlus size={24} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <Sparkles size={32} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>No profiles found 🏜️</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Try adjusting your filters or check back later. ⏳</p>
            </div>
          )}
        </>
      ) : (
        /* Requests Tab */
        <div style={{ display: 'grid', gap: '16px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading requests...</p>
          ) : requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <Inbox size={32} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>No pending requests</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>When people want to connect with you, they'll appear here.</p>
            </div>
          ) : (
            requests.map((r) => (
              <div key={r._id} className="card animate-fadeIn" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-muted)', overflow: 'hidden'
                  }}>
                    {r.user?.profilePhoto ? (
                      <img src={r.user.profilePhoto} alt={r.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      r.user?.name?.charAt(0)
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>{r.user?.name}</h3>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.user?.department} • Yr {r.user?.year}</span>
                    </div>
                  </div>
                </div>
                {r.user?.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.5 }}>{r.user.bio}</p>}
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleActionRequest(r._id, 'accept')}>
                    Accept
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleActionRequest(r._id, 'decline')}>
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
