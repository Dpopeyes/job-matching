import React, { useState } from 'react';
import { Briefcase, User, LogIn, UserPlus, FileCheck, Users } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const isEmployer = currentUser?.role === 'employer';

  return (
    <nav className="navbar-fixed">
      <div className="app-container">
        <div className="navbar-inner">
          
          {/* Logo & Project Title */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => handleNavClick('home')}
          >
            <div className="brand-logo-box">
              <Briefcase style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#1e3a8a' }}>
                  FreshGrad Jobs
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>ศูนย์รวมตำแหน่งงานและลงประกาศงานทุกประเภท</p>
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
            )}

            <button
              onClick={() => handleNavClick('profile')}
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User style={{ width: '16px', height: '16px' }} />
              {isEmployer ? 'โปรไฟล์องค์กรนายจ้าง' : 'โปรไฟล์ & ผลงาน'}
            </button>
          </div>

          {/* User Auth Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentUser ? (
              <div className="user-badge-nav">
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} 
                  alt={currentUser.name} 
                  style={{
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    minHeight: '36px',
                    maxWidth: '36px',
                    maxHeight: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #2563eb',
                    display: 'block'
                  }}
                />
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0f172a' }}>{currentUser.companyName || currentUser.name}</div>
                  <span style={{ fontSize: '0.65rem', color: isEmployer ? '#0d9488' : '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isEmployer ? '🏢 บัญชีองค์กรนายจ้าง' : '🎓 ผู้สมัครงาน'}
                  </span>
                </div>
                <button 
                  onClick={() => setCurrentUser(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginLeft: '8px'
                  }}
                >
                  ออก
                </button>
              </div>
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
