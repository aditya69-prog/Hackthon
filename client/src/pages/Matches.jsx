import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { MessageCircle, CheckCircle } from 'lucide-react';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get('/matches');
        setMatches(data.matches);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <div className="page-header animate-fadeIn">
        <h1>Chats 💬</h1>
        <p>{matches.length} conversation{matches.length !== 1 ? 's' : ''} ✨</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>
      ) : matches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <MessageCircle size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>No chats yet 🥺</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Start making connections to chat.</p>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/discover')}>Discover</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {matches.map((match, i) => (
            <div key={match._id} className="card animate-fadeIn" onClick={() => navigate(`/chat/${match._id}`)} 
              style={{ opacity: 0, animationDelay: `${i * 0.05}s`, padding: '16px', cursor: 'pointer', transition: 'background 0.2s' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-muted)', overflow: 'hidden'
                }}>
                  {match.user?.profilePhoto ? (
                    <img src={match.user.profilePhoto} alt={match.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    match.user?.name?.charAt(0)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{match.user?.name}</h3>
                      {match.user?.verificationBadge && <CheckCircle size={14} color="var(--text-secondary)" />}
                      {match.status === 'pending' && <span style={{ fontSize: '0.65rem', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '10px' }}>Pending</span>}
                    </div>
                    {match.lastMessage && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(match.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  
                  {match.lastMessage ? (
                    <p style={{ 
                      fontSize: '0.85rem', color: match.lastMessage.sender !== match.user._id && match.status === 'pending' ? 'var(--text-muted)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {match.lastMessage.sender !== match.user._id ? 'You: ' : ''}{match.lastMessage.content}
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {match.status === 'pending' ? 'Send an intro message!' : 'Tap to chat'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
