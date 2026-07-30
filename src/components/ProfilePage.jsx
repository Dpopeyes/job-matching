import React, { useState } from 'react';
import { User, QrCode, ExternalLink, GitBranch, Sparkles, Code, GraduationCap, Mail, Phone, Plus, Trash2, Building, Globe, MapPin, FileCheck, CheckCircle2 } from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import { addUserSkill, deleteUserSkill } from '../data/api';

export default function ProfilePage({ user, onUpdateUser }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [userSkills, setUserSkills] = useState(user?.skills || []);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: '#64748b' }}>กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ดิจิทัลของคุณ</p>
      </div>
    );
  }

  const isEmployer = user.role === 'employer';

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    
    setIsAddingSkill(true);
    const res = await addUserSkill(user.id, newSkillName.trim());
    setIsAddingSkill(false);
    
    if (res && res.skills) {
      setUserSkills(res.skills);
      setNewSkillName('');
    } else {
      setUserSkills([...userSkills, { id: `sk-${Date.now()}`, name: newSkillName.trim(), level: 'Intermediate' }]);
      setNewSkillName('');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    const res = await deleteUserSkill(skillId);
    if (res && res.skills) {
      setUserSkills(res.skills);
    } else {
      setUserSkills(userSkills.filter(s => s.id !== skillId));
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', spaceY: '24px' }}>
      
      {/* Profile Banner */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0, marginBottom: '24px' }}>
        <div style={{ height: '140px', background: isEmployer ? 'linear-gradient(135deg, #0f766e, #115e59)' : 'linear-gradient(135deg, #1e40af, #0d9488)', position: 'relative', padding: '16px' }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <span style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', color: '#ffffff', fontSize: '0.75rem', fontWeight: '700', padding: '4px 12px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.3)' }}>
              {isEmployer ? '🏢 องค์กรนายจ้างลงทะเบียนแล้ว' : '🎓 โปรไฟล์ดิจิทัลผู้หางาน'}
            </span>
          </div>
        </div>

        <div style={{ padding: '0 32px 32px 32px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px', marginTop: '-50px', marginBottom: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
              <img 
                src={user.avatar || (isEmployer ? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')} 
                alt={user.name} 
                style={{ width: '110px', height: '110px', minWidth: '110px', minHeight: '110px', borderRadius: '24px', objectFit: 'cover', border: '4px solid #ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', background: '#ffffff' }}
              />
              <div style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {user.companyName || user.name}
                  </h1>
                  <span className={`badge ${isEmployer ? 'badge-accent' : 'badge-success'}`}>
                    {isEmployer ? '✓ Verified Employer' : 'Open to Work'}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isEmployer ? (
                    <><Building style={{ width: '18px', height: '18px', color: '#0d9488' }} /> {user.major || 'อุตสาหกรรมธุรกิจ'} — 📍 {user.university || 'กรุงเทพมหานคร'}</>
                  ) : (
                    <><GraduationCap style={{ width: '18px', height: '18px', color: '#2563eb' }} /> {user.university || 'มหาวิทยาลัย'} — {user.major || 'สาขาวิชา'}</>
                  )}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail style={{ width: '14px', height: '14px' }} /> {user.email}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone style={{ width: '14px', height: '14px' }} /> {user.phone || '02-123-4567'}</span>
                </div>
              </div>
            </div>

            {!isEmployer && (
              <div style={{ width: '100%', display: 'flex', justifyBetween: 'space-between' }}>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="btn btn-accent"
                  style={{ fontSize: '0.85rem', padding: '10px 20px', borderRadius: '12px' }}
                >
                  <QrCode style={{ width: '16px', height: '16px' }} /> แชร์ QR Code & NFC Profile
                </button>
              </div>
            )}

          </div>

          <div style={{ padding: '16px', background: isEmployer ? '#f0fdfa' : '#f0f7ff', borderRadius: '16px', border: isEmployer ? '1px solid #ccfbf1' : '1px solid #bfdbfe', fontSize: '0.9rem', color: isEmployer ? '#0f766e' : '#1e3a8a', lineHeight: 1.6 }}>
            <span style={{ fontWeight: '800' }}>{isEmployer ? 'ข้อมูลองค์กรและสวัสดิการ:' : 'เกี่ยวกับผู้สมัคร:'} </span>
            {user.bio}
          </div>

        </div>
      </div>

      {/* Conditional Content by Role */}
      {isEmployer ? (
        /* EMPLOYER COMPANY PROFILE VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building style={{ width: '20px', height: '20px', color: '#0d9488' }} /> ข้อมูลองค์กรที่เปิดเผยได้
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>ชื่อองค์กร:</span>
                <span style={{ fontWeight: '700' }}>{user.companyName || user.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>ผู้ติดต่อ / HR:</span>
                <span style={{ fontWeight: '700' }}>{user.contactName || user.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>อีเมลธุรกิจ:</span>
                <span style={{ fontWeight: '700', color: '#2563eb' }}>{user.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>เบอร์โทรศัพท์:</span>
                <span style={{ fontWeight: '700' }}>{user.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>สำนักงานใหญ่:</span>
                <span style={{ fontWeight: '700' }}>📍 {user.university || 'กรุงเทพมหานคร'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 style={{ width: '20px', height: '20px', color: '#059669' }} /> สถานะการตรวจสอบองค์กร
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
              องค์กรของคุณได้รับการยืนยันตัวตน (Verified Employer) เรียบร้อยแล้ว สามารถลงประกาศรับสมัครงานและคัดเลือกผู้สมัครได้ทันที
            </p>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '12px', color: '#065f46', fontSize: '0.8rem', fontWeight: '700' }}>
              ✓ ยืนยันสิทธิ์นายจ้างเรียบร้อย
            </div>
          </div>

        </div>
      ) : (
        /* APPLICANT PROFILE VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Left Column: Skills */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', itemsCenter: 'center', justifyBetween: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code style={{ width: '20px', height: '20px', color: '#2563eb' }} /> คลังทักษะ (Skill-based)
              </span>
              <span className="badge badge-primary">{userSkills.length} ทักษะ</span>
            </h3>

            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="เพิ่มทักษะใหม่ เช่น Python..."
                className="input-field"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <button type="submit" disabled={isAddingSkill} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', shrink: 0 }}>
                <Plus style={{ width: '14px', height: '14px' }} /> เพิ่ม
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userSkills.map((skill, idx) => (
                <div key={skill.id || idx} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>{skill.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{skill.level || 'Intermediate'}</div>
                  </div>
                  <Trash2 
                    onClick={() => handleDeleteSkill(skill.id)}
                    style={{ width: '14px', height: '14px', color: '#94a3b8', cursor: 'pointer' }} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Projects */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#0d9488' }} /> ผลงานโครงงาน (Projects Showcase)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {user.projects?.map((proj) => (
                <div key={proj.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', background: '#ffffff' }}>
                  <img 
                    src={proj.image} 
                    alt={proj.title} 
                    style={{ width: '100%', height: '140px', borderRadius: '12px', objectFit: 'cover', marginBottom: '12px' }}
                  />
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>{proj.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, margin: '0 0 10px' }}>{proj.description}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                    {proj.tags?.map((t, i) => (
                      <span key={i} style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                    <a href={proj.demoUrl} target="_blank" rel="noreferrer" onClick={(e) => e.preventDefault()} style={{ color: '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                      <ExternalLink style={{ width: '14px', height: '14px' }} /> ดูตัวอย่าง
                    </a>
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" onClick={(e) => e.preventDefault()} style={{ color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                      <GitBranch style={{ width: '14px', height: '14px' }} /> Source Code
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {showQRModal && (
        <QRCodeModal user={user} onClose={() => setShowQRModal(false)} />
      )}

    </div>
  );
}
