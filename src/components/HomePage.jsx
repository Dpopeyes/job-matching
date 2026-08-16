import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Building, ChevronRight, SlidersHorizontal, Plus, Trash2, Briefcase, Edit, Check } from 'lucide-react';
import { THAI_PROVINCES } from '../data/provinces';
import { calculateJobMatch } from '../utils/matching';

export default function HomePage({ jobs = [], onSelectJob, currentUser, userSkills = [], onRefreshJobs, onAddNewJob, onDeleteJob, onOpenPostJobModal, onOpenEditJobModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('ทุกสถานที่ (ทั่วประเทศไทย)');
  const [sortBy, setSortBy] = useState(currentUser?.role === 'applicant' ? 'match' : 'newest');


  const categories = [
    { id: 'all', label: '🌐 งานทุกประเภท' },
    { id: 'dev', label: '💻 ไอที & ซอฟต์แวร์' },
    { id: 'marketing', label: '📈 การตลาด & การขาย' },
    { id: 'finance', label: '📊 บัญชี & การเงิน' },
    { id: 'engineering', label: '⚙️ วิศวกรรม & ช่าง' },
    { id: 'hr', label: '🏢 HR & ธุรการ' },
    { id: 'design', label: '🎨 ออกแบบ & กราฟิก' },
    { id: 'intern', label: '🎓 ฝึกงาน & พาร์ทไทม์' },
  ];

  // Handle instant job post addition for everyone
  const handleJobPostedSuccess = (newJob) => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSelectedProvince('ทุกสถานที่ (ทั่วประเทศไทย)');

    setEditingJob(null);

    if (onAddNewJob) {
      onAddNewJob(newJob);
    }
    if (onRefreshJobs) {
      onRefreshJobs();
    }
  };

  const handleEditJobClick = (e, job) => {
    e.stopPropagation();
    if (onOpenEditJobModal) {
      onOpenEditJobModal(job);
    }
  };

  const handleDeleteJobClick = (e, jobId) => {
    e.stopPropagation();
    if (window.confirm('คุณต้องการลบประกาศตำแหน่งงานนี้ (ปิดรับสมัคร) หรือไม่?')) {
      if (onDeleteJob) {
        onDeleteJob(jobId);
      }
    }
  };

  // Multi-category filtering logic (Visible to EVERYONE)
  const filteredJobs = (jobs || []).filter((job) => {
    if (!job || !job.title) return false;

    // 1. Search filter
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.skillsRequired && job.skillsRequired.some(s => typeof s === 'string' && s.toLowerCase().includes(searchTerm.toLowerCase())));

    // 2. Category filter
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (job.category) {
        matchesCategory = job.category === selectedCategory;
      } else {
        if (selectedCategory === 'dev' && !job.title.toLowerCase().includes('developer')) matchesCategory = false;
        if (selectedCategory === 'marketing' && !job.title.toLowerCase().includes('การตลาด')) matchesCategory = false;
        if (selectedCategory === 'finance' && !job.title.toLowerCase().includes('บัญชี')) matchesCategory = false;
        if (selectedCategory === 'engineering' && !job.title.toLowerCase().includes('วิศวกร')) matchesCategory = false;
        if (selectedCategory === 'hr' && !job.title.toLowerCase().includes('hr') && !job.title.toLowerCase().includes('ธุรการ')) matchesCategory = false;
        if (selectedCategory === 'design' && !job.title.toLowerCase().includes('ux/ui') && !job.title.toLowerCase().includes('graphic')) matchesCategory = false;
        if (selectedCategory === 'intern' && !job.type.includes('ฝึกงาน')) matchesCategory = false;
      }
    }

    // 3. Province filter
    let matchesProvince = true;
    if (selectedProvince !== 'ทุกสถานที่ (ทั่วประเทศไทย)') {
      if (selectedProvince.includes('Remote')) {
        matchesProvince = job.location.toLowerCase().includes('remote') || job.location.toLowerCase().includes('home');
      } else {
        const provClean = selectedProvince.replace('จังหวัด', '').trim();
        matchesProvince = job.location.includes(provClean);
      }
    }

    return matchesSearch && matchesCategory && (matchesProvince || selectedProvince === 'ทุกสถานที่ (ทั่วประเทศไทย)');
  });

  // Calculate dynamic Match Rate % for all jobs & sort
  const processedJobs = filteredJobs.map(job => {
    const matchInfo = calculateJobMatch(job, currentUser, userSkills);
    return { ...job, _matchInfo: matchInfo };
  }).sort((a, b) => {
    if (sortBy === 'match') {
      return b._matchInfo.matchRate - a._matchInfo.matchRate;
    }
    return 0; // Default order
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>

      {/* 2K High-Res Hero Banner Image */}
      <div style={{ marginBottom: '28px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)', border: '1px solid #e2e8f0' }}>
        <img
          src="/cover.jpg"
          alt="BlueHouse Jobs 2K Cover Banner"
          style={{ width: '100%', height: 'auto', maxHeight: '340px', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Hero Banner Section */}
      <section className="hero-box">
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>


          <h1 className="hero-title">
            ค้นหางานที่ใช่ <span style={{ color: '#2563eb' }}>สมัครงานได้ทุกสาขาอาชีพ</span>
          </h1>

          <p className="hero-subtitle">
            ค้นหาตำแหน่งงานจากบริษัทชั้นนำ คัดกรองทักษะ (Skill-based) ใช้งานง่าย รวดเร็ว
          </p>

          {/* Clean Floating Search Bar */}
          <div className="search-container">
            <div className="search-input-group">
              <Search style={{ width: '18px', height: '18px', color: '#2563eb' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาตำแหน่งงาน, ชื่อบริษัท หรือ ทักษะ..."
              />
            </div>

            <div className="select-group">
              <MapPin style={{ width: '18px', height: '18px', color: '#64748b', shrink: 0 }} />
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                {THAI_PROVINCES.map((prov, idx) => (
                  <option key={idx} value={prov}>
                    📍 {prov}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <Search style={{ width: '16px', height: '16px' }} /> ค้นหา
            </button>
          </div>

        </div>
      </section>

      {/* Personalized Applicant Matching Banner */}
      {currentUser?.role === 'applicant' && (
        <div 
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: '#1e40af', fontSize: '0.95rem' }}>
              <Sparkles style={{ width: '18px', height: '18px', color: '#2563eb' }} />
              🎯 คำนวณ Match Rate เฉพาะบุคคลสำหรับคุณ ({currentUser.name})
            </div>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0' }}>
              วิเคราะห์ความเข้ากันได้จากสาขา: <strong style={{ color: '#0f172a' }}>{currentUser.major || 'สาขาวิทยาการคอมพิวเตอร์'}</strong> | ทักษะของคุณ: <strong style={{ color: '#047857' }}>{userSkills.length > 0 ? `${userSkills.length} ทักษะ` : 'ทักษะในโปรไฟล์'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>เรียงลำดับตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '700',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              <option value="match">🎯 ความเข้ากันได้สูงสุด (Match Rate %)</option>
              <option value="newest">📅 ประกาศใหม่อยู่บน (Newest)</option>
            </select>
          </div>
        </div>
      )}

      {/* Category Pills & Employer Action */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <SlidersHorizontal style={{ width: '20px', height: '20px', color: '#2563eb' }} /> ตำแหน่งงานเปิดรับสมัครทุกประเภท
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
              พบตำแหน่งงานคุณภาพที่ทุกคนมองเห็น {processedJobs.length} รายการ
            </p>
          </div>

          {/* Show Post Job Button ONLY FOR EMPLOYERS */}
          {currentUser && currentUser.role === 'employer' && (
            <button
              onClick={onOpenPostJobModal}
              className="btn btn-accent"
              style={{ fontSize: '0.85rem', padding: '10px 18px', borderRadius: '12px' }}
            >
              <Plus style={{ width: '18px', height: '18px' }} /> ➕ โพสต์ประกาศรับสมัครงาน
            </button>
          )}
        </div>

        {/* Horizontal Scrollable Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '8px 16px', borderRadius: '999px', whitespace: 'nowrap' }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Clean Job Cards Grid or Empty State */}
      {processedJobs.length === 0 ? (
        <div className="clean-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <Briefcase style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>ยังไม่มีประกาศตำแหน่งงานในขณะนี้</h3>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            {currentUser?.role === 'employer' ? 'คุณสามารถกดปุ่ม "➕ โพสต์ประกาศรับสมัครงาน" เพื่อเริ่มลงประกาศงานใหม่ได้ทันที' : 'เมื่อองค์กรนายจ้างลงประกาศรับสมัครงานใหม่ ตำแหน่งงานจะแสดงที่นี่ทันที'}
          </p>
        </div>
      ) : (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
          {processedJobs.map((job) => {
            const matchInfo = job._matchInfo || calculateJobMatch(job, currentUser, userSkills);
            const matchRate = matchInfo.matchRate;
            const isHighMatch = matchRate >= 85;
            const isMediumMatch = matchRate >= 70 && matchRate < 85;

            return (
            <div
              key={job.id}
              className="clean-card"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
              onClick={() => onSelectJob(job)}
            >
              <div>
                {/* Header Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={job.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60'}
                      alt={job.company}
                      style={{ width: '46px', height: '46px', minWidth: '46px', minHeight: '46px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    />
                    <div>
                      <h3 style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                        {job.title}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                        <Building style={{ width: '13px', height: '13px', color: '#2563eb' }} /> {job.company}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '3px 9px',
                        borderRadius: '999px',
                        background: isHighMatch ? '#dcfce7' : isMediumMatch ? '#eff6ff' : '#fff7ed',
                        color: isHighMatch ? '#15803d' : isMediumMatch ? '#1d4ed8' : '#c2410c',
                        border: isHighMatch ? '1px solid #86efac' : isMediumMatch ? '1px solid #bfdbfe' : '1px solid #ffedd5',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isHighMatch && <Sparkles style={{ width: '12px', height: '12px' }} />}
                      Match {matchRate}%
                    </span>
                    {matchInfo.isMajorMatched && currentUser?.role === 'applicant' && (
                      <span style={{ fontSize: '0.625rem', fontWeight: '700', color: '#16a34a', background: '#f0fdf4', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                        ✨ ตรงสายงานของคุณ
                      </span>
                    )}
                    {!matchInfo.isMajorMatched && matchRate < 60 && currentUser?.role === 'applicant' && (
                      <span style={{ fontSize: '0.625rem', fontWeight: '700', color: '#c2410c', background: '#fff7ed', padding: '1px 6px', borderRadius: '4px', border: '1px solid #ffedd5' }}>
                        ⚠️ ต่างสายงาน
                      </span>
                    )}


                    {/* Edit & Delete Job Buttons for Owner Employer */}
                    {currentUser && currentUser.role === 'employer' && job.employerId === currentUser.id && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                        <button
                          onClick={(e) => handleEditJobClick(e, job)}
                          title="แก้ไขประกาศงาน"
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <Edit style={{ width: '12px', height: '12px' }} /> แก้ไข
                        </button>
                        <button
                          onClick={(e) => handleDeleteJobClick(e, job.id)}
                          title="ปิดรับสมัคร / ลบประกาศงาน"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <Trash2 style={{ width: '12px', height: '12px' }} /> ลบ
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges Info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  <span className="badge badge-primary">{job.type || 'งานเต็มเวลา'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                    📍 {job.location || 'กรุงเทพมหานคร'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                    💰 {job.salary || 'ตามตกลง'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: '700', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                    👥 รับ: {job.vacancies || 1} คน
                  </span>
                </div>

                {/* Short Description */}
                <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>

                {/* Skills required with highlight */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {job.skillsRequired && job.skillsRequired.map((skill, idx) => {
                    const skillStr = typeof skill === 'string' ? skill : skill.name;
                    const isMatched = matchInfo.matchedSkills.some(m => 
                      m.toLowerCase().includes(skillStr.toLowerCase()) || skillStr.toLowerCase().includes(m.toLowerCase())
                    );

                    return (
                      <span 
                        key={idx} 
                        style={{ 
                          fontSize: '0.7rem', 
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: isMatched ? '800' : '500',
                          background: isMatched ? '#dcfce7' : '#f1f5f9',
                          color: isMatched ? '#15803d' : '#475569',
                          border: isMatched ? '1px solid #86efac' : '1px solid #e2e8f0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        {isMatched && <Check style={{ width: '11px', height: '11px', color: '#16a34a' }} />}
                        {skillStr}
                      </span>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Card Link */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', marginTop: '14px', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>
                <span>{job.postedDate || 'วันนี้'}</span>
                <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '700' }}>
                  ดูรายละเอียด <ChevronRight style={{ width: '14px', height: '14px' }} />
                </span>
              </div>

            </div>
          );
          })}
        </section>
      )}

    </div>
  );
}

