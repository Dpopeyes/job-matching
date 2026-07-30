import React, { useState } from 'react';
import { X, QrCode, Smartphone, Copy, Check, Share2, Sparkles } from 'lucide-react';

export default function QRCodeModal({ user, onClose }) {
  const [copied, setCopied] = useState(false);
  const profileUrl = `https://bluehouse-careers.com/profile/${user?.studentId || 'B6534066'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900">แชร์ Digital Profile ผ่าน QR / NFC</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          นายจ้างและ HR สามารถสแกนเพื่อเข้าชมทักษะและผลงานโครงงานของคุณได้ทันที
        </p>

        {/* QR Code Container */}
        <div className="p-6 bg-gradient-to-b from-blue-50 to-teal-50 rounded-2xl border border-blue-100/80 inline-block mb-6 shadow-inner relative group">
          <img 
            src={user?.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://bluehouse-careers.com/profile/B6534066'} 
            alt="User Profile QR Code"
            className="w-48 h-48 mx-auto rounded-xl shadow-md border-4 border-white"
          />
          <div className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-teal-700 bg-white/90 py-1 px-3 rounded-full shadow-sm">
            <Smartphone className="w-3.5 h-3.5" /> รองรับการแตะแชร์ผ่าน NFC
          </div>
        </div>

        {/* User Quick Info */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs mb-6">
          <p className="font-bold text-slate-800">{user?.name}</p>
          <p className="text-slate-500">{user?.university} | {user?.major}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary flex-1 text-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอก Profile Link'}
          </button>
          <button
            onClick={() => alert(`จำลองการส่งสัญญาณ NFC Card Profile สำหรับรหัสนักศึกษา: ${user?.studentId}`)}
            className="btn btn-accent text-xs"
          >
            <Share2 className="w-4 h-4" /> แตะส่งด้วย NFC
          </button>
        </div>

      </div>
    </div>
  );
}
