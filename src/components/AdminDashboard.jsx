import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, MessageSquare, 
  Trash2, Building, MapPin, DollarSign, Briefcase, RefreshCw, X, Send, User 
} from 'lucide-react';
import { 
  fetchJobs, updateJobApprovalStatus, deleteJob, 
  fetchAdminApplications, fetchMessages, sendMessage 
} from '../data/api';

export default function AdminDashboard({ currentUser, onOpenChat }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected', 'chats'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Chat States for Admin joining chat
  const [activeChatApp, setActiveChatApp] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadDashboardData = async () => {
    setLoading(true);
    const jobsData = await fetchJobs({ adminView: true });
    if (jobsData) setJobs(jobsData);
    
    const appsData = await fetchAdminApplications();
    if (appsData) setApplications(appsData);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Poll chat messages if active chat is open
  useEffect(() => {
    if (!activeChatApp) return;

    const loadChatMessages = async () => {
      const msgs = await fetchMessages(activeChatApp.id);
      if (msgs) setChatMessages(msgs);
    };

    loadChatMessages();
    const interval = setInterval(loadChatMessages, 2000);
    return () => clearInterval(interval);
  }, [activeChatApp]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleUpdateApproval = async (jobId, newStatus) => {
    const res = await updateJobApprovalStatus(jobId, newStatus);
    if (res && res.success) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, approvalStatus: newStatus } : j));
    } else {
      alert('ไม่สามารถอัปเดตสถานะการอนุมัติได้');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบประกาศงานนี้ถาวรจากฐานข้อมูลกลาง?')) return;
    const res = await deleteJob(jobId);
    if (res && res.success) {
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } else {
      alert('ไม่สามารถลบประกาศงานได้');
    }
  };

  const handleSendAdminMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChatApp) return;

    setIsSending(true);
    const content = newMessageText.trim();
    setNewMessageText('');

    const res = await sendMessage(
      activeChatApp.id,
      currentUser.id,
      'แอดมิน BlueHouse (' + currentUser.name + ')',
      content
    );

    if (res && res.success) {
      setChatMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        applicationId: activeChatApp.id,
        senderId: currentUser.id,
        senderName: 'แอดมิน BlueHouse (' + currentUser.name + ')',
        content,
        timestamp: new Date().toISOString()
      }]);
    } else {
      alert('ไม่สามารถส่งข้อความได้');
    }
    setIsSending(false);
  };

  // Filter jobs by active tab status
  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'pending') return job.approvalStatus === 'pending';
    if (activeTab === 'approved') return job.approvalStatus === 'approved';
    if (activeTab === 'rejected') return job.approvalStatus === 'rejected';
    return false;
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: 'linear-gradient(135deg, #1e1b4b, #311042)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ShieldCheck style={{ width: '28px', height: '28px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, letterSpacing: '0.5px' }}>แผงควบคุมผู้ดูแลระบบ (Admin)</h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '4px 0 0' }}>ยินดีต้อนรับคุณ {currentUser.name} | ดูแลตรวจสอบตำแหน่งงานและการพูดคุยในระบบ</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="btn"
          style={{ 
            background: 'rgba(255,255,255,0.15)', 
            color: '#ffffff', 
            border: '1px solid rgba(255,255,255,0.25)', 
            padding: '8px 16px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <RefreshCw className={refreshing ? 'animate-spin' : ''} style={{ width: '15px', height: '15px' }} /> อัปเดตข้อมูล
        </button>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px', overflowX: 'auto' }}>
        <button
          onClick={() => { setActiveTab('pending'); setActiveChatApp(null); }}
          style={{
            padding: '12px 20px',
            fontSize: '0.9rem',
            fontWeight: '800',
            border: 'none',
            background: 'none',
            color: activeTab === 'pending' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'pending' ? '3px solid #2563eb' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Clock style={{ width: '16px', height: '16px' }} /> รอการอนุมัติ ({jobs.filter(j => j.approvalStatus === 'pending').length})
        </button>
        <button
          onClick={() => { setActiveTab('approved'); setActiveChatApp(null); }}
          style={{
            padding: '12px 20px',
            fontSize: '0.9rem',
            fontWeight: '800',
            border: 'none',
            background: 'none',
            color: activeTab === 'approved' ? '#059669' : '#64748b',
            borderBottom: activeTab === 'approved' ? '3px solid #059669' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <CheckCircle2 style={{ width: '16px', height: '16px' }} /> อนุมัติแล้ว ({jobs.filter(j => j.approvalStatus === 'approved').length})
        </button>
        <button
          onClick={() => { setActiveTab('rejected'); setActiveChatApp(null); }}
          style={{
            padding: '12px 20px',
            fontSize: '0.9rem',
            fontWeight: '800',
            border: 'none',
            background: 'none',
            color: activeTab === 'rejected' ? '#dc2626' : '#64748b',
            borderBottom: activeTab === 'rejected' ? '3px solid #dc2626' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <AlertTriangle style={{ width: '16px', height: '16px' }} /> ปฏิเสธแล้ว ({jobs.filter(j => j.approvalStatus === 'rejected').length})
        </button>
        <button
          onClick={() => { setActiveTab('chats'); setActiveChatApp(null); }}
          style={{
            padding: '12px 20px',
            fontSize: '0.9rem',
            fontWeight: '800',
            border: 'none',
            background: 'none',
            color: activeTab === 'chats' ? '#7c3aed' : '#64748b',
            borderBottom: activeTab === 'chats' ? '3px solid #7c3aed' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <MessageSquare style={{ width: '16px', height: '16px' }} /> 💬 ติดตามการสนทนา ({applications.length})
        </button>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <RefreshCw className="animate-spin" style={{ width: '32px', height: '32px', margin: '0 auto 12px', color: '#2563eb' }} />
          <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>กำลังโหลดข้อมูล...</p>
        </div>
      ) : activeTab === 'chats' ? (
        /* CHATS LIST MODERATION VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {applications.length === 0 ? (
            <div className="clean-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <MessageSquare style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>ยังไม่มีใบสมัครงานเข้าระบบ</h3>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>ไม่มีประวัติการส่งข้อความหรือยื่นสมัครงานในระบบ ณ ขณะนี้</p>
            </div>
          ) : (
            applications.map(app => (
              <div key={app.id} className="clean-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', borderLeft: '4px solid #7c3aed' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      ผู้สมัคร: {app.applicantName}
                    </h4>
                    <span className="badge badge-accent" style={{ fontSize: '0.7rem', padding: '3px 10px' }}>
                      {app.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#334155' }}>
                      <Briefcase style={{ width: '13px', height: '13px', color: '#7c3aed' }} /> {app.jobTitle}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building style={{ width: '13px', height: '13px' }} /> {app.company}
                    </span>
                  </div>
                  {app.coverNote && (
                    <p style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '8px 0 0' }}>
                      "แนะนำตัว: {app.coverNote}"
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setActiveChatApp(app)}
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    borderRadius: '10px',
                    background: '#7c3aed',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <MessageSquare style={{ width: '14px', height: '14px' }} /> ตรวจสอบห้องแชท / เข้าร่วมคุย
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* JOB POSTS MODERATION VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {filteredJobs.length === 0 ? (
            <div className="clean-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Briefcase style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                ไม่มีรายการประกาศงาน
              </h3>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>ไม่มีใบเสนอโพสต์งานอยู่ในหมวดหมู่นี้ในขณะนี้</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: activeTab === 'pending' ? '4px solid #3b82f6' : activeTab === 'approved' ? '4px solid #10b981' : '4px solid #ef4444', padding: '24px' }}>
                
                {/* Upper Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', textAlign: 'left' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>{job.title}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.825rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155', fontWeight: '700' }}>
                        <Building style={{ width: '14px', height: '14px', color: '#64748b' }} /> {job.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '14px', height: '14px', color: '#ef4444' }} /> {job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign style={{ width: '14px', height: '14px', color: '#10b981' }} /> {job.salary}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase style={{ width: '14px', height: '14px', color: '#2563eb' }} /> {job.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {job.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateApproval(job.id, 'approved')}
                          className="btn"
                          style={{
                            padding: '8px 14px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            borderRadius: '10px',
                            background: '#10b981',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          ✅ อนุมัติเผยแพร่
                        </button>
                        <button
                          onClick={() => handleUpdateApproval(job.id, 'rejected')}
                          className="btn"
                          style={{
                            padding: '8px 14px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            borderRadius: '10px',
                            background: '#ef4444',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ ปัดตกโพสต์
                        </button>
                      </>
                    )}

                    {job.approvalStatus === 'approved' && (
                      <button
                        onClick={() => handleUpdateApproval(job.id, 'rejected')}
                        className="btn"
                        style={{
                          padding: '8px 14px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          borderRadius: '10px',
                          background: '#f59e0b',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        ⚠️ ระงับการเผยแพร่
                      </button>
                    )}

                    {job.approvalStatus === 'rejected' && (
                      <button
                        onClick={() => handleUpdateApproval(job.id, 'approved')}
                        className="btn"
                        style={{
                          padding: '8px 14px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          borderRadius: '10px',
                          background: '#10b981',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        ✅ เปลี่ยนเป็นอนุมัติ
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="btn"
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                      title="ลบออกถาวร"
                    >
                      <Trash2 style={{ width: '15px', height: '15px' }} />
                    </button>
                  </div>
                </div>

                {/* Job Description details inside card */}
                <div style={{ textAlign: 'left', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: '800', color: '#0f172a' }}>รายละเอียดตำแหน่งงาน:</p>
                  <p style={{ margin: '0 0 12px', color: '#475569', lineHeight: 1.5 }}>{job.description}</p>
                  
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#334155' }}>ทักษะที่ต้องการ:</strong>
                      {job.skillsRequired.map((s, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontWeight: '600' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* 💬 Admin application chat overlay */}
      {activeChatApp && (
        <div 
          className="animate-fade-in"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(15, 23, 42, 0.6)', 
            backdropFilter: 'blur(4px)',
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '560px', width: '100%', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
            
            {/* Chat Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#ffffff' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>🛡️ แทรกแซง/ร่วมสนทนาแชท (แอดมินระบบ)</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#c084fc' }}>
                  ใบสมัคร: {activeChatApp.jobTitle} ({activeChatApp.company})
                </p>
              </div>
              <button 
                onClick={() => setActiveChatApp(null)} 
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Application info panel inside chat */}
            <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ textAlign: 'left' }}>
                <div><strong>ผู้สมัคร:</strong> {activeChatApp.applicantName} ({activeChatApp.applicantEmail || 'ไม่มีอีเมล'})</div>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7c3aed', background: '#f5f3ff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                สถานะแชท: สาธารณะ (ผู้สมัคร & นายจ้างเห็นแอดมิน)
              </div>
            </div>

            {/* Chat Messages List */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', margin: 'auto 0' }}>
                  ยังไม่มีการส่งข้อความคุยกันในห้องสนทนานี้
                </div>
              ) : (
                chatMessages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isAdminMsg = msg.senderId.startsWith('admin') || msg.senderName.includes('แอดมิน');
                  
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px', paddingLeft: isMe ? 0 : '4px', textAlign: isMe ? 'right' : 'left' }}>
                        {msg.senderName}
                      </div>
                      <div style={{ 
                        padding: '10px 14px', 
                        borderRadius: '16px', 
                        fontSize: '0.85rem', 
                        lineHeight: 1.4,
                        background: isMe 
                          ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' 
                          : (isAdminMsg ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#ffffff'),
                        color: (isMe || isAdminMsg) ? '#ffffff' : '#0f172a',
                        border: (isMe || isAdminMsg) ? 'none' : '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendAdminMessage} style={{ padding: '16px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="พิมพ์ข้อความช่วยเหลือหรือชี้แจงในฐานะผู้ดูแลระบบ..."
                disabled={isSending}
                style={{ 
                  flex: 1, 
                  padding: '10px 14px', 
                  fontSize: '0.85rem', 
                  borderRadius: '12px', 
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!newMessageText.trim() || isSending}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', 
                  border: 'none', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  opacity: !newMessageText.trim() ? 0.6 : 1
                }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
