import React, { useState } from 'react';
import { X, QrCode, Smartphone, Copy, Check, Share2 } from 'lucide-react';

export default function QRCodeModal({ user, onClose }) {
  const [copied, setCopied] = useState(false);
  const profileUrl = `${window.location.origin}/profile/${user?.id || 'user-001'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', position: 'relative', textAlign: 'center' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode style={{ width: '22px', height: '22px' }} />
          </div>
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>แชร์ Digital Profile ผ่าน QR / NFC</h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px', lineHeight: 1.4 }}>
          นายจ้างและ HR สามารถสแกนเพื่อเข้าชมทักษะและผลงานโครงงานของคุณได้ทันที
        </p>

        {/* QR Code Container */}
        <div style={{ padding: '24px', background: 'linear-gradient(to bottom, #eff6ff, #f0fdf4)', borderRadius: '20px', border: '1px solid #bfdbfe', display: 'inline-block', marginBottom: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', width: 'auto' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`} 
            alt="User Profile QR Code"
            style={{ width: '180px', height: '180px', marginLeft: 'auto', marginRight: 'auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '4px solid #ffffff', display: 'block' }}
          />
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#0f766e', background: 'rgba(255, 255, 255, 0.9)', padding: '6px 14px', borderRadius: '999px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginLeft: 'auto', marginRight: 'auto', width: 'fit-content' }}>
            <Smartphone style={{ width: '13px', height: '13px' }} /> รองรับการแตะแชร์ผ่าน NFC
          </div>
        </div>

        {/* User Quick Info */}
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.8rem', marginBottom: '16px' }}>
          <p style={{ fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>{user?.name}</p>
          <p style={{ color: '#475569', margin: 0, lineHeight: 1.4 }}>{user?.university} | {user?.major}</p>
        </div>

        {/* Localhost Warning Info */}
        {window.location.hostname === 'localhost' && (
          <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '14px', padding: '12px 14px', fontSize: '0.7rem', color: '#b45309', textAlign: 'left', marginBottom: '16px', lineHeight: 1.45 }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>💡 คำแนะนำสำหรับการสแกนผ่านมือถือ:</strong>
            เนื่องจากระบบรันอยู่บนเครื่องคอมพิวเตอร์ของคุณ (localhost) เพื่อให้มือถือเข้าดูได้จริง:
            <ul style={{ margin: '4px 0 0', paddingLeft: '16px', listStyleType: 'decimal' }}>
              <li>ต่อโทรศัพท์และคอมพิวเตอร์เข้ากับ <strong>Wi-Fi วงเดียวกัน</strong></li>
              <li>เปิดเว็บนี้บนคอมผ่านเลข IP เครื่องแทน localhost (เช่น <code>http://192.168.1.XX:5173</code>) แล้วเปิด QR นี้สแกนอีกครั้งครับ</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCopyLink}
            className="btn"
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '0.8rem',
              fontWeight: '700',
              borderRadius: '12px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
            onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
          >
            {copied ? <Check style={{ width: '14px', height: '14px', color: '#10b981' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
            {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
          </button>
          <button
            onClick={() => alert(`จำลองการส่งสัญญาณ NFC Card Profile สำหรับรหัสนักศึกษา: ${user?.studentId || 'B6534066'}`)}
            className="btn"
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '0.8rem',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488, #0f766e)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)',
              transition: 'box-shadow 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 14px rgba(13, 148, 136, 0.3)'}
            onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 8px rgba(13, 148, 136, 0.2)'}
          >
            <Share2 style={{ width: '14px', height: '14px' }} /> แตะส่งด้วย NFC
          </button>
        </div>

      </div>
    </div>
  );
}
