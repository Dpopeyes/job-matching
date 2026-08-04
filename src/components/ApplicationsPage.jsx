import React, { useState } from 'react';
import { FileCheck, Building, Calendar, Users, Mail, Phone, CheckCircle2, User, Sparkles, MessageSquare, Clock } from 'lucide-react';

export default function ApplicationsPage({ applications = [], currentUser, onNavigateHome }) {
  const isEmployer = currentUser?.role === 'employer';
  const [appsState, setAppsState] = useState(applications);

  const handleUpdateStatus = (appId, newStatus) => {
    setAppsState(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
  };

  // Mock sample applicants if empty for employer view testing
  const employerApplicantsList = appsState.length > 0 ? appsState : [
    {
      id: 'app-demo-1',
      jobTitle: 'Frontend Developer (React)',
      company: currentUser?.companyName || 'บริษัท ของคุณ',
      applicantName: 'นายชยธร ดอกกุหลาบ',
      applicantEmail: 'student.chayathon@example.com',
      applicantPhone: '081-234-5678',
      applyDate: 'วันนี้',
      coverNote: 'สวัสดีครับ ผมมีความเชี่ยวชาญด้าน React.js และ TailwindCSS มีความตั้งใจอยากร่วมงานกับบริษัทครับ',
      status: 'รอพิจารณา (Pending)',
      skills: ['React', 'JavaScript', 'CSS/Tailwind', 'Git']
    },
    {
      id: 'app-demo-2',
      jobTitle: 'เจ้าหน้าที่การตลาดดิจิทัล',
      company: currentUser?.companyName || 'บริษัท ของคุณ',
      applicantName: 'นางสาวนัฏชรักษ์ กั๊กสูงเนิน',
      applicantEmail: 'student.natcharak@example.com',
      applicantPhone: '089-888-7777',
      applyDate: '1 วันที่แล้ว',
      coverNote: 'สนใจงานการตลาดดิจิทัล มีประสบการณ์ยิงแอด Facebook และทำคอนเทนต์ TikTok ค่ะ',
      status: 'นัดสัมภาษณ์ (Interview Scheduled)',
      skills: ['Digital Marketing', 'Content Creation', 'Facebook Ads']
    }
  ];

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
            {isEmployer ? 'ตรวจสอบรายชื่อผู้สมัคร คัดกรองทักษะ และติดต่อผู้สมัครงานที่ยื่นเข้ามา' : 'ติดตามสถานะและประวัติการยื่นใบสมัครงานทั้งหมดของคุณ'}
          </p>
        </div>

        <button onClick={onNavigateHome} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          <Building style={{ width: '16px', height: '16px' }} /> หน้าหลักตำแหน่งงาน
        </button>
      </div>

      {/* Conditional Rendering by Role */}
      {isEmployer ? (
        /* EMPLOYER VIEW: Show applicants who applied to Employer's jobs */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              📋 รายชื่อผู้สมัครทั้งหมด ({employerApplicantsList.length} คน)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: '700', background: '#f0fdfa', padding: '4px 12px', borderRadius: '999px' }}>
              องค์กรนายจ้างเปิดดูได้เฉพาะรายชื่อผู้สมัครงาน
            </span>
          </div>

          {employerApplicantsList.map((app) => (
            <div key={app.id} className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid #0d9488' }}>
              
              {/* Applicant Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f0fdfa', border: '2px solid #0d9488', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                    {app.applicantName ? app.applicantName.charAt(0) : '👤'}
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

              {/* Applicant Contact Details */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.825rem', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <Mail style={{ width: '14px', height: '14px', color: '#2563eb' }} /> {app.applicantEmail || 'applicant@example.com'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <Phone style={{ width: '14px', height: '14px', color: '#0d9488' }} /> {app.applicantPhone || '081-234-5678'}
                </span>
              </div>

              {/* Cover Note */}
              {app.coverNote && (
                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <MessageSquare style={{ width: '14px', height: '14px', color: '#64748b' }} /> ข้อความแนะนำตัวจากผู้สมัคร:
                  </span>
                  "{app.coverNote}"
                </div>
              )}

              {/* Skills Tags */}
              {app.skills && (
                <div style={{ display: 'flex', itemsCenter: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>ทักษะผู้สมัคร:</span>
                  {app.skills.map((sk, i) => (
                    <span key={i} className="badge badge-skill" style={{ fontSize: '0.7rem' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              )}

              {/* Employer Actions */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleUpdateStatus(app.id, 'นัดสัมภาษณ์ (Interview Scheduled)')}
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
              </div>

            </div>
          ))}

        </div>
      ) : (
        /* APPLICANT VIEW: Show Jobs Applied by Applicant */
        applications.length === 0 ? (
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
            {applications.map((app) => (
              <div key={app.id} className="clean-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
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

                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', background: '#ecfdf5', padding: '6px 14px', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                  ✓ ส่งข้อมูลให้นายจ้างแล้ว
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
