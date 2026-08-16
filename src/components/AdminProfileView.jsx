import React, { useState, useEffect } from 'react';
import { Building, Mail, Phone, Edit, CheckCircle2, Camera, X } from 'lucide-react';
import { updateUserProfile } from '../data/api';

export default function AdminProfileView({ user, onUpdateUser, onNavigateAdmin, onNavigateHome }) {
  const [profileData, setProfileData] = useState(user || {});
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || 'Blue gup',
    phone: user?.phone || '02-123-4567',
    major: user?.major || 'เทคโนโลยีสารสนเทศ & ซอฟต์แวร์',
    university: user?.university || 'ชลบุรี',
    bio: user?.bio || 'ผู้สำเร็จการศึกษาใหม่จาก ชลบุรี สาขา เทคโนโลยีสารสนเทศ & ซอฟต์แวร์ (ผู้ดูแลระบบกลางสำหรับอนุมัติและคัดกรองงาน)',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  });

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setEditForm({
        name: user.name || 'Blue gup',
        phone: user.phone || '02-123-4567',
        major: user.major || 'เทคโนโลยีสารสนเทศ & ซอฟต์แวร์',
        university: user.university || 'ชลบุรี',
        bio: user.bio || 'ผู้สำเร็จการศึกษาใหม่จาก ชลบุรี สาขา เทคโนโลยีสารสนเทศ & ซอฟต์แวร์ (ผู้ดูแลระบบกลางสำหรับอนุมัติและคัดกรองงาน)',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
      });
    }
  }, [user]);

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

      {/* Top Profile Banner Card */}
      <div style={{ overflow: 'hidden', padding: 0, background: '#ffffff', borderRadius: '20px', border: 'none', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
        
        <div style={{ padding: '32px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
              
              {/* Avatar with Camera Icon */}
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowEditModal(true)} title="คลิกเพื่อแก้ไขรูปโปรไฟล์">
                <img
                  src={profileData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={profileData.name}
                  style={{ width: '110px', height: '110px', minWidth: '110px', minHeight: '110px', borderRadius: '24px', objectFit: 'cover', border: '4px solid #ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', background: '#ffffff' }}
                />
                <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: '#3b82f6', color: '#ffffff', padding: '4px', borderRadius: '50%', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera style={{ width: '12px', height: '12px' }} />
                </div>
              </div>

              {/* Title & Info */}
              <div style={{ marginBottom: '4px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {profileData.name || 'Blue gup'}
                  </h1>
                  <span className="badge badge-accent">
                    ✓ Verified Administrator
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building style={{ width: '18px', height: '18px', color: '#0d9488' }} /> {profileData.major || 'เทคโนโลยีสารสนเทศ & ซอฟต์แวร์'} — 📍 {profileData.university || 'ชลบุรี'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail style={{ width: '14px', height: '14px' }} /> {profileData.email || 'hr@ttt.ac.th'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone style={{ width: '14px', height: '14px' }} /> {profileData.phone || '02-123-4567'}</span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ width: '100%', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                  cursor: 'pointer'
                }}
              >
                <Edit style={{ width: '16px', height: '16px' }} /> แก้ไขข้อมูลส่วนตัว
              </button>

              {onNavigateAdmin && (
                <button
                  onClick={onNavigateAdmin}
                  className="btn btn-accent"
                  style={{ fontSize: '0.85rem', padding: '10px 20px', borderRadius: '12px' }}
                >
                  🛡️ ไปยังหน้าควบคุมแดชบอร์ด
                </button>
              )}
            </div>

          </div>

          {/* Green Highlight Box */}
          <div style={{ marginTop: '20px', padding: '16px', background: '#e6fffa', borderRadius: '16px', border: '1px solid #ccfbf1', fontSize: '0.9rem', color: '#0f766e', lineHeight: 1.6 }}>
            <span style={{ fontWeight: '800' }}>ขอบเขตงานและหน้าที่ผู้ดูแลระบบ: </span>
            {profileData.bio || 'ผู้สำเร็จการศึกษาใหม่จาก ชลบุรี สาขา เทคโนโลยีสารสนเทศ & ซอฟต์แวร์'}
          </div>

        </div>
      </div>

      {/* 2-Column Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

        {/* Left Column: Admin Info */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building style={{ width: '20px', height: '20px', color: '#0d9488' }} /> ข้อมูลผู้ดูแลระบบที่เปิดเผยได้
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>ชื่อผู้ดูแลระบบ:</span>
              <span style={{ fontWeight: '700' }}>{profileData.name || 'Blue gup'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>อุตสาหกรรม/แผนก:</span>
              <span style={{ fontWeight: '700' }}>{profileData.major || 'เทคโนโลยีสารสนเทศ & ซอฟต์แวร์'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>อีเมลแอดมิน:</span>
              <span style={{ fontWeight: '700', color: '#2563eb' }}>{profileData.email || 'hr@ttt.ac.th'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>เบอร์โทรศัพท์:</span>
              <span style={{ fontWeight: '700' }}>{profileData.phone || 'ไม่ระบุ'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>ที่ตั้ง:</span>
              <span style={{ fontWeight: '700' }}>📍 {profileData.university || 'ชลบุรี'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Status */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 style={{ width: '20px', height: '20px', color: '#059669' }} /> Status การตรวจสอบและสิทธิ์ผู้ดูแลระบบ
          </h3>

          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
            บัญชีผู้ดูแลระบบของคุณได้รับการยืนยันตัวตน (Verified Administrator) เรียบร้อยแล้ว สามารถอนุมัติประกาศรับสมัครงาน ตรวจสอบแชท และคัดเลือกผู้สมัครได้ทันที
          </p>

          <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: '14px', border: '1px solid #a7f3d0', fontSize: '0.85rem', color: '#047857', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669' }} /> ✓ ยืนยันสิทธิ์ผู้ดูแลระบบเรียบร้อย
          </div>
        </div>

      </div>

      {/* Edit Modal */}
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

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
              ✏️ แก้ไขข้อมูลโปรไฟล์ผู้ดูแลระบบ
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px' }}>
              ปรับปรุงชื่อ ตำแหน่ง/อุตสาหกรรม ที่ตั้ง และเบอร์โทรศัพท์ของคุณ
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  ชื่อผู้ดูแลระบบ
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
                  อุตสาหกรรม / แผนก
                </label>
                <input
                  type="text"
                  value={editForm.major}
                  onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  ที่ตั้งสำนักงาน (จังหวัด)
                </label>
                <input
                  type="text"
                  value={editForm.university}
                  onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                  className="input-field"
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
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  URL รูปโปรไฟล์ (Avatar URL)
                </label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  ขอบเขตงานและหน้าที่
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="input-field"
                  rows={3}
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
                  style={{ flex: 1, padding: '10px' }}
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
