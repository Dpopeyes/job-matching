import React from 'react';
import { FileCheck, Building, Calendar, ChevronRight, Briefcase } from 'lucide-react';

export default function ApplicationsPage({ applications = [], onNavigateHome }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Header Banner */}
      <div className="clean-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck style={{ width: '24px', height: '24px', color: '#2563eb' }} />
            ประวัติสถานะการสมัครงาน (Applications Tracker)
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            ติดตามสถานะและประวัติการยื่นใบสมัครงานทั้งหมดของคุณ
          </p>
        </div>

        <button onClick={onNavigateHome} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          <Briefcase style={{ width: '16px', height: '16px' }} /> ค้นหาตำแหน่งงานเพิ่ม
        </button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
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
                ✓ บันทึกข้อมูลสำเร็จ
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
