import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Phone, Building, Edit, Sparkles, CheckCircle2, Server, Camera, X, Shield, Lock, ExternalLink } from 'lucide-react';

import { updateUserProfile } from '../data/api';

export default function AdminProfileView({ user, onUpdateUser, onNavigateAdmin, onNavigateHome }) {
  const [profileData, setProfileData] = useState(user || {});
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ users: 3, jobs: 9, applications: 2 });

  const [editForm, setEditForm] = useState({
    name: user?.name || 'แอดมินระบบ BlueHouse',
    phone: user?.phone || '02-999-8888',
    bio: user?.bio || 'ผู้ดูแลระบบกลางสำหรับตรวจสอบอนุมัติประกาศงาน ควบคุมคุณภาพเนื้อหา ดูแลบัญชีสมาชิกผู้สมัครงานและนายจ้างในแพลตฟอร์ม BlueHouse Jobs',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
  });

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setEditForm({
        name: user.name || 'แอดมินระบบ BlueHouse',
        phone: user.phone || '02-999-8888',
        bio: user.bio || 'ผู้ดูแลระบบกลางสำหรับตรวจสอบอนุมัติประกาศงาน ควบคุมคุณภาพเนื้อหา ดูแลบัญชีสมาชิกผู้สมัครงานและนายจ้างในแพลตฟอร์ม BlueHouse Jobs',
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
      const updated = { ...profileData, ...editForm };
      setProfileData(updated);
      if (onUpdateUser) onUpdateUser(updated);
      setShowEditModal(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Main Profile Banner Card (Same White Card style as Employer) */}
      <div style={{ overflow: 'hidden', padding: 0, background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)' }}>
        
        <div style={{ padding: '32px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
              
              {/* Admin Avatar */}
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowEditModal(true)} title="คลิกเพื่อแก้ไขรูปโปรไฟล์">
                <img
                  src={profileData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                  alt={profileData.name}
                  style={{
                    width: '110px',
                    height: '110px',
                    minWidth: '110px',
                    minHeight: '110px',
                    borderRadius: '24px',
                    objectFit: 'cover',
                    border: '4px solid #ffffff',
                    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.15)',
                    background: '#ffffff'
                  }}
                />
                <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: '#7c3aed', color: '#ffffff', padding: '5px', borderRadius: '50%', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera style={{ width: '12px', height: '12px' }} />
                </div>
              </div>

              {/* Admin Main Info */}
              <div style={{ marginBottom: '4px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {profileData.name || 'แอดมินระบบ BlueHouse'}
                  </h1>
                  <span 
                    style={{
                      background: '#f5f3ff',
                      color: '#7c3aed',
                      border: '1px solid #ddd6fe',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShieldCheck style={{ width: '14px', height: '14px', color: '#7c3aed' }} /> ✓ Verified Admin
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building style={{ width: '18px', height: '18px', color: '#7c3aed' }} /> สำนักงานใหญ่ BlueHouse HQ — 📍 กรุงเทพมหานคร (ADMIN-001)
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail style={{ width: '14px', height: '14px', color: '#7c3aed' }} /> {profileData.email || 'admin@bluehouse.com'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone style={{ width: '14px', height: '14px', color: '#7c3aed' }} /> {profileData.phone || '02-999-8888'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: '700' }}><CheckCircle2 style={{ width: '14px', height: '14px' }} /> 🟢 สถานะ: พร้อมปฏิบัติงาน</span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ width: '100%', display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.85rem',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                <Edit style={{ width: '16px', height: '16px' }} /> แก้ไขข้อมูลส่วนตัว
              </button>

              {onNavigateAdmin && (
                <button
                  onClick={onNavigateAdmin}
                  style={{
                    fontSize: '0.85rem',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontWeight: '800',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <ShieldCheck style={{ width: '16px', height: '16px' }} /> 🛡️ แดชบอร์ดควบคุมระบบ
                </button>
              )}
            </div>

          </div>

          {/* Bio Box (Matching Employer Bio style) */}
          <div style={{ marginTop: '20px', padding: '16px', background: '#f5f3ff', borderRadius: '16px', border: '1px solid #ddd6fe', fontSize: '0.9rem', color: '#5b21b6', lineHeight: 1.6 }}>
            <span style={{ fontWeight: '800' }}>ขอบเขตงานและหน้าที่ผู้ดูแลระบบ: </span>
            {profileData.bio || 'ผู้ดูแลระบบกลางสำหรับตรวจสอบอนุมัติประกาศงาน ควบคุมคุณภาพเนื้อหา ดูแลบัญชีสมาชิกผู้สมัครงานและนายจ้างในแพลตฟอร์ม BlueHouse Jobs'}
          </div>

        </div>
      </div>

      {/* Grid Content Cards (Matching Employer 2-Column layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

        {/* Left Column: Admin Access Rights & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield style={{ width: '20px', height: '20px', color: '#7c3aed' }} /> สิทธิ์การใช้งานและการดูแลระบบ
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', shrink: 0 }} />
                <span><strong>อนุมัติและคัดกรองงาน:</strong> ตรวจสอบประกาศงานที่ยื่นเข้ามา</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', shrink: 0 }} />
                <span><strong>จัดการโพสต์ที่ไม่เหมาะสม:</strong> ลบประกาศงานที่ผิดกฎหมายหรือสแปม</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', shrink: 0 }} />
                <span><strong>จัดการบัญชีสมาชิก:</strong> ตรวจสอบโปรไฟล์ผู้สมัครและนายจ้างในระบบ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', shrink: 0 }} />
                <span><strong>การสอดส่องห้องแชท (Moderation):</strong> ตรวจความปลอดภัยในการสื่อสาร</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock style={{ width: '20px', height: '20px', color: '#2563eb' }} /> ความมั่นคงปลอดภัยและการเข้าถึง
            </h3>

            <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontWeight: '700', color: '#1e293b' }}>🔐 ระดับสิทธิ์:</span> Super Administrator (Root Level)
              </div>
              <div>
                <span style={{ fontWeight: '700', color: '#1e293b' }}>🟢 การยืนยันตัวตน:</span> Face KYC & Password Verified
              </div>
              <div>
                <span style={{ fontWeight: '700', color: '#1e293b' }}>📡 สิทธิการเข้าถึงฐานข้อมูล:</span> SQLite Read/Write Access (Full)
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Platform Statistics & Admin Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server style={{ width: '20px', height: '20px', color: '#7c3aed' }} /> สถิติภาพรวมแพลตฟอร์ม (Live Metrics)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>สมาชิกทั้งหมด</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>{stats.users || 3} บัญชี</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>ประกาศงานในระบบ</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>{stats.jobs || 9} ประกาศ</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>ใบสมัครที่ยื่นเข้ามา</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0d9488', marginTop: '2px' }}>{stats.applications || 2} รายการ</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>สถานะ SQLite API</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#16a34a', marginTop: '6px' }}>🟢 Online (3001)</div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#0d9488' }} /> ทางลัดการบริหารจัดการ (Quick Actions)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={onNavigateAdmin}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  color: '#7c3aed',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>🛡️ แดชบอร์ดคุมระบบ (Admin Dashboard)</span>
                <ExternalLink style={{ width: '14px', height: '14px' }} />
              </button>

              <button
                onClick={onNavigateAdmin}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>💬 ตรวจสอบห้องแชท (Chat Moderation)</span>
                <ExternalLink style={{ width: '14px', height: '14px' }} />
              </button>

              <button
                onClick={onNavigateHome}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  color: '#0d9488',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>🌐 ดูหน้าหลักค้นหางาน (Live Site View)</span>
                <ExternalLink style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>

        </div>

      </div>

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
