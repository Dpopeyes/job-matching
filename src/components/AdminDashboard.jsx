import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, MessageSquare,
  Trash2, Building, MapPin, DollarSign, Briefcase, RefreshCw, X,
  Send, User, Eye, ChevronDown, ChevronUp, Users, FileText, Search,
  Star, GraduationCap, Mail, Phone, Globe, ExternalLink
} from 'lucide-react';
import {
  fetchJobs, updateJobApprovalStatus, deleteJob,
  fetchAdminApplications, fetchMessages, sendMessage
} from '../data/api';

/* ─── small helpers ─── */
const API_BASE = 'http://localhost:3001/api';

async function fetchAllUsers() {
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function fetchUserById(userId) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

const TABS = [
  { key: 'overview',  label: 'ภาพรวม',          icon: ShieldCheck,    color: '#7c3aed' },
  { key: 'pending',   label: 'รอการอนุมัติ',     icon: Clock,          color: '#2563eb' },
  { key: 'approved',  label: 'อนุมัติแล้ว',      icon: CheckCircle2,   color: '#059669' },
  { key: 'rejected',  label: 'ปฏิเสธแล้ว',       icon: AlertTriangle,  color: '#dc2626' },
  { key: 'chats',     label: 'ห้องสนทนา',         icon: MessageSquare,  color: '#0d9488' },
  { key: 'users',     label: 'ผู้ใช้ทั้งหมด',    icon: Users,          color: '#db2777' },
];

export default function AdminDashboard({ currentUser, onNavigateProfile }) {
  const [jobs, setJobs]               = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers]             = useState([]);
  const [activeTab, setActiveTab]     = useState('overview');
  const [loading, setLoading]         = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [userSearch, setUserSearch]   = useState('');

  // Chat
  const [activeChatApp, setActiveChatApp]   = useState(null);
  const [chatMessages, setChatMessages]     = useState([]);
  const [newMsg, setNewMsg]                 = useState('');
  const [isSending, setIsSending]           = useState(false);
  const messagesEndRef                      = useRef(null);

  // Profile modal
  const [viewingUser, setViewingUser]       = useState(null);
  const [viewingUserDetail, setViewingUserDetail] = useState(null);

  /* ── Load Data ── */
  const loadAll = async () => {
    setLoading(true);
    const [j, a, u] = await Promise.all([
      fetchJobs({ adminView: true }),
      fetchAdminApplications(),
      fetchAllUsers(),
    ]);
    if (j) setJobs(j);
    if (a) setApplications(a);
    if (u) setUsers(u);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  /* ── Chat polling ── */
  useEffect(() => {
    if (!activeChatApp) return;
    const load = async () => {
      const msgs = await fetchMessages(activeChatApp.id);
      if (msgs) setChatMessages(msgs);
    };
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [activeChatApp]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  /* ── Profile detail load ── */
  useEffect(() => {
    if (!viewingUser) { setViewingUserDetail(null); return; }
    fetchUserById(viewingUser.id).then(d => setViewingUserDetail(d));
  }, [viewingUser]);

  const handleRefresh = async () => { setRefreshing(true); await loadAll(); setRefreshing(false); };

  const handleApproval = async (jobId, status) => {
    const res = await updateJobApprovalStatus(jobId, status);
    if (res?.success) setJobs(prev => prev.map(j => j.id === jobId ? { ...j, approvalStatus: status } : j));
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('ลบประกาศงานนี้ถาวรหรือไม่?')) return;
    const res = await deleteJob(jobId);
    if (res?.success) setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChatApp) return;
    setIsSending(true);
    const content = newMsg.trim();
    setNewMsg('');
    const res = await sendMessage(
      activeChatApp.id,
      currentUser.id,
      `🛡️ แอดมิน (${currentUser.name})`,
      content
    );
    if (res?.success) {
      setChatMessages(prev => [...prev, {
        id: `m-${Date.now()}`, applicationId: activeChatApp.id,
        senderId: currentUser.id,
        senderName: `🛡️ แอดมิน (${currentUser.name})`,
        content, timestamp: new Date().toISOString()
      }]);
    }
    setIsSending(false);
  };

  /* ── Derived values ── */
  const pending  = jobs.filter(j => j.approvalStatus === 'pending');
  const approved = jobs.filter(j => j.approvalStatus === 'approved');
  const rejected = jobs.filter(j => j.approvalStatus === 'rejected');
  const filteredJobs = activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : rejected;
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ══ Header Banner ══ */}
      <div style={{
        borderRadius: '20px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: '28px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        boxShadow: '0 8px 32px rgba(124,58,237,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
            <ShieldCheck style={{ width: '30px', height: '30px', color: '#a5b4fc' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
              แผงควบคุมผู้ดูแลระบบ
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#c4b5fd' }}>
              🛡️ ยินดีต้อนรับ {currentUser.name} — ระบบจัดการงาน, ผู้ใช้ และการสนทนา
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <RefreshCw className={refreshing ? 'animate-spin' : ''} style={{ width: '15px', height: '15px' }} />
          รีเฟรชข้อมูล
        </button>
      </div>

      {/* ══ Tab Bar ══ */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', background: '#f8fafc', borderRadius: '16px', padding: '6px' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          const count = tab.key === 'pending' ? pending.length : tab.key === 'approved' ? approved.length : tab.key === 'rejected' ? rejected.length : tab.key === 'chats' ? applications.length : tab.key === 'users' ? users.length : null;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setActiveChatApp(null); }}
              style={{
                padding: '10px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: active ? tab.color : 'transparent',
                color: active ? '#ffffff' : '#64748b',
                fontWeight: '700', fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', gap: '7px',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
                boxShadow: active ? `0 4px 12px ${tab.color}40` : 'none'
              }}
            >
              <Icon style={{ width: '15px', height: '15px' }} />
              {tab.label}
              {count !== null && (
                <span style={{ background: active ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: active ? '#fff' : '#475569', borderRadius: '999px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: '800' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══ Loading ══ */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
          <RefreshCw className="animate-spin" style={{ width: '36px', height: '36px', margin: '0 auto 16px', color: '#7c3aed' }} />
          <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>กำลังโหลดข้อมูล...</p>
        </div>
      ) : activeTab === 'overview' ? (
        /* ══════════════════ OVERVIEW ══════════════════ */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'โพสต์ทั้งหมด', value: jobs.length, color: '#2563eb', bg: '#eff6ff', icon: Briefcase },
            { label: 'รอการอนุมัติ', value: pending.length, color: '#d97706', bg: '#fffbeb', icon: Clock },
            { label: 'อนุมัติแล้ว', value: approved.length, color: '#059669', bg: '#ecfdf5', icon: CheckCircle2 },
            { label: 'ปฏิเสธแล้ว', value: rejected.length, color: '#dc2626', bg: '#fef2f2', icon: AlertTriangle },
            { label: 'ห้องสนทนา', value: applications.length, color: '#0d9488', bg: '#f0fdfa', icon: MessageSquare },
            { label: 'ผู้ใช้งาน', value: users.length, color: '#7c3aed', bg: '#f5f3ff', icon: Users },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} style={{ background: card.bg, border: `1px solid ${card.color}30`, borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: card.color, lineHeight: 1 }}>{card.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '3px' }}>{card.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeTab === 'chats' ? (
        /* ══════════════════ CHATS ══════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {applications.length === 0 ? (
            <div className="clean-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <MessageSquare style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>ยังไม่มีห้องสนทนา</h3>
            </div>
          ) : applications.map(app => (
            <div key={app.id} className="clean-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', borderLeft: '4px solid #0d9488' }}>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {app.applicantName}
                  </h4>
                  <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{app.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase style={{ width: '13px', height: '13px', color: '#7c3aed' }} />{app.jobTitle}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building style={{ width: '13px', height: '13px' }} />{app.company}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveChatApp(app)}
                style={{ padding: '9px 18px', borderRadius: '10px', background: '#0d9488', border: 'none', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MessageSquare style={{ width: '14px', height: '14px' }} /> เข้าห้องสนทนา
              </button>
            </div>
          ))}
        </div>
      ) : activeTab === 'users' ? (
        /* ══════════════════ USERS ══════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px' }}>
            <Search style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
            <input
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="ค้นหาผู้ใช้ตามชื่อ, อีเมล, หรือบทบาท..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', background: 'transparent', color: '#0f172a' }}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="clean-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Users style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontWeight: '800', margin: 0 }}>ไม่พบผู้ใช้</h3>
            </div>
          ) : filteredUsers.map(u => {
            const roleColor = u.role === 'admin' ? '#7c3aed' : u.role === 'employer' ? '#0d9488' : '#2563eb';
            const roleLabel = u.role === 'admin' ? '🛡️ แอดมิน' : u.role === 'employer' ? '🏢 นายจ้าง' : '🎓 ผู้สมัคร';
            return (
              <div key={u.id} className="clean-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={u.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${roleColor}`, flexShrink: 0 }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{u.email}</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: roleColor, background: `${roleColor}15`, padding: '2px 8px', borderRadius: '999px', display: 'inline-block', marginTop: '4px' }}>
                      {roleLabel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingUser(u)}
                  style={{ padding: '8px 16px', borderRadius: '10px', background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye style={{ width: '13px', height: '13px' }} /> ดูโปรไฟล์
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* ══════════════════ JOB POSTS ══════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredJobs.length === 0 ? (
            <div className="clean-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Briefcase style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontWeight: '800', margin: 0 }}>ไม่มีรายการในหมวดนี้</h3>
            </div>
          ) : filteredJobs.map(job => {
            const borderColor = activeTab === 'pending' ? '#3b82f6' : activeTab === 'approved' ? '#10b981' : '#ef4444';
            const isExpanded = expandedJob === job.id;
            return (
              <div key={job.id} className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '0', borderLeft: `4px solid ${borderColor}`, padding: '0', overflow: 'hidden' }}>
                {/* Card Top Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', padding: '20px 24px' }}>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{job.title}</h3>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '3px 10px', borderRadius: '999px', background: borderColor + '18', color: borderColor }}>
                        {activeTab === 'pending' ? '⏳ รอการอนุมัติ' : activeTab === 'approved' ? '✅ อนุมัติแล้ว' : '❌ ปฏิเสธแล้ว'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#334155' }}>
                        <Building style={{ width: '13px', height: '13px' }} />{job.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '13px', height: '13px', color: '#ef4444' }} />{job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign style={{ width: '13px', height: '13px', color: '#10b981' }} />{job.salary}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase style={{ width: '13px', height: '13px', color: '#2563eb' }} />{job.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                      style={{ padding: '8px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Eye style={{ width: '13px', height: '13px' }} />
                      {isExpanded ? 'ซ่อน' : 'รายละเอียด'}
                      {isExpanded ? <ChevronUp style={{ width: '12px', height: '12px' }} /> : <ChevronDown style={{ width: '12px', height: '12px' }} />}
                    </button>

                    {activeTab === 'pending' && (
                      <>
                        <button onClick={() => handleApproval(job.id, 'approved')} style={{ padding: '8px 14px', borderRadius: '10px', background: '#10b981', border: 'none', color: '#fff', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                          ✅ อนุมัติ
                        </button>
                        <button onClick={() => handleApproval(job.id, 'rejected')} style={{ padding: '8px 14px', borderRadius: '10px', background: '#ef4444', border: 'none', color: '#fff', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                          ❌ ปฏิเสธ
                        </button>
                      </>
                    )}
                    {activeTab === 'approved' && (
                      <button onClick={() => handleApproval(job.id, 'rejected')} style={{ padding: '8px 14px', borderRadius: '10px', background: '#f59e0b', border: 'none', color: '#fff', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                        ⚠️ ระงับ
                      </button>
                    )}
                    {activeTab === 'rejected' && (
                      <button onClick={() => handleApproval(job.id, 'approved')} style={{ padding: '8px 14px', borderRadius: '10px', background: '#10b981', border: 'none', color: '#fff', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                        ✅ เปิดใหม่
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(job.id)}
                      title="ลบถาวร"
                      style={{ padding: '8px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 style={{ width: '15px', height: '15px' }} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f1f5f9', background: '#f8fafc', padding: '20px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', margin: '0 0 6px' }}>📋 รายละเอียดงาน</p>
                      <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{job.description || 'ไม่มีรายละเอียด'}</p>
                    </div>
                    {job.skillsRequired?.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>🔧 ทักษะที่ต้องการ</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {job.skillsRequired.map((s, i) => (
                            <span key={i} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontWeight: '600' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
                      {job.postedDate && <span>📅 ลงประกาศ: {job.postedDate}</span>}
                      {job.deadline && <span>⏰ ปิดรับสมัคร: {job.deadline}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ Chat Modal ══════════ */}
      {activeChatApp && (
        <div
          className="animate-fade-in"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '580px', width: '100%', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4)' }}>
            {/* Chat Header */}
            <div style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem' }}>🛡️ แชทผู้ดูแลระบบ</div>
                <div style={{ fontSize: '0.75rem', color: '#99f6e4', marginTop: '2px' }}>
                  {activeChatApp.applicantName} → {activeChatApp.jobTitle} ({activeChatApp.company})
                </div>
              </div>
              <button onClick={() => setActiveChatApp(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Info bar */}
            <div style={{ background: '#f0fdfa', padding: '10px 20px', borderBottom: '1px solid #ccfbf1', fontSize: '0.78rem', color: '#0f766e', fontWeight: '600' }}>
              ข้อความของแอดมินจะมองเห็นได้โดยทั้งผู้สมัครและนายจ้าง
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', margin: 'auto' }}>ยังไม่มีข้อความในห้องนี้</div>
              ) : chatMessages.map((msg, i) => {
                const isMe = msg.senderId === currentUser.id;
                const isAdmin = String(msg.senderId) === String(currentUser.id) || msg.senderName?.includes('แอดมิน');
                return (
                  <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '3px', textAlign: isMe ? 'right' : 'left' }}>{msg.senderName}</div>
                    <div style={{
                      padding: '10px 14px', borderRadius: '16px', fontSize: '0.85rem', lineHeight: 1.5,
                      background: isMe ? 'linear-gradient(135deg, #0d9488, #0f766e)' : (isAdmin ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#ffffff'),
                      color: (isMe || (isAdmin && !isMe)) ? '#fff' : '#0f172a',
                      border: (isMe || isAdmin) ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="พิมพ์ข้อความในฐานะผู้ดูแลระบบ..."
                disabled={isSending}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#f8fafc' }}
              />
              <button type="submit" disabled={!newMsg.trim() || isSending} style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0d9488, #0f766e)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !newMsg.trim() ? 0.5 : 1 }}>
                <Send style={{ width: '16px', height: '16px' }} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ User Profile Inspect Modal ══════════ */}
      {viewingUser && (
        <div
          className="animate-fade-in"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div style={{ background: '#fff', borderRadius: '24px', maxWidth: '520px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={viewingUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={viewingUser.name}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }}
                />
                <div>
                  <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>{viewingUser.name}</div>
                  <div style={{ color: '#c4b5fd', fontSize: '0.78rem', marginTop: '2px' }}>{viewingUser.email}</div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '2px 10px', borderRadius: '999px', display: 'inline-block', marginTop: '4px' }}>
                    {viewingUser.role === 'admin' ? '🛡️ ผู้ดูแลระบบ' : viewingUser.role === 'employer' ? '🏢 นายจ้าง' : '🎓 ผู้สมัครงาน'}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Details body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {viewingUserDetail ? (
                <>
                  {[
                    { icon: Mail, label: 'อีเมล', val: viewingUserDetail.email },
                    { icon: GraduationCap, label: 'สถาบัน/บริษัท', val: viewingUserDetail.university || viewingUserDetail.major || '-' },
                    { icon: FileText, label: 'สาขา/ตำแหน่ง', val: viewingUserDetail.major || '-' },
                    { icon: Globe, label: 'เว็บไซต์', val: viewingUserDetail.website || '-' },
                  ].map((row, i) => {
                    const Icon = row.icon;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <Icon style={{ width: '16px', height: '16px', color: '#7c3aed', flexShrink: 0 }} />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{row.label}</div>
                          <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{row.val}</div>
                        </div>
                      </div>
                    );
                  })}

                  {viewingUserDetail.bio && (
                    <div style={{ padding: '14px 16px', background: '#f5f3ff', borderRadius: '12px', border: '1px solid #ddd6fe', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7c3aed', marginBottom: '6px' }}>📝 เกี่ยวกับตัวเอง</div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>{viewingUserDetail.bio}</p>
                    </div>
                  )}

                  {viewingUserDetail.skills?.length > 0 && (
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>🔧 ทักษะ</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {viewingUserDetail.skills.map((s, i) => (
                          <span key={i} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0' }}>
                  <RefreshCw className="animate-spin" style={{ width: '24px', height: '24px', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.85rem' }}>กำลังโหลดข้อมูล...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
