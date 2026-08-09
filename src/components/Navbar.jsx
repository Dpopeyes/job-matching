import React, { useState } from 'react';
import { Briefcase, User, LogIn, UserPlus, FileCheck, Users, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const isEmployer = currentUser?.role === 'employer';

  return (
    <nav className="navbar-fixed">
      <div className="app-container">
        <div className="navbar-inner">
          
          {/* Logo & Project Title featuring JPG Pink Tech Suit Owl Mascot & Josefin Sans Font */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => handleNavClick('home')}
          >
            <div className="brand-logo-box-mini">
              <img 
                src="/logo.jpg" 
                alt="FreshGrad Jobs Pink Owl Logo JPG" 
                style={{ 
                  width: '46px', 
                  height: '46px', 
                  objectFit: 'cover'
                }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  className="font-josefin"
                  style={{ 
                    fontWeight: '800', 
                    fontSize: '1.4rem', 
                    color: '#1e3a8a', 
                    letterSpacing: '-0.02em',
                    lineHeight: 1
                  }}
                >
                  FreshGrad Jobs
                </span>
              </div>
              <p style={{ fontSize: '0.725rem', color: '#64748b', margin: '2px 0 0' }}>ศูนย์รวมตำแหน่งงานและลงประกาศงานทุกประเภท</p>
            </div>
          </div>

          {/* Nav Links Pill */}
          <div className="nav-links-pill" style={{ display: window.innerWidth < 768 ? 'none' : 'flex' }}>
            <button
              onClick={() => handleNavClick('home')}
              className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            >
              <Briefcase style={{ width: '16px', height: '16px' }} />
              หน้าหลัก / ค้นหางาน
            </button>

            {currentUser && (
              currentUser.role === 'admin' ? (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed', fontWeight: '800' }}
                >
                  <ShieldCheck style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
                  🛡️ ควบคุมโพสต์ & แชท
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('applications')}
                  className={`nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
                >
                  {isEmployer ? (
                    <><Users style={{ width: '16px', height: '16px', color: '#0d9488' }} /> รายชื่อผู้สมัครงานที่ยื่นเข้ามา</>
                  ) : (
                    <><FileCheck style={{ width: '16px', height: '16px' }} /> สถานะการสมัครงาน</>
                  )}
                </button>
              )
            )}

            {currentUser?.role !== 'admin' && (
              <button
                onClick={() => handleNavClick('profile')}
                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User style={{ width: '16px', height: '16px' }} />
                {isEmployer ? 'โปรไฟล์องค์กรนายจ้าง' : 'โปรไฟล์ & ผลงาน'}
              </button>
            )}
          </div>

          {/* User Auth Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            {currentUser ? (
              <>
                {/* Clicking badge/avatar toggles the dropdown */}
                <div 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="user-badge-nav"
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    userSelect: 'none',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                >
                  <img 
                    src={currentUser.avatar || (isEmployer ? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')} 
                    alt={currentUser.name} 
                    style={{
                      width: '32px',
                      height: '32px',
                      minWidth: '32px',
                      minHeight: '32px',
                      maxWidth: '32px',
                      maxHeight: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: isEmployer ? '2px solid #0d9488' : '2px solid #2563eb',
                      display: 'block'
                    }}
                  />
                  <div style={{ textAlign: 'left', lineHeight: 1.2, marginRight: '4px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.75rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                      {currentUser.name}
                    </div>
                    <span style={{ fontSize: '0.6rem', color: currentUser.role === 'admin' ? '#7c3aed' : (isEmployer ? '#0d9488' : '#2563eb'), fontWeight: '700' }}>
                      {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : (isEmployer ? 'นายจ้าง' : 'ผู้สมัคร')}
                    </span>
                  </div>
                </div>

                {/* Transparent overlay backdrop to close dropdown when clicking outside */}
                {showDropdown && (
                  <div 
                    onClick={() => setShowDropdown(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'transparent' }}
                  />
                )}

                {/* Dropdown Menu Popup Card */}
                {showDropdown && (
                  <div 
                    className="animate-fade-in"
                    style={{ 
                      position: 'absolute', 
                      top: '45px', 
                      right: 0, 
                      width: '260px', 
                      background: '#ffffff', 
                      borderRadius: '16px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                      zIndex: 1001, 
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {/* User Mini Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <img 
                        src={currentUser.avatar || (isEmployer ? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')} 
                        alt={currentUser.name} 
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isEmployer ? '2px solid #0d9488' : '2px solid #2563eb'
                        }}
                      />
                      <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                        <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {currentUser.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                          บทบาท: {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : (isEmployer ? 'นายจ้าง / HR' : 'นักศึกษา / ผู้สมัคร')}
                        </div>
                      </div>
                    </div>

                    {/* Detailed User Attributes */}
                    <div style={{ textAlign: 'left', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569' }}>
                      {currentUser.role === 'admin' ? (
                        <>
                          <div>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>🛡️ ตำแหน่ง:</span>{' '}
                            {currentUser.major || 'ผู้ดูแลระบบกลาง'}
                          </div>
                          <div>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>📍 สังกัด:</span>{' '}
                            {currentUser.university || 'BlueHouse HQ'}
                          </div>
                        </>
                      ) : isEmployer ? (
                        <>
                          <div>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>🏢 บริษัท/องค์กร:</span>{' '}
                            {currentUser.major || 'ไม่ได้ระบุชื่อบริษัท'}
                          </div>
                          <div>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>📍 ที่ตั้งบริษัท:</span>{' '}
                            {currentUser.university || 'ไม่ได้ระบุที่ตั้ง'}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>🎓 สถาบันการศึกษา:</span>{' '}
                            {currentUser.university || 'ไม่ได้ระบุสถาบัน'}
                          </div>
                          <div>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>📘 สาขาวิชา:</span>{' '}
                            {currentUser.major || 'ไม่ได้ระบุสาขา'}
                          </div>
                        </>
                      )}
                      <div>
                        <span style={{ fontWeight: '700', color: '#1e293b' }}>📧 อีเมล:</span>{' '}
                        {currentUser.email}
                      </div>
                    </div>

                    {/* Log Out Button */}
                    <button 
                      onClick={() => {
                        setShowDropdown(false);
                        setCurrentUser(null);
                      }}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#ef4444',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                        marginTop: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                        e.currentTarget.style.borderColor = '#fca5a5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fecaca';
                      }}
                    >
                      <LogOut style={{ width: '14px', height: '14px' }} /> ลงชื่อออกจากระบบ
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleNavClick('login')}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <LogIn style={{ width: '15px', height: '15px' }} /> เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <UserPlus style={{ width: '15px', height: '15px' }} /> ลงทะเบียน
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
