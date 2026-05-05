import { useState, useEffect } from 'react';
import API from '../services/api';
import { Shield, Users, AlertTriangle, TrendingUp, CheckCircle, X } from 'lucide-react';

export default function Admin() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === 'stats') fetchStats();
    else if (tab === 'users') fetchUsers();
    else if (tab === 'reports') fetchReports();
  }, [tab]);

  const fetchStats = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/stats'); setStats(data.stats); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchUsers = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/users', { params: { search } }); setUsers(data.users); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchReports = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/reports'); setReports(data.reports); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const toggleBan = async (id) => {
    try {
      await API.put(`/admin/users/${id}/ban`);
      fetchUsers();
    } catch (e) { console.error(e); }
  };
  const verifyUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/verify`);
      fetchUsers();
    } catch (e) { console.error(e); }
  };
  const resolveReport = async (id, status) => {
    try {
      await API.put(`/admin/reports/${id}`, { status });
      fetchReports();
    } catch (e) { console.error(e); }
  };

  const tabs = [
    { key: 'stats', icon: TrendingUp, label: 'Dashboard' },
    { key: 'users', icon: Users, label: 'Users' },
    { key: 'reports', icon: AlertTriangle, label: 'Reports' },
  ];

  return (
    <div className="page-container">
      <div className="page-header animate-fadeIn">
        <h1>Admin Panel</h1>
        <p>System overview and moderation</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {tabs.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 500,
            background: tab === key ? 'var(--text-primary)' : 'transparent',
            color: tab === key ? 'var(--bg-primary)' : 'var(--text-secondary)', transition: 'all 0.2s'
          }}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading data...</p>
      ) : (
        <>
          {tab === 'stats' && stats && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Users', value: stats.totalUsers },
                  { label: 'Verified', value: stats.verifiedUsers },
                  { label: 'Matches', value: stats.totalMatches },
                  { label: 'Messages', value: stats.totalMessages },
                  { label: 'Reports', value: stats.pendingReports },
                  { label: 'Banned', value: stats.bannedUsers },
                ].map(({ label, value }, i) => (
                  <div key={i} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '4px' }}>{value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input className="input" placeholder="Search users by name or email" value={search}
                  onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: '400px' }} />
                <button className="btn btn-primary" onClick={fetchUsers}>Search</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {u.name} {u.isVerified && <CheckCircle size={12} color="var(--text-secondary)" />}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>{u.email} • {u.department}</div>
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <span className="badge" style={{ color: u.isBanned ? 'var(--danger)' : 'var(--text-secondary)', borderColor: u.isBanned ? 'var(--danger)' : 'var(--border)' }}>
                            {u.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {!u.isVerified && <button className="btn btn-secondary btn-sm" onClick={() => verifyUser(u._id)}>Verify</button>}
                            <button className="btn btn-secondary btn-sm" onClick={() => toggleBan(u._id)} style={{ color: u.isBanned ? 'var(--text-primary)' : 'var(--danger)' }}>
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div>
              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Shield size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Queue is clear</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {reports.map(r => (
                    <div key={r._id} className="card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <p style={{ fontWeight: 500 }}>{r.reportedUser?.name} reported by {r.reporter?.name}</p>
                          <span className="badge" style={{ marginTop: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>{r.reason}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>"{r.description}"</p>}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => resolveReport(r._id, 'resolved')}>Resolve & Strike</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => resolveReport(r._id, 'dismissed')}>Dismiss</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
