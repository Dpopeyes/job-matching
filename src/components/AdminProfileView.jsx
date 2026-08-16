import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Phone, Building, Edit, Sparkles, CheckCircle2, Server, Database, Users, Briefcase, FileCheck, Camera, X } from 'lucide-react';

import { updateUserProfile } from '../data/api';

export default function AdminProfileView({ user, onUpdateUser, onNavigateAdmin, onNavigateHome }) {
  const [profileData, setProfileData] = useState(user || {});
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ users: 3, jobs: 9, applications: 2 });

  const [editForm, setEditForm] = useState({
    name: user?.name || 'แอดมินระบบ BlueHouse',
    phone: user?.phone || '02-999-8888',
    bio: user?.bio || 'ผู้ดูแลระบบกลางสำหรับอนุมัติงานและช่วยเหลือสมาชิกร่วมกัน',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
  });

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setEditForm({
        name: user.name || 'แอดมินระบบ BlueHouse',
        phone: user.phone || '02-999-8888',
        bio: user.bio || 'ผู้ดูแลระบบกลางสำหรับอนุมัติงานและช่วยเหลือสมาชิกร่วมกัน',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
      });
    }
  }, [user]);

  // Fetch API Health Stats
  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then(res => res.json())
      .then(data => {
        if (data && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateUserProfile(profileData.id || 'admin-001', editForm);
    setIsSaving(false);

    if (res && res.success) {
      setProfileData(res.user);
      if (onUpdateUser) onUpdateUser(res.user);
      setShowEditModal(false);
    } else {
      // Fallback local update
      const updated = { ...profileData, ...editForm };
      setProfileData(updated);
      if (onUpdateUser) onUpdateUser(updated);
      setShowEditModal(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Admin Executive Header Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)', 
          borderRadius: '24px', 
          padding: '32px', 
          color: '#ffffff',
          boxShadow: '0 16px 40px rgba(49, 46, 129, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Decorative Element */}
        <div 
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowEditModal(true)}>
              <img
                src={profileData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                alt={profileData.name}
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '24px',
                  objectFit: 'cover',
                  border: '4px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
              />
              <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: '#7c3aed', color: '#ffffff', padding: '6px', borderRadius: '50%', border: '2px solid #ffffff' }}>
                <Camera style={{ width: '13px', height: '13px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {profileData.name || 'แอดมินระบบ BlueHouse'}
                </h1>
                <span 
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(124,58,237,0.4)'
                  }}
                >
                  <ShieldCheck style={{ width: '14px', height: '14px' }} /> ผู้ดูแลระบบสูงสุด (Super Admin)
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#c7d2fe', margin: '0 0 10px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building style={{ width: '16px', height: '16px', color: '#a5b4fc' }} /> สำนักงานใหญ่ BlueHouse Headquarters — รหัสเจ้าหน้าที่: <strong style={{ color: '#ffffff' }}>ADMIN-001</strong>
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.825rem', color: '#e0e7ff', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail style={{ width: '14px', height: '14px', color: '#a5b4fc' }} /> {profileData.email || 'admin@bluehouse.com'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone style={{ width: '14px', height: '14px', color: '#a5b4fc' }} /> {profileData.phone || '02-999-8888'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontWeight: '700' }}><CheckCircle2 style={{ width: '14px', height: '14px' }} /> 🟢 สถานะ: พร้อมปฏิบัติงาน</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                padding: '10px 18px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Edit style={{ width: '16px', height: '16px' }} /> แก้ไขโปรไฟล์แอดมิน
            </button>

            {onNavigateAdmin && (
              <button
                onClick={onNavigateAdmin}
                style={{
                  background: '#ffffff',
                  color: '#4338ca',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
                }}
              >
                <ShieldCheck style={{ width: '16px', height: '16px', color: '#4338ca' }} /> 🛡️ แดชบอร์ดควบคุมระบบ
              </button>
            )}
          </div>

        </div>

        {/* Executive Bio */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', fontSize: '0.85rem', color: '#c7d2fe', lineHeight: 1.6 }}>
          💬 <strong style={{ color: '#ffffff' }}>ขอบเขตความรับผิดชอบ:</strong> {profileData.bio || 'ผู้ดูแลระบบกลางสำหรับตรวจสอบอนุมัติประกาศงาน ควบคุมคุณภาพเนื้อหา ดูแลบัญชีสมาชิกผู้สมัครงานและนายจ้างในแพลตฟอร์ม BlueHouse Jobs'}
        </div>

      </div>

      {/* System Health & Live Platform Statistics */}
      <section>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server style={{ width: '20px', height: '20px', color: '#7c3aed' }} /> สถิติด้านการดูแลระบบและสถานะเซิร์ฟเวอร์ (Live Platform Stats)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          <div className="clean-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #7c3aed' }}>
            <div style={{ background: '#f5f3ff', padding: '14px', borderRadius: '16px', color: '#7c3aed' }}>
              <Users style={{ width: '28px', height: '28px' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>สมาชิกทั้งหมดในระบบ</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{stats.users || 3} บัญชี</div>
              <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '700', marginTop: '2px' }}>✓ ผู้สมัคร & นายจ้าง</div>
            </div>
          </div>

          <div className="clean-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #2563eb' }}>
            <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '16px', color: '#2563eb' }}>
              <Briefcase style={{ width: '28px', height: '28px' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>ตำแหน่งงานในระบบ</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{stats.jobs || 9} ประกาศ</div>
              <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '700', marginTop: '2px' }}>✓ อนุมัติพร้อมเปิดรับ</div>
            </div>
          </div>

          <div className="clean-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #0d9488' }}>
            <div style={{ background: '#f0fdfa', padding: '14px', borderRadius: '16px', color: '#0d9488' }}>
              <FileCheck style={{ width: '28px', height: '28px' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>ใบสมัครงานที่ยื่นเข้ามา</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{stats.applications || 2} รายการ</div>
              <div style={{ fontSize: '0.7rem', color: '#0d9488', fontWeight: '700', marginTop: '2px' }}>✓ ซิงค์แบบเรียลไทม์</div>
            </div>
          </div>

          <div className="clean-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #16a34a' }}>
            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '16px', color: '#16a34a' }}>
              <Database style={{ width: '28px', height: '28px' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>สถานะฐานข้อมูล SQLite</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>Online 🟢</div>
              <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '600', marginTop: '2px' }}>Port: 3001 Active</div>
            </div>
          </div>

        </div>
      </section>

      {/* Admin Quick Control Shortcuts Grid */}
      <section className="clean-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles style={{ width: '18px', height: '18px', color: '#7c3aed' }} /> เครื่องมือและเมนูทางลัดผู้ดูแลระบบ (Admin Control Suite)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          
          <button
            onClick={onNavigateAdmin}
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f3ff';
              e.currentTarget.style.borderColor = '#ddd6fe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🛡️ แดชบอร์ดอนุมัติงาน & สมาชิก
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
              ตรวจสอบประกาศรับสมัครงาน ลบโพสต์ที่ไม่เหมาะสม และอนุมัติสมาชิกใหม่
            </p>
          </button>

          <button
            onClick={onNavigateAdmin}
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#eff6ff';
              e.currentTarget.style.borderColor = '#bfdbfe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💬 สอดส่องห้องแชท & สแปม
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
              ตรวจสอบความปลอดภัยในห้องแชทระหว่างผู้สมัครงานและนายจ้าง
            </p>
          </button>

          <button
            onClick={onNavigateHome}
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdfa';
              e.currentTarget.style.borderColor = '#99f6e4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0d9488', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌐 ตรวจดูหน้าหลัก (Live Site View)
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
              เข้าชมหน้าหลักของการค้นหางานเพื่อตรวจสอบการแสดงผลจริงของผู้ใช้
            </p>
          </button>

        </div>
      </section>

      {/* Edit Admin Profile Modal */}
      {showEditModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
        >
          <div 
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowEditModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck style={{ width: '22px', height: '22px', color: '#7c3aed' }} /> แก้ไขข้อมูลผู้ดูแลระบบ
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px' }}>
              ปรับปรุงชื่อผู้ใช้งาน เบอร์ติดต่อ และรายละเอียดขอบเขตงานของคุณ
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  ชื่อผู้ดูแลระบบ (Admin Name)
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  URL รูปโปรไฟล์ (Avatar Image URL)
                </label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  ขอบเขตความรับผิดชอบ / Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="input-field"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
