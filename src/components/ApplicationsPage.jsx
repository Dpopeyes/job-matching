import React, { useState, useEffect, useRef } from 'react';
import { FileCheck, Building, Calendar, Users, Mail, Phone, CheckCircle2, User, Sparkles, MessageSquare, Clock, Send, X, FolderGit2, Globe, ExternalLink, QrCode, Download } from 'lucide-react';
import { updateApplicationStatus, fetchMessages, sendMessage, fetchUserPortfolio } from '../data/api';
import QRCodeModal from './QRCodeModal';

export default function ApplicationsPage({ applications = [], currentUser, onNavigateHome, onRefreshApplications, onOpenChat }) {
  const isEmployer = currentUser?.role === 'employer';
  const [appsState, setAppsState] = useState(applications);
  const [activeChatApp, setActiveChatApp] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [selectedPortfolioApp, setSelectedPortfolioApp] = useState(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [qrCodeUser, setQrCodeUser] = useState(null);
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNote, setInterviewNote] = useState('');

  // Handle PDF Resume Download for Employers
  const handleDownloadResume = async (app, existingPortfolio = null) => {
    let portData = existingPortfolio;
    if (!portData) {
      setIsLoadingPortfolio(true);
      portData = await fetchUserPortfolio(app.userId);
      setIsLoadingPortfolio(false);
    }

    const user = portData?.user || {
      name: app.applicantName || 'ผู้สมัครงาน',
      email: app.applicantEmail || 'user@example.com',
      phone: app.applicantPhone || 'ไม่ระบุ',
      university: 'มหาวิทยาลัย',
      major: 'สาขาวิชา'
    };

    const skills = portData?.skills || [];
    const projects = portData?.projects || [];

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('กรุณาอนุญาตให้เปิดเบราว์เซอร์สำหรับดาวน์โหลด PDF Resume');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${user.name} | BlueHouse Jobs</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Sarabun', 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; background: #ffffff; }
          .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
          .name { font-size: 26px; font-weight: 800; color: #1e3a8a; margin: 0; }
          .sub { font-size: 15px; color: #475569; margin-top: 4px; }
          .contact { font-size: 13px; color: #64748b; margin-top: 8px; }
          .section-title { font-size: 16px; font-weight: 800; color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 24px 0 12px; }
          .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin: 3px; border: 1px solid #bfdbfe; }
          .project-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; }
          .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 14px; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="name">${user.name}</h1>
            <div class="sub">🎓 ${user.university || 'มหาวิทยาลัย'} — ${user.major || 'สาขาวิชา'}</div>
            <div class="contact">📧 อีเมล: ${user.email} | 📞 เบอร์โทร: ${user.phone || 'ไม่ระบุ'}</div>
          </div>
          <div style="text-align: right;">
            <div style="background: #ecfdf5; color: #047857; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 800; border: 1px solid #a7f3d0; display: inline-block;">
              ✓ Verified Candidate
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">สมัครตำแหน่ง: ${app.jobTitle || 'ตำแหน่งงานที่สนใจ'}</div>
          </div>
        </div>

        ${app.coverNote ? `
          <div class="section-title">💬 ข้อความแนะนำตัวถึง HR</div>
          <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #334155; font-style: italic;">
            "${app.coverNote}"
          </div>
        ` : ''}

        <div class="section-title">🛠️ ทักษะและความเชี่ยวชาญ (Skills)</div>
        <div>
          ${skills.length > 0 ? skills.map(s => `<span class="badge">${typeof s === 'string' ? s : s.name} (${s.level || 'Intermediate'})</span>`).join('') : '<span style="color: #64748b; font-size: 13px;">ทักษะเฉพาะสายงานและการทำงานร่วมกัน</span>'}
        </div>

        <div class="section-title">💼 ผลงานและโปรเจกต์ (Portfolio & Projects)</div>
        ${projects.length > 0 ? projects.map(p => `
          <div class="project-card">
            <div style="font-weight: 800; font-size: 14px; color: #0f172a;">${p.title}</div>
            <div style="font-size: 12px; color: #475569; margin: 4px 0;">${p.description || ''}</div>
            <div style="font-size: 11px; color: #2563eb; font-weight: 700;">แท็ก: ${p.tags || 'React, Web Application'}</div>
          </div>
        `).join('') : '<div style="color: #64748b; font-size: 13px;">มีผลงานและโปรไฟล์ดิจิทัลพร้อมตรวจสอบในระบบ BlueHouse Jobs</div>'}

        <div class="footer">
          📄 เอกสารประวัติผู้สมัครรับรองโดยระบบ BlueHouse Jobs Smart Matching Platform — พิมพ์เมื่อ ${new Date().toLocaleDateString('th-TH')}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleViewPortfolio = async (app) => {
    setIsLoadingPortfolio(true);
    setSelectedPortfolioApp(app);
    const port = await fetchUserPortfolio(app.userId);
    setIsLoadingPortfolio(false);
    if (port) {
      setSelectedPortfolio(port);
    } else {
      alert('ไม่สามารถดึงข้อมูลพอร์ตโฟลิโอได้');
    }
  };


  const handleShowQRCode = async (userId) => {
    setIsLoadingPortfolio(true);
    const port = await fetchUserPortfolio(userId);
    setIsLoadingPortfolio(false);
    if (port && port.user) {
      setQrCodeUser(port.user);
    } else {
      alert('ไม่สามารถดึงข้อมูลคิวอาร์โค้ดโปรไฟล์ได้');
    }
  };

  const handleShowMyQRCode = () => {
    setQrCodeUser(currentUser);
  };

  const handleOpenChatAction = (app) => {
    if (onOpenChat) {
      onOpenChat(app);
    } else {
      setActiveChatApp(app);
    }
  };

  useEffect(() => {
    setAppsState(applications);
  }, [applications]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages]);

  // Poll chat messages every 2 seconds when chat is open
  useEffect(() => {
    if (!activeChatApp) {
      setChatMessages([]);
      return;
    }

    const loadMessages = async () => {
      const msgs = await fetchMessages(activeChatApp.id);
      if (msgs) {
        setChatMessages(msgs);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);

    return () => clearInterval(interval);
  }, [activeChatApp]);

  const handleUpdateStatus = async (appId, newStatus) => {
    const res = await updateApplicationStatus(appId, newStatus);
    if (res && res.success) {
      setAppsState(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      if (onRefreshApplications) {
        onRefreshApplications();
      }
    } else {
      alert('ไม่สามารถอัปเดตสถานะใบสมัครงานได้');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChatApp || !currentUser) return;

    setIsSending(true);
    const content = newMessageText.trim();
    setNewMessageText('');

    const msg = await sendMessage(
      activeChatApp.id,
      currentUser.id,
      currentUser.name,
      content
    );

    if (msg) {
      setChatMessages(prev => [...prev, msg]);
    }
    setIsSending(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Header Banner */}
      <div className="clean-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEmployer ? (
              <><Users style={{ width: '26px', height: '26px', color: '#0d9488' }} /> รายชื่อผู้สมัครงานที่ยื่นเข้ามา (Applicants Received)</>
            ) : (
              <><FileCheck style={{ width: '26px', height: '26px', color: '#2563eb' }} /> ประวัติสถานะการสมัครงาน (Applications Tracker)</>
            )}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            {isEmployer ? 'ตรวจสอบรายชื่อผู้สมัครงานจริงที่ยื่นเข้ามาที่องค์กรของคุณ' : 'ติดตามสถานะและประวัติการยื่นใบสมัครงานทั้งหมดของคุณ'}
          </p>
        </div>

        <button onClick={onNavigateHome} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          <Building style={{ width: '16px', height: '16px' }} /> หน้าหลักตำแหน่งงาน
        </button>
      </div>

      {/* Conditional Rendering by Role */}
      {isEmployer ? (
        /* EMPLOYER VIEW: Show ONLY REAL applicants who actually applied */
        appsState.length === 0 ? (
          <div className="clean-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <Users style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>ยังไม่มีผู้สมัครงานยื่นใบสมัครเข้ามา</h3>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>เมื่อมีผู้หางานกดยื่นใบสมัครในตำแหน่งงานที่คุณโพสต์ รายชื่อผู้สมัครจะแสดงที่นี่ทันที</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                📋 รายชื่อผู้สมัครงานจริง ({appsState.length} คน)
              </h3>
            </div>

            {appsState.map((app) => (
              <div key={app.id} className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid #0d9488' }}>
                
                {/* Applicant Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f0fdfa', border: '2px solid #0d9488', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                      👤
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {app.applicantName || 'ผู้สมัครงาน'}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '700', margin: '2px 0 0' }}>
                        ตำแหน่งงานที่สมัคร: {app.jobTitle}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-accent" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                      {app.status || 'รอพิจารณา'}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <Calendar style={{ width: '13px', height: '13px' }} /> ยื่นเมื่อ {app.applyDate}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {(app.applicantEmail || app.applicantPhone) && (
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '8px 14px', borderRadius: '8px', flexWrap: 'wrap' }}>
                    {app.applicantEmail && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail style={{ width: '14px', height: '14px', color: '#64748b' }} /> {app.applicantEmail}
                      </span>
                    )}
                    {app.applicantPhone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone style={{ width: '14px', height: '14px', color: '#64748b' }} /> {app.applicantPhone}
                      </span>
                    )}
                  </div>
                )}

                {/* Cover Note */}
                {app.coverNote && (
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <MessageSquare style={{ width: '14px', height: '14px', color: '#64748b' }} /> ข้อความแนะนำตัวจากผู้สมัคร:
                    </span>
                    "{app.coverNote}"
                  </div>
                )}

                {/* Interview details if scheduled */}
                {app.interviewDate && (
                  <div style={{ marginTop: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', fontSize: '0.8rem', color: '#166534', width: '100%', textAlign: 'left', marginBottom: '12px' }}>
                    <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Clock style={{ width: '15px', height: '15px', color: '#15803d' }} /> นัดสัมภาษณ์แล้ว
                    </div>
                    <div><strong>📅 วัน-เวลาสัมภาษณ์:</strong> {new Date(app.interviewDate).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} น.</div>
                    {app.interviewNote && <div style={{ marginTop: '4px' }}><strong>📝 รายละเอียดเพิ่มเติม:</strong> {app.interviewNote}</div>}
                  </div>
                )}

                {/* Employer Actions */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => setSchedulingApp(app)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                  >
                    <Clock style={{ width: '13px', height: '13px' }} /> นัดวันสัมภาษณ์
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'ผ่านการคัดเลือก (Accepted)')}
                    className="btn btn-accent"
                    style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                  >
                    <CheckCircle2 style={{ width: '13px', height: '13px' }} /> รับเข้าทำงาน
                  </button>
                  <button
                    onClick={() => handleOpenChatAction(app)}
                    className="btn btn-secondary"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '6px 14px', 
                      background: '#eff6ff', 
                      border: '1px solid #bfdbfe', 
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <MessageSquare style={{ width: '13px', height: '13px' }} /> พูดคุยแชทโต้ตอบ
                  </button>
                  <button
                    onClick={() => handleViewPortfolio(app)}
                    className="btn btn-secondary"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '6px 14px', 
                      background: '#faf5ff', 
                      border: '1px solid #e9d5ff', 
                      color: '#7e22ce',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <FolderGit2 style={{ width: '13px', height: '13px' }} /> ดูพอร์ต/ผลงาน
                  </button>
                  <button
                    onClick={() => handleDownloadResume(app)}
                    className="btn btn-secondary"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '6px 14px', 
                      background: '#ecfdf5', 
                      border: '1px solid #a7f3d0', 
                      color: '#047857',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '700'
                    }}
                  >
                    <Download style={{ width: '13px', height: '13px' }} /> ดาวน์โหลด Resume (PDF)
                  </button>
                  <button
                    onClick={() => handleShowQRCode(app.userId)}
                    className="btn btn-secondary"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '6px 14px', 
                      background: '#f0fdf4', 
                      border: '1px solid #bbf7d0', 
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <QrCode style={{ width: '13px', height: '13px' }} /> คิวอาร์สแกน
                  </button>
                </div>


              </div>
            ))}
          </div>
        )
      ) : (
        /* APPLICANT VIEW: Show Jobs Applied by Applicant */
        appsState.length === 0 ? (
          <div className="clean-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <FileCheck style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>ยังไม่มีประวัติการยื่นสมัครงาน</h3>
            <p style={{ fontSize: '0.85rem', margin: '0 0 16px' }}>คุณสามารถค้นหาและยื่นใบสมัครงานทุกสายอาชีพที่สนใจได้ทันที</p>
            <button onClick={onNavigateHome} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              ไปหน้าค้นหางาน
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appsState.map((app) => (
              <div key={app.id} className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Top row: info on left, buttons on right */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {app.jobTitle}
                      </h3>
                      <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
                        {app.status || 'กำลังพิจารณา'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#334155' }}>
                        <Building style={{ width: '14px', height: '14px', color: '#2563eb' }} /> {app.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '14px', height: '14px' }} /> ยื่นเมื่อ {app.applyDate}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
                  <button
                    onClick={() => handleOpenChatAction(app)}
                    className="btn btn-secondary"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '8px 16px', 
                      background: '#eff6ff', 
                      border: '1px solid #bfdbfe', 
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <MessageSquare style={{ width: '13px', height: '13px' }} /> แชทกับนายจ้าง
                  </button>
                  <button
                    onClick={() => handleShowMyQRCode()}
                    className="btn btn-secondary"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '8px 16px', 
                      background: '#f8fafc', 
                      border: '1px solid #cbd5e1', 
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <QrCode style={{ width: '13px', height: '13px' }} /> คิวอาร์โปรไฟล์
                  </button>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', background: '#ecfdf5', padding: '6px 14px', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                    ✓ ส่งข้อมูลเรียบร้อย
                  </div>
                  </div>
                </div>

                {/* Interview schedule box — always on its own row below */}
                {app.interviewDate && (
                  <div style={{ marginTop: '4px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 16px', fontSize: '0.8rem', color: '#1e40af', textAlign: 'left' }}>
                    <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Clock style={{ width: '15px', height: '15px', color: '#2563eb' }} /> กำหนดการสัมภาษณ์งาน
                    </div>
                    <div><strong>📅 วัน-เวลาสัมภาษณ์:</strong> {new Date(app.interviewDate).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} น.</div>
                    {app.interviewNote && <div style={{ marginTop: '4px' }}><strong>📝 รายละเอียดเพิ่มเติม:</strong> {app.interviewNote}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* 💬 Premium Chat Modal */}
      {activeChatApp && (
        <div 
          className="animate-fade-in"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 200, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(15, 23, 42, 0.65)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '20px' 
          }}
        >
          <div 
            style={{ 
              background: '#ffffff', 
              borderRadius: '28px', 
              maxWidth: '550px', 
              width: '100%', 
              height: '80vh', 
              maxHeight: '650px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '22px 26px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare style={{ width: '20px', height: '20px', color: '#2563eb' }} /> ห้องพูดคุยสื่อสาร (Chat Box)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
                  {isEmployer ? `ผู้สมัคร: ${activeChatApp.applicantName}` : `บริษัท: ${activeChatApp.company} (${activeChatApp.jobTitle})`}
                </p>
              </div>
              <button
                onClick={() => setActiveChatApp(null)}
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  background: '#f1f5f9', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#64748b',
                  transition: 'all 0.2s ease'
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Messages Body */}
            <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8' }}>
                  <MessageSquare style={{ width: '40px', height: '40px', color: '#cbd5e1', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: '500' }}>พิมพ์ส่งข้อความติดต่อกันเพื่อพูดคุยรายละเอียดงานได้เลยครับ</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div 
                      key={msg.id} 
                      style={{ 
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* Sender Name */}
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px', fontWeight: '600' }}>
                        {isMe ? 'คุณ' : msg.senderName}
                      </span>
                      {/* Message Bubble */}
                      <div 
                        style={{ 
                          padding: '10px 16px', 
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                          background: isMe ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#ffffff', 
                          color: isMe ? '#ffffff' : '#1e293b',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          lineHeight: 1.4,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                          border: isMe ? 'none' : '1px solid #e2e8f0',
                          wordBreak: 'break-word'
                        }}
                      >
                        {msg.content}
                      </div>
                      {/* Timestamp */}
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', background: '#ffffff' }}>
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="พิมพ์ข้อความตอบกลับ..."
                style={{ 
                  flex: 1, 
                  padding: '12px 18px', 
                  borderRadius: '999px', 
                  border: '1px solid #cbd5e1', 
                  outline: 'none', 
                  fontSize: '0.85rem',
                  background: '#f8fafc',
                  transition: 'all 0.2s ease'
                }}
                disabled={isSending}
                required
              />
              <button
                type="submit"
                disabled={isSending || !newMessageText.trim()}
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  background: newMessageText.trim() ? '#2563eb' : '#cbd5e1', 
                  color: '#ffffff', 
                  border: 'none', 
                  cursor: newMessageText.trim() ? 'pointer' : 'default',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: newMessageText.trim() ? '0 4px 10px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📂 Candidate Portfolio Modal */}
      {selectedPortfolio && (
        <div 
          className="animate-fade-in"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(15, 23, 42, 0.65)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '20px' 
          }}
        >
          <div 
            style={{ 
              background: '#ffffff', 
              borderRadius: '28px', 
              maxWidth: '650px', 
              width: '100%', 
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '22px 26px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#5b21b6', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderGit2 style={{ width: '22px', height: '22px', color: '#7c3aed' }} /> พอร์ตโฟลิโอ & ผลงานผู้สมัคร
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
                  ข้อมูลการศึกษาและคลังผลงานโครงการจริงของผู้สมัครงาน
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                {isEmployer && (
                  <button
                    onClick={() => handleDownloadResume(selectedPortfolioApp || { userId: selectedPortfolio.user?.id }, selectedPortfolio)}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    <Download style={{ width: '15px', height: '15px' }} /> 📥 ดาวน์โหลด Resume (PDF)
                  </button>
                )}
                <button
                  onClick={() => setSelectedPortfolio(null)}
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    background: '#f1f5f9', 
                    border: 'none', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#64748b',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <X style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            </div>


            {/* Modal Body */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc' }}>
              
              {/* User Bio Card */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #7c3aed', padding: '16px', borderRadius: '16px' }}>
                <img 
                  src={selectedPortfolio.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} 
                  alt={selectedPortfolio.user.name} 
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #7c3aed' }}
                />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                    {selectedPortfolio.user.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: '0 0 2px', fontWeight: '700' }}>
                    🎓 {selectedPortfolio.user.university}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 6px', fontWeight: '600' }}>
                    สาขา: {selectedPortfolio.user.major} {selectedPortfolio.user.studentId && `(รหัสนักศึกษา: ${selectedPortfolio.user.studentId})`}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#4b5563', flexWrap: 'wrap' }}>
                    <span>✉️ {selectedPortfolio.user.email}</span>
                    {selectedPortfolio.user.phone && <span>📞 {selectedPortfolio.user.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Bio block */}
              {selectedPortfolio.user.bio && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📝 แนะนำตัว (About Me)
                  </h5>
                  <p style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5, margin: 0 }}>
                    "{selectedPortfolio.user.bio}"
                  </p>
                </div>
              )}

              {/* Skills block */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💻 ทักษะความเชี่ยวชาญ (Skills)
                </h5>
                {selectedPortfolio.skills.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>ยังไม่มีการระบุทักษะ</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedPortfolio.skills.map((s) => (
                      <span 
                        key={s.id} 
                        className="badge badge-skill" 
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '6px 12px', 
                          background: '#f5f3ff', 
                          color: '#6d28d9', 
                          border: '1px solid #ddd6fe',
                          fontWeight: '700'
                        }}
                      >
                        {s.name} ({s.level || 'Intermediate'})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects block */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🚀 โครงงาน & ผลงานโชว์เคส (Projects Showcase)
                </h5>
                {selectedPortfolio.projects.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, textAlign: 'center', padding: '20px 0' }}>ไม่มีข้อมูลผลงานที่ลงทะเบียนไว้</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {selectedPortfolio.projects.map((p) => (
                      <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Multiple Images Horizontal Scroll */}
                        {p.images && p.images.length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '4px', scrollbarWidth: 'thin' }}>
                            {p.images.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img} 
                                alt={`${p.title}-${idx}`} 
                                style={{ width: '220px', height: '130px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
                              />
                            ))}
                          </div>
                        )}
                        <h6 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          {p.title}
                        </h6>
                        <p style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.4, margin: 0 }}>
                          {p.description}
                        </p>
                        
                        {/* Tags */}
                        {p.tags && p.tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {p.tags.map((t, idx) => (
                              <span key={idx} style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Links */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                          {p.demoUrl && (
                            <a 
                              href={p.demoUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
                            >
                              <Globe style={{ width: '12px', height: '12px' }} /> ลิงก์สาธิต Demo <ExternalLink style={{ width: '10px', height: '10px' }} />
                            </a>
                          )}
                          {p.githubUrl && (
                            <a 
                              href={p.githubUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
                            >
                              <FolderGit2 style={{ width: '12px', height: '12px' }} /> ซอร์สโค้ด GitHub <ExternalLink style={{ width: '10px', height: '10px' }} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#ffffff' }}>
              <button 
                onClick={() => setSelectedPortfolio(null)}
                className="btn btn-secondary"
                style={{ borderRadius: '10px', fontSize: '0.85rem', padding: '8px 20px' }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator for Portfolio */}
      {isLoadingPortfolio && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', padding: '20px 30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '700', color: '#5b21b6' }}>
            <FolderGit2 style={{ color: '#7c3aed' }} /> กำลังโหลดพอร์ตโฟลิโอ...
          </div>
        </div>
      )}

      {qrCodeUser && (
        <QRCodeModal user={qrCodeUser} onClose={() => setQrCodeUser(null)} />
      )}

      {/* 📅 Schedule Interview Modal */}
      {schedulingApp && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', position: 'relative', textAlign: 'left' }}>
            {/* Close Button */}
            <button
              onClick={() => setSchedulingApp(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>

            {/* Header Icon & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock style={{ width: '22px', height: '22px' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>นัดหมายสัมภาษณ์งาน</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
              ระบุวันเวลาและรายละเอียดการนัดหมายเพื่อแจ้งตารางสัมภาษณ์แก่ผู้สมัคร <strong>{schedulingApp.applicantName}</strong> ทราบผ่านระบบสถานะสมัครงานแบบเรียลไทม์
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!interviewDate) {
                alert('กรุณาเลือกวันและเวลาที่นัดหมาย');
                return;
              }
              const res = await updateApplicationStatus(schedulingApp.id, 'นัดสัมภาษณ์ (Interview Scheduled)', interviewDate, interviewNote);
              if (res && res.success) {
                setAppsState(prev => prev.map(a => a.id === schedulingApp.id ? { 
                  ...a, 
                  status: 'นัดสัมภาษณ์ (Interview Scheduled)',
                  interviewDate,
                  interviewNote
                } : a));
                if (onRefreshApplications) {
                  onRefreshApplications();
                }
                setSchedulingApp(null);
                setInterviewDate('');
                setInterviewNote('');
              } else {
                alert('ไม่สามารถบันทึกตารางนัดหมายได้');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  วันและเวลานัดสัมภาษณ์ <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="datetime-local" 
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px 14px', 
                    fontSize: '0.9rem', 
                    borderRadius: '12px', 
                    border: '1px solid #cbd5e1', 
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontWeight: '600'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  รายละเอียด / ลิงก์ห้องประชุม (เช่น Google Meet, Zoom หรือที่ตั้งออฟฟิศ)
                </label>
                <textarea 
                  value={interviewNote}
                  onChange={(e) => setInterviewNote(e.target.value)}
                  placeholder="เช่น ลิงก์สัมภาษณ์ออนไลน์ Google Meet: https://meet.google.com/abc-defg-hij หรือสถานที่ตั้งสาขา..."
                  rows="4"
                  style={{ 
                    width: '100%', 
                    padding: '12px 14px', 
                    fontSize: '0.85rem', 
                    borderRadius: '12px', 
                    border: '1px solid #cbd5e1', 
                    background: '#f8fafc',
                    color: '#0f172a',
                    resize: 'none',
                    lineHeight: 1.5
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setSchedulingApp(null)} 
                  className="btn"
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    fontSize: '0.85rem', 
                    fontWeight: '700', 
                    borderRadius: '14px', 
                    background: '#f1f5f9', 
                    border: '1px solid #cbd5e1', 
                    color: '#475569', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="btn"
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    fontSize: '0.85rem', 
                    fontWeight: '700', 
                    borderRadius: '14px', 
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                    border: 'none', 
                    color: '#ffffff', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.3)'}
                  onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)'}
                >
                  ตกลง นัดหมาย
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
