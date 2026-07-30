import React, { useState } from 'react';
import { User, Mail, Lock, GraduationCap, Code, Plus, Trash2, ArrowRight, CheckCircle2, Building, AlertCircle, Globe, MapPin, FileText, Phone } from 'lucide-react';
import { registerUser } from '../data/api';
import { MOCK_USER } from '../data/mockData';
import { THAI_PROVINCES } from '../data/provinces';

export default function RegisterPage({ onRegisterSuccess, onSwitchToLogin }) {
  const [role, setRole] = useState('applicant'); // 'applicant' or 'employer'
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields for Applicant
  const [applicantData, setApplicantData] = useState({
    name: '',
    email: '',
    phone: '',
    university: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
    major: 'วิทยาการคอมพิวเตอร์ / เทคโนโลยีดิจิทัล',
    password: '',
    skills: ['การสื่อสาร', 'คอมพิวเตอร์', 'การทำงานเป็นทีม'],
    newSkill: ''
  });

  // Form Fields for Real Employer Registration
  const [employerData, setEmployerData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    province: 'กรุงเทพมหานคร',
    website: '',
    industry: 'เทคโนโลยีสารสนเทศ & ซอฟต์แวร์',
    password: '',
    companyBio: 'บริษัทชั้นนำที่พร้อมเปิดรับผู้สมัครรุ่นใหม่และสร้างการเติบโตทางธุรกิจอย่างยั่งยืน'
  });

  const handleAddSkill = () => {
    if (applicantData.newSkill.trim()) {
      setApplicantData({
        ...applicantData,
        skills: [...applicantData.skills, applicantData.newSkill.trim()],
        newSkill: ''
      });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setApplicantData({
      ...applicantData,
      skills: applicantData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmitApplicant = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!applicantData.name || !applicantData.email || !applicantData.password) {
      setErrorMessage('กรุณากรอกชื่อ อีเมล และรหัสผ่าน ให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    const result = await registerUser({
      ...applicantData,
      role: 'applicant'
    });
    setIsLoading(false);

    if (result && result.success) {
      onRegisterSuccess(result.user);
    } else {
      setErrorMessage(result?.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  const handleSubmitEmployer = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!employerData.companyName || !employerData.contactName || !employerData.email || !employerData.phone || !employerData.password) {
      setErrorMessage('กรุณากรอกชื่อบริษัท, ชื่อผู้ติดต่อ, อีเมล, เบอร์โทรศัพท์ และรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    const employerPayload = {
      name: employerData.companyName,
      companyName: employerData.companyName,
      contactName: employerData.contactName,
      email: employerData.email,
      phone: employerData.phone,
      university: employerData.province,
      major: employerData.industry,
      password: employerData.password,
      bio: employerData.companyBio,
      role: 'employer',
      avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80'
    };

    const result = await registerUser(employerPayload);
    setIsLoading(false);

    if (result && result.success) {
      onRegisterSuccess({
        ...result.user,
        companyName: employerData.companyName,
        website: employerData.website
      });
    } else {
      setErrorMessage(result?.error || 'เกิดข้อผิดพลาดในการลงทะเบียนนายจ้าง');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '580px', margin: '30px auto', padding: '0 16px' }}>
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 16px 40px rgba(37, 99, 235, 0.1)',
          border: '1px solid #e2e8f0'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            Account Registration
          </span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 6px' }}>
            สร้างบัญชีผู้ใช้งานใหม่
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            {role === 'applicant' ? 'สร้างโปรไฟล์เน้นทักษะและผลงานสำหรับผู้หางาน' : 'ลงทะเบียนองค์กรนายจ้างเพื่อประกาศรับสมัครงานและเปิดเผยข้อมูลบริษัท'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div 
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle style={{ width: '18px', height: '18px', shrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => { setRole('applicant'); setErrorMessage(''); }}
            style={{
              padding: '14px',
              borderRadius: '16px',
              border: role === 'applicant' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: role === 'applicant' ? '#eff6ff' : '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '6px' }}>
              <GraduationCap style={{ width: '22px', height: '22px', color: role === 'applicant' ? '#2563eb' : '#94a3b8' }} />
              {role === 'applicant' && <CheckCircle2 style={{ width: '18px', height: '18px', color: '#2563eb' }} />}
            </div>
            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>ผู้สมัครงาน (เด็กจบใหม่)</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>สร้างโปรไฟล์หางาน</div>
          </button>

          <button
            type="button"
            onClick={() => { setRole('employer'); setErrorMessage(''); }}
            style={{
              padding: '14px',
              borderRadius: '16px',
              border: role === 'employer' ? '2px solid #0d9488' : '1px solid #cbd5e1',
              background: role === 'employer' ? '#f0fdfa' : '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '6px' }}>
              <Building style={{ width: '22px', height: '22px', color: role === 'employer' ? '#0d9488' : '#94a3b8' }} />
              {role === 'employer' && <CheckCircle2 style={{ width: '18px', height: '18px', color: '#0d9488' }} />}
            </div>
            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>นายจ้าง / HR บริษัท</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>ลงทะเบียนเปิดเผยข้อมูลองค์กร</div>
          </button>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* FORM 1: APPLICANT REGISTRATION */}
        {/* ----------------------------------------------------------- */}
        {role === 'applicant' && (
          <form onSubmit={handleSubmitApplicant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {step === 1 && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    ชื่อ - นามสกุล *
                  </label>
                  <input
                    type="text"
                    value={applicantData.name}
                    onChange={(e) => setApplicantData({ ...applicantData, name: e.target.value })}
                    placeholder="เช่น นายชยธร ดอกกุหลาบ"
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>อีเมลผู้ใช้งาน *</label>
                    <input
                      type="email"
                      value={applicantData.email}
                      onChange={(e) => setApplicantData({ ...applicantData, email: e.target.value })}
                      placeholder="student@example.com"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      value={applicantData.phone}
                      onChange={(e) => setApplicantData({ ...applicantData, phone: e.target.value })}
                      placeholder="081-234-5678"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>มหาวิทยาลัย / สถาบันการศึกษา</label>
                  <input
                    type="text"
                    value={applicantData.university}
                    onChange={(e) => setApplicantData({ ...applicantData, university: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>กำหนดรหัสผ่าน *</label>
                  <input
                    type="password"
                    value={applicantData.password}
                    onChange={(e) => setApplicantData({ ...applicantData, password: e.target.value })}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="input-field"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!applicantData.name || !applicantData.email || !applicantData.password) {
                      setErrorMessage('กรุณากรอกชื่อ อีเมล และรหัสผ่าน ให้ครบถ้วน');
                    } else {
                      setErrorMessage('');
                      setStep(2);
                    }
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: '8px' }}
                >
                  ถัดไป: เพิ่มทักษะ (Skill Tags) <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    คลังทักษะที่คุณถนัด (Skill-based Pool)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      value={applicantData.newSkill}
                      onChange={(e) => setApplicantData({ ...applicantData, newSkill: e.target.value })}
                      placeholder="พิมพ์ทักษะ เช่น การสื่อสาร, MS Excel, Python..."
                      className="input-field"
                    />
                    <button type="button" onClick={handleAddSkill} className="btn btn-secondary" style={{ padding: '0 16px' }}>
                      <Plus style={{ width: '16px', height: '16px' }} /> เพิ่ม
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px' }}>
                  {applicantData.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-skill" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {skill}
                      <Trash2 onClick={() => handleRemoveSkill(skill)} style={{ width: '13px', height: '13px', color: '#ef4444', cursor: 'pointer' }} />
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                    ย้อนกลับ
                  </button>
                  <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                    {isLoading ? 'กำลังลงทะเบียน...' : <><CheckCircle2 style={{ width: '16px', height: '16px' }} /> ยืนยันสมัครสมาชิก</>}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* FORM 2: REAL EMPLOYER REGISTRATION (NO TAX ID) */}
        {/* ----------------------------------------------------------- */}
        {role === 'employer' && (
          <form onSubmit={handleSubmitEmployer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                🏢 ชื่อบริษัท / ชื่อองค์กร (Company Name) *
              </label>
              <input
                type="text"
                value={employerData.companyName}
                onChange={(e) => setEmployerData({ ...employerData, companyName: e.target.value })}
                placeholder="เช่น บริษัท สยามนวัตกรรม จำกัด / Siam Tech Ltd."
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                👤 ชื่อ-นามสกุล ผู้ติดต่อ / HR *
              </label>
              <input
                type="text"
                value={employerData.contactName}
                onChange={(e) => setEmployerData({ ...employerData, contactName: e.target.value })}
                placeholder="เช่น สมชาย ใจดี (ฝ่ายสรรหา)"
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  ✉️ อีเมลติดต่อธุรกิจ (Corporate Email) *
                </label>
                <input
                  type="email"
                  value={employerData.email}
                  onChange={(e) => setEmployerData({ ...employerData, email: e.target.value })}
                  placeholder="hr@company.co.th"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  📞 เบอร์โทรศัพท์ติดต่อ *
                </label>
                <input
                  type="text"
                  value={employerData.phone}
                  onChange={(e) => setEmployerData({ ...employerData, phone: e.target.value })}
                  placeholder="02-123-4567 หรือ 081-999-8888"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  📍 จังหวัดที่ตั้งสำนักงานใหญ่ *
                </label>
                <select
                  value={employerData.province}
                  onChange={(e) => setEmployerData({ ...employerData, province: e.target.value })}
                  className="input-field"
                  style={{ cursor: 'pointer' }}
                >
                  {THAI_PROVINCES.filter(p => !p.includes('ทุกสถานที่')).map((prov, idx) => (
                    <option key={idx} value={prov}>📍 {prov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  🌐 เว็บไซต์องค์กร / เพจบริษัท
                </label>
                <input
                  type="text"
                  value={employerData.website}
                  onChange={(e) => setEmployerData({ ...employerData, website: e.target.value })}
                  placeholder="https://www.company.co.th"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                📝 รายละเอียดแนะนำองค์กรและสวัสดิการ
              </label>
              <textarea
                rows="3"
                value={employerData.companyBio}
                onChange={(e) => setEmployerData({ ...employerData, companyBio: e.target.value })}
                placeholder="ระบุวิสัยทัศน์ วัฒนธรรมองค์กร บรรยากาศการทำงาน..."
                className="input-field"
              ></textarea>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                🔒 กำหนดรหัสผ่านเข้าสู่ระบบ *
              </label>
              <input
                type="password"
                value={employerData.password}
                onChange={(e) => setEmployerData({ ...employerData, password: e.target.value })}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-accent"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', borderRadius: '12px', marginTop: '8px' }}
            >
              {isLoading ? 'กำลังบันทึกข้อมูลองค์กร...' : <><Building style={{ width: '18px', height: '18px' }} /> ลงทะเบียนองค์กรนายจ้างเปิดเผยได้</>}
            </button>

          </form>
        )}

        {/* Switch to Login */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          มีบัญชีอยู่แล้วใช่หรือไม่?{' '}
          <button
            onClick={onSwitchToLogin}
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
            เข้าสู่ระบบ
          </button>
        </div>

      </div>
    </div>
  );
}
