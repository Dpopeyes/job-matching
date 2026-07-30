import React, { useState } from 'react';
import { ArrowLeft, Building, MapPin, DollarSign, Calendar, Sparkles, CheckCircle2, Send, Share2, Briefcase, FileText, Check } from 'lucide-react';

export default function JobDetailPage({ job, currentUser, onBack, onApplySuccess }) {
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: '#64748b' }}>ไม่พบข้อมูลตำแหน่งงานที่เลือก</p>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '16px' }}>
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const handleApply = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAppliedSuccess(true);
      if (onApplySuccess) onApplySuccess(job);
    }, 800);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="btn btn-secondary"
        style={{ marginBottom: '20px', fontSize: '0.85rem' }}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} /> กลับหน้าหลัก
      </button>

      {/* Main Job Banner */}
      <div className="clean-card" style={{ marginBottom: '24px', position: 'relative' }}>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src={job.logo} 
              alt={job.company}
              style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {job.title}
                </h1>
                <span className="badge badge-success">
                  Match {job.matchRate}%
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building style={{ width: '16px', height: '16px', color: '#2563eb' }} /> {job.company}
              </p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            {copiedLink ? <><Check style={{ width: '14px', height: '14px', color: '#059669' }} /> คัดลอกลิงก์แล้ว</> : <><Share2 style={{ width: '14px', height: '14px' }} /> แชร์ตำแหน่งงาน</>}
          </button>

        </div>

        {/* Job Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{job.type}</span>
          <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', fontWeight: '600', padding: '4px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📍 {job.location}
          </span>
          <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.8rem', fontWeight: '700', padding: '4px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            💰 {job.salary}
          </span>
          <span style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', padding: '4px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📅 {job.postedDate}
          </span>
        </div>

      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Job Description & Qualifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="clean-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ width: '18px', height: '18px', color: '#2563eb' }} /> รายละเอียดหน้าที่ความรับผิดชอบ
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
              {job.description}
            </p>
          </div>

          <div className="clean-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ width: '18px', height: '18px', color: '#0d9488' }} /> ทักษะและคุณสมบัติที่ต้องการ
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {job.skillsRequired && job.skillsRequired.map((skill, idx) => (
                <span key={idx} className="badge badge-skill" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  {skill}
                </span>
              ))}
            </div>

            {job.qualifications && (
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                {job.qualifications.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Right Column: Application Form */}
        <div>
          <div className="clean-card" style={{ sticky: true, top: '90px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send style={{ width: '18px', height: '18px', color: '#2563eb' }} /> ยื่นใบสมัครงานนี้
            </h3>

            {appliedSuccess ? (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                <CheckCircle2 style={{ width: '44px', height: '44px', color: '#059669', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#065f46', margin: '0 0 4px' }}>ยื่นใบสมัครสำเร็จเรียบร้อย!</h4>
                <p style={{ fontSize: '0.8rem', color: '#047857', margin: '0 0 14px' }}>
                  ระบบได้ส่งข้อมูลโปรไฟล์และทักษะของคุณไปยังฝ่าย HR ของ {job.company} เรียบร้อยแล้ว
                </p>
                <button onClick={onBack} className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                  ค้นหาตำแหน่งงานอื่นต่อ
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>สมัครในนามผู้ใช้:</div>
                  <div>👤 {currentUser?.name || 'ผู้สมัครงาน'}</div>
                  <div>✉️ {currentUser?.email || 'user@example.com'}</div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    ข้อความถึง HR / แนะนำตัวเองสั้นๆ (Optional)
                  </label>
                  <textarea
                    rows="4"
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="เขียนแนะนำทักษะ ผลงาน หรือเหตุผลที่สนใจตำแหน่งงานนี้..."
                    className="input-field"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderRadius: '12px' }}
                >
                  {isSubmitting ? 'กำลังส่งข้อมูล...' : <><Send style={{ width: '16px', height: '16px' }} /> ยืนยันยื่นใบสมัคร</>}
                </button>

              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
