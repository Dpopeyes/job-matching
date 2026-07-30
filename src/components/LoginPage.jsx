import React, { useState } from 'react';
import { Mail, Lock, LogIn, Sparkles, AlertCircle, ScanFace, Building, UserCheck } from 'lucide-react';
import { loginUser, faceLoginUser } from '../data/api';

export default function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFaceKYCing, setIsFaceKYCing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    const result = await loginUser(email, password);
    setIsLoading(false);

    if (result && result.success) {
      onLoginSuccess(result.user);
    } else {
      setErrorMessage(result?.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleQuickDemoApplicant = async () => {
    setIsLoading(true);
    const demoUser = {
      id: 'user-001',
      name: 'นายชยธร ดอกกุหลาบ',
      email: 'pounzazakub@gmail.com',
      role: 'applicant',
      university: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      major: 'สาขาวิทยาการคอมพิวเตอร์',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'ผู้จบใหม่ไฟแรง มีทักษะด้าน Web Development & AI Programming',
      skills: [
        { id: 'sk-1', name: 'React.js', level: 'Advanced' },
        { id: 'sk-2', name: 'Node.js & Express', level: 'Intermediate' },
        { id: 'sk-3', name: 'SQLite / SQL', level: 'Intermediate' },
        { id: 'sk-4', name: 'TailwindCSS / CSS3', level: 'Advanced' }
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'Skill-Based Job Matching System',
          description: 'แพลตฟอร์มจับคู่ตำแหน่งงานจากคลังทักษะและผลงานสำหรับผู้จบใหม่',
          tags: ['React', 'Node.js', 'SQLite'],
          demoUrl: '#',
          githubUrl: '#',
          image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&auto=format&fit=crop&q=80'
        }
      ]
    };
    onLoginSuccess(demoUser);
    setIsLoading(false);
  };

  const handleQuickDemoEmployer = async () => {
    setIsLoading(true);
    const demoEmployer = {
      id: 'emp-001',
      name: 'บริษัท สยามเทคโนโลยี ดีเวลลอปเม้นท์ จำกัด',
      companyName: 'บริษัท สยามเทคโนโลยี ดีเวลลอปเม้นท์ จำกัด',
      contactName: 'คุณสมชาย ใจดี (HR Manager)',
      email: 'hr@siamtech.co.th',
      phone: '02-999-8888',
      role: 'employer',
      university: 'กรุงเทพมหานคร',
      major: 'เทคโนโลยีสารสนเทศ & ซอฟต์แวร์',
      avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80',
      bio: 'องค์กรชั้นนำด้านนวัตกรรมและเทคโนโลยี เปิดรับคนรุ่นใหม่ร่วมสร้างสรรค์ผลงานระดับสากล'
    };
    onLoginSuccess(demoEmployer);
    setIsLoading(false);
  };

  const handleFaceKYCLogin = async () => {
    setIsFaceKYCing(true);
    setTimeout(async () => {
      const result = await faceLoginUser();
      setIsFaceKYCing(false);
      if (result && result.success) {
        onLoginSuccess(result.user);
      } else {
        handleQuickDemoApplicant();
      }
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 16px 40px rgba(37, 99, 235, 0.08)',
          border: '1px solid #e2e8f0'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            Account Login
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 6px' }}>
            เข้าสู่ระบบใช้งาน
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            ยินดีต้อนรับสู่ระบบค้นหางานและลงประกาศงาน
          </p>
        </div>

        {/* Quick Demo Login Bar */}
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', textAlign: 'center' }}>
            ⚡ เลือกบัญชีเพื่อทดสอบระบบได้ทันที:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={handleQuickDemoApplicant}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '8px 10px', borderRadius: '10px' }}
            >
              <UserCheck style={{ width: '14px', height: '14px', color: '#2563eb' }} /> บัญชีผู้หางาน
            </button>

            <button
              type="button"
              onClick={handleQuickDemoEmployer}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '8px 10px', borderRadius: '10px' }}
            >
              <Building style={{ width: '14px', height: '14px', color: '#0d9488' }} /> บัญชีนายจ้าง
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div 
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle style={{ width: '16px', height: '16px', shrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              อีเมลผู้ใช้งาน (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderRadius: '12px', marginTop: '4px' }}
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : <><LogIn style={{ width: '16px', height: '16px' }} /> เข้าสู่ระบบ</>}
          </button>

          {/* Face KYC Login Button */}
          <button
            type="button"
            onClick={handleFaceKYCLogin}
            disabled={isFaceKYCing}
            className="btn btn-accent"
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem', borderRadius: '12px' }}
          >
            <ScanFace style={{ width: '16px', height: '16px' }} />
            {isFaceKYCing ? 'กำลังสแกนใบหน้า...' : 'สแกนใบหน้าเข้าสู่ระบบ (Face KYC)'}
          </button>

        </form>

        {/* Switch to Register */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          ยังไม่มีบัญชีใช่หรือไม่?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontWeight: '800',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            ลงทะเบียนใช้งาน
          </button>
        </div>

      </div>
    </div>
  );
}
