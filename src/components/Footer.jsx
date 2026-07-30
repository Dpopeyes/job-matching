import React from 'react';
import { ShieldCheck, Heart, Sparkles, Building, Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-900 text-slate-300 py-12">
      <div className="app-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-extrabold text-xl tracking-tight text-white">
                FreshGrad Jobs
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              แพลตฟอร์มศูนย์กลางหางานและลงประกาศรับสมัครงานทุกประเภท คัดกรองจากทักษะ (Skill-based) และเปิดโอกาสให้ผู้สมัครและนายจ้างเชื่อมต่อกันโดยตรง
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" /> บริการสำหรับผู้สมัครและนายจ้าง
            </h4>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                ค้นหางานได้ครบทั้ง 77 จังหวัดทั่วไทย และ Work From Home
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                ผู้ประกอบการลงทะเบียนเปิดเผยข้อมูลองค์กรจริงได้
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                แชร์โปรไฟล์ดิจิทัลผ่าน QR Code และ NFC Card
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> การรับรองความปลอดภัย
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ระบบได้รับการตรวจสอบข้อมูลองค์กรนายจ้างและข้อมูลผู้สมัครด้วยมาตรฐานความปลอดภัยสูงสุดเพื่อการสมัครงานอย่างมั่นใจ
            </p>
          </div>

        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 FreshGrad Jobs. สงวนลิขสิทธิ์ทั้งหมด</p>
          <div className="flex items-center gap-1 text-slate-400">
            แพลตฟอร์มหางานที่รวบรวมงานทุกประเภท <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
