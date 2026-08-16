import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, ScanFace } from 'lucide-react';
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

  const handleFaceKYCLogin = async () => {
    setIsFaceKYCing(true);
    const result = await faceLoginUser();
    setIsFaceKYCing(false);
    if (result && result.success) {
      onLoginSuccess(result.user);
    } else {
      setErrorMessage(result?.error || 'ไม่สามารถยืนยันตัวตนด้วยสแกนใบหน้าได้');
    }
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

        {/* Real Authentication Form */}
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
              required
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
              required
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

          {/* Quick Demo Login Buttons */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
            <div style={{ fontSize: '0.725rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', textAlign: 'center' }}>
              ⚡ คลิกเข้าสู่ระบบทดสอบด่วนตามบทบาท:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  const res = await loginUser('hr@ttt.ac.th', '123456');
                  setIsLoading(false);
                  if (res?.success) onLoginSuccess(res.user);
                }}
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 12px',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  color: '#0d9488',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🏢 เข้าสู่ระบบในฐานะ "นายจ้าง / HR" (Blue gup)
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  const res = await loginUser('pounzazakub@gmail.com', '123456');
                  setIsLoading(false);
                  if (res?.success) onLoginSuccess(res.user);
                }}
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🎓 เข้าสู่ระบบในฐานะ "ผู้สมัครงาน" (ชยธร)
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  const res = await loginUser('admin@bluehouse.com', 'admin1234');
                  setIsLoading(false);
                  if (res?.success) onLoginSuccess(res.user);
                }}
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 12px',
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  color: '#7c3aed',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🛡️ เข้าสู่ระบบในฐานะ "แอดมิน" (Admin)
              </button>
            </div>
          </div>

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
