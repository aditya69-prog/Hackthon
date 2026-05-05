import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import { Send, ArrowLeft, Flag, Shield } from 'lucide-react';

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [matchRes, msgRes] = await Promise.all([
          API.get('/matches'),
          API.get(`/chat/${matchId}`)
        ]);
        const thisMatch = matchRes.data.matches.find(m => m._id === matchId);
        if (thisMatch) {
          setOtherUser(thisMatch.user);
          setMatchData(thisMatch);
        }
        setMessages(msgRes.data.messages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();

    if (socket) {
      socket.emit('join_room', matchId);
      socket.on('receive_message', (data) => setMessages(prev => [...prev, data.message]));
      socket.on('user_typing', (data) => { if (data.userId !== user._id) setTyping(data.isTyping); });
    }

    return () => {
      if (socket) {
        socket.emit('leave_room', matchId);
        socket.off('receive_message');
        socket.off('user_typing');
      }
    };
  }, [matchId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');

    if (socket) {
      socket.emit('send_message', { matchId, senderId: user._id, content });
      socket.emit('typing', { matchId, userId: user._id, isTyping: false });
    } else {
      try {
        const { data } = await API.post(`/chat/${matchId}`, { content });
        setMessages(prev => [...prev, data.message]);
      } catch (err) { console.error(err); }
    }
  };

  const handleTyping = (val) => {
    setInput(val);
    if (socket) {
      socket.emit('typing', { matchId, userId: user._id, isTyping: true });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('typing', { matchId, userId: user._id, isTyping: false });
      }, 1500);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', maxWidth: '700px', margin: '0 auto', background: 'var(--bg-primary)' }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10
      }}>
        <button onClick={() => navigate('/matches')} style={{ background: 'none', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', overflow: 'hidden'
        }}>
          {otherUser?.profilePhoto ? (
            <img src={otherUser.profilePhoto} alt={otherUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            otherUser?.name?.charAt(0)
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{otherUser?.name || 'Chat'} {matchData?.status === 'pending' && <span style={{ fontSize: '0.7rem', color: 'var(--warning)', background: 'rgba(217, 119, 6, 0.1)', padding: '2px 6px', borderRadius: '10px', marginLeft: '6px' }}>Pending</span>}</h3>
          <p style={{ fontSize: '0.75rem', color: typing ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {typing ? 'typing...' : otherUser?.department ? `${otherUser.department} • Year ${otherUser.year}` : ''}
          </p>
        </div>
        <button onClick={() => { if(confirm('Report this user?')) API.post(`/users/report/${otherUser?._id}`, { reason: 'harassment' }); }}
          style={{ background: 'none', color: 'var(--text-muted)' }}>
          <Flag size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Shield size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem' }}>Say hello 👋 Keep it respectful. 🛡️</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.sender?._id === user._id || msg.sender === user._id;
            return (
              <div key={msg._id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '10px 16px', borderRadius: 'var(--radius-lg)',
                  borderBottomRightRadius: isMine ? '4px' : 'var(--radius-lg)',
                  borderBottomLeftRadius: isMine ? 'var(--radius-lg)' : '4px',
                  background: isMine ? 'var(--text-primary)' : 'var(--bg-card)',
                  color: isMine ? 'var(--bg-primary)' : 'var(--text-primary)',
                  border: isMine ? 'none' : '1px solid var(--border)',
                  fontSize: '0.9rem', lineHeight: 1.5
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        {typing && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      {matchData?.status === 'pending' && matchData?.initiator !== user._id ? (
        <div style={{ padding: '20px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Accept their request to reply.</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/discover')} style={{ width: '100%', maxWidth: '200px' }}>Go to Requests</button>
        </div>
      ) : matchData?.status === 'pending' && messages.length >= 1 ? (
        <div style={{ padding: '20px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You've sent your intro message. Wait for them to accept! ⏳</p>
        </div>
      ) : (
        <form onSubmit={handleSend} style={{
          padding: '16px 24px', display: 'flex', gap: '12px',
          borderTop: '1px solid var(--border)', background: 'var(--bg-primary)'
        }}>
          <input className="input" placeholder="Message..." value={input}
            onChange={e => handleTyping(e.target.value)} style={{ flex: 1, background: 'var(--bg-card)' }} />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>
            <Send size={16} />
          </button>
        </form>
      )}
    </div>
  );
}
