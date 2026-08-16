import React, { useState, useEffect } from 'react';
import { User, QrCode, ExternalLink, GitBranch, Sparkles, Code, GraduationCap, Mail, Phone, Plus, Trash2, Building, Globe, MapPin, FileCheck, CheckCircle2, Edit, Camera, X } from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import { addUserSkill, deleteUserSkill, fetchUserPortfolio, updateUserProfile, addUserProject, deleteUserProject, updateUserProject } from '../data/api';
const SKILL_SUGGESTIONS = [
  // --- MEDICAL & HEALTHCARE (การแพทย์และสาธารณสุข) ---
  'การพยาบาล (Nursing)', 'ปฐมพยาบาลเบื้องต้น (First Aid)', 'กู้ชีพขั้นพื้นฐาน (CPR)',
  'การวินิจฉัยโรค (Medical Diagnosis)', 'เภสัชกรรม (Pharmacy)', 'ทันตกรรม (Dentistry)',
  'กายภาพบำบัด (Physical Therapy)', 'การดูแลผู้ป่วย (Patient Care)',
  'การวิจัยทางคลินิก (Clinical Research)', 'การทดสอบในห้องปฏิบัติการ (Laboratory Testing)',

  // --- CULINARY & FOOD SERVICES (ศิลปะการทำอาหารและ F&B) ---
  'การทำอาหาร (Culinary Arts)', 'การทำเบเกอรี่และเบเกอรอง (Baking & Pastry)',
  'ความปลอดภัยทางอาหาร (Food Safety / HACCP)', 'บาริสต้าและการทำกาแฟ (Barista & Coffee Making)',
  'การผสมเครื่องดื่ม (Mixology / Bartending)', 'การบริหารจัดการร้านอาหาร (Restaurant Management)',

  // --- ENGINEERING & CRAFTSMANSHIP (วิศวกรรมศาสตร์ ช่างฝีมือ และการก่อสร้าง) ---
  'การเดินสายไฟ (Electrical Installation)', 'งานระบบประปา (Plumbing)', 'งานเชื่อมโลหะ (Welding)',
  'งานไม้และเฟอร์นิเจอร์ (Carpentry)', 'การซ่อมบำรุงรถยนต์ (Auto Mechanics)',
  'การออกแบบโครงสร้าง (Civil Engineering)', 'การเขียนแบบ AutoCAD (CAD Drawing)',
  'สถาปัตยกรรม (Architecture Design)', 'ความปลอดภัยในงานอุตสาหกรรม (Industrial Safety / OSHA)',

  // --- ART, CREATIVE & FASHION (ศิลปะและการออกแบบเชิงสร้างสรรค์) ---
  'การตกแต่งภายใน (Interior Design)', 'การออกแบบแฟชั่น (Fashion Design)', 'การตัดเย็บเสื้อผ้า (Sewing & Tailoring)',
  'วิจิตรศิลป์และการวาดภาพ (Fine Art & Painting)', 'งานประติมากรรม (Sculpture)',
  'การออกแบบเครื่องประดับ (Jewelry Design)', 'การจัดดอกไม้ (Floral Arrangement)',
  'การแต่งหน้าศิลปะ (Makeup Artistry)', 'การทำผมและออกแบบทรงผม (Hair Styling)',

  // --- BUSINESS, FINANCE & LAW (ธุรกิจ การเงิน บัญชี และกฎหมาย) ---
  'การทำบัญชี (Bookkeeping)', 'การตรวจสอบบัญชี (Financial Auditing)',
  'การวางแผนภาษี (Tax Consulting)', 'การวิเคราะห์การลงทุน (Financial Modeling)',
  'การสรรหาบุคลากร (HR Recruitment & Headhunting)', 'กฎหมายธุรกิจ (Corporate Law)',
  'การเจรจาต่อรองสัญญา (Contract Negotiation)', 'การจัดการซัพพลายเชน (Supply Chain Management)',
  'นายหน้าอสังหาริมทรัพย์ (Real Estate Brokerage)', 'การเทรดหุ้นและการลงทุน (Stock Trading)',

  // --- EDUCATION & TRAINING (การศึกษาและการสอน) ---
  'การจัดทำแผนการสอน (Lesson Planning)', 'การบริหารจัดการชั้นเรียน (Classroom Management)',
  'การศึกษาปฐมวัย (Early Childhood Education)', 'การสอนเด็กพิเศษ (Special Education)',
  'การติวและการสอนพิเศษ (Tutoring)', 'การสอนภาษาอังกฤษ (English Teaching / TESOL)',
  'การพัฒนาหลักสูตร (Curriculum Development)',

  // --- TOURISM & HOSPITALITY (การท่องเที่ยวและการบริการ) ---
  'มัคคุเทศก์และการนำเที่ยว (Tour Guiding)', 'การบริหารงานโรงแรม (Hotel Operations)',
  'การวางแผนจัดอีเวนต์ (Event Planning)', 'การบริการลูกค้า (Customer Service)',
  'การจัดการธุรกิจท่องเที่ยว (Travel Agency Management)',

  // --- LANGUAGES & TRANSLATION (ภาษาและการแปล) ---
  'ภาษาอังกฤษเพื่อการสื่อสาร (English Communication)', 'ภาษาจีนกลาง (Mandarin Chinese)',
  'ภาษาญี่ปุ่น (Japanese Language)', 'ภาษาเกาหลี (Korean Language)',
  'ภาษาฝรั่งเศส (French Language)', 'ภาษาเยอรมัน (German Language)',
  'การแปลเอกสาร (Translation)', 'การล่ามฉับพลัน (Simultaneous Interpretation)',

  // --- DIGITAL & CREATIVE DESIGN (การออกแบบดิจิทัลและคอนเทนต์) ---
  'การออกแบบ UI/UX (UI/UX Design)', 'เครื่องมือ Figma (Figma Design)',
  'ตกแต่งภาพด้วย Photoshop (Adobe Photoshop)', 'วาดภาพเวกเตอร์ด้วย Illustrator (Adobe Illustrator)',
  'การตัดต่อวิดีโอ (Video Editing / Premiere Pro)', 'ภาพเคลื่อนไหว (After Effects / Motion Graphics)',
  'การถ่ายภาพและการจัดแสง (Photography)', 'การเขียนคอนเทนต์ (Content Writing)',
  'การเขียนคำโฆษณา (Copywriting)', 'การทำกราฟิก Canva (Canva Graphic)',

  // --- DIGITAL MARKETING (การตลาดดิจิทัล) ---
  'การตลาดออนไลน์ (Digital Marketing)', 'ทำอันดับกูเกิล (SEO Optimization)',
  'ยิงแอดเฟสบุ๊ก (Facebook Ads)', 'โฆษณากูเกิล (Google Ads Marketing)',
  'การวิเคราะห์ข้อมูลเว็บไซต์ (Google Analytics)', 'การจัดการโซเชียลมีเดีย (Social Media Management)',

  // --- TECH & SOFTWARE DEVELOPMENT (ไอทีและการพัฒนาซอฟต์แวร์) ---
  'เขียนเว็บ React.js (React.js)', 'ภาษา JavaScript (ES6+)', 'HTML5 & CSS3',
  'หลังบ้าน Node.js (Node.js & Express)', 'ภาษา Python', 'ภาษา Java', 'ภาษา C++',
  'การจัดการฐานข้อมูล SQL (SQL Database)', 'เครื่องมือ Git / GitHub', 'ภาษา TypeScript',
  'แอปพลิเคชันมือถือ Flutter (Flutter Dev)', 'การพัฒนาเว็บไซต์ WordPress'
];

export default function ProfilePage({ user, onUpdateUser, readOnly = false }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Dynamic Portfolio states from DB
  const [profileData, setProfileData] = useState(user);
  const [userSkills, setUserSkills] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    university: '',
    major: '',
    phone: '',
    bio: '',
    avatar: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Add Project States
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    tags: 'React, JavaScript, CSS',
    demoUrl: '',
    githubUrl: '',
    image: []
  });
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Fetch Portfolio details from DB
  const loadPortfolio = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const data = await fetchUserPortfolio(user.id);
    if (data) {
      setProfileData(data.user);
      setUserSkills(data.skills || []);
      setUserProjects(data.projects || []);
      setEditFormData({
        name: data.user.name || '',
        university: data.user.university || '',
        major: data.user.major || '',
        phone: data.user.phone || '',
        bio: data.user.bio || '',
        avatar: data.user.avatar || ''
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPortfolio();
  }, [user]);

  useEffect(() => {
    if (profileData?.name) {
      document.title = `${profileData.name} - Digital Profile | BlueHouse Jobs`;
    }
    return () => {
      document.title = "BlueHouse Jobs - ศูนย์รวมตำแหน่งงานคุณภาพ";
    };
  }, [profileData]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: '#64748b' }}>กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ดิจิทัลของคุณ</p>
      </div>
    );
  }

  const isEmployer = profileData.role === 'employer';

  const handleSkillInputChange = (val) => {
    setNewSkillName(val);
    if (val.trim() === '') {
      setSkillSuggestions([]);
      setShowSuggestions(false);
    } else {
      const filtered = SKILL_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSkillSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  // Add skill handler
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsAddingSkill(true);
    const res = await addUserSkill(profileData.id, newSkillName.trim(), newSkillLevel);
    setIsAddingSkill(false);

    if (res && res.skills) {
      setUserSkills(res.skills);
      setNewSkillName('');
      setNewSkillLevel('Intermediate');
    } else {
      setUserSkills([...userSkills, { id: `sk-${Date.now()}`, name: newSkillName.trim(), level: newSkillLevel }]);
      setNewSkillName('');
      setNewSkillLevel('Intermediate');
    }
  };

  // Delete skill handler
  const handleDeleteSkill = async (skillId) => {
    const res = await deleteUserSkill(skillId);
    if (res && res.skills) {
      setUserSkills(res.skills);
    } else {
      setUserSkills(userSkills.filter(s => s.id !== skillId));
    }
  };

  // Update profile handler
  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const res = await updateUserProfile(user.id, editFormData);
    setIsSavingProfile(false);
    if (res && res.success) {
      setProfileData(res.user);
      if (onUpdateUser) {
        onUpdateUser(res.user);
      }
      setShowEditProfileModal(false);
    } else {
      alert('ไม่สามารถอัปเดตโปรไฟล์ได้');
    }
  };

  // Edit project click handler
  const handleEditProjectClick = (proj) => {
    setEditingProject(proj);
    setProjectFormData({
      title: proj.title,
      description: proj.description,
      tags: proj.tags ? proj.tags.join(', ') : '',
      demoUrl: proj.demoUrl || '',
      githubUrl: proj.githubUrl || '',
      image: proj.images || []
    });
    setShowAddProjectModal(true);
  };

  // Add / Edit project handler
  const handleAddProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectFormData.title || !projectFormData.description) {
      alert('กรุณากรอกชื่อผลงานและคำอธิบายผลงาน');
      return;
    }

    setIsSavingProject(true);
    const tagsArray = projectFormData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      ...projectFormData,
      tags: tagsArray
    };

    if (editingProject) {
      // Edit Mode
      const res = await updateUserProject(editingProject.id, payload);
      setIsSavingProject(false);
      if (res && res.success) {
        setUserProjects(userProjects.map(p => p.id === editingProject.id ? res.project : p));
        setShowAddProjectModal(false);
        setEditingProject(null);
        setProjectFormData({
          title: '',
          description: '',
          tags: 'React, JavaScript, CSS',
          demoUrl: '',
          githubUrl: '',
          image: []
        });
      } else {
        alert('ไม่สามารถแก้ไขผลงานได้');
      }
    } else {
      // Add Mode
      const res = await addUserProject(user.id, payload);
      setIsSavingProject(false);
      if (res && res.success) {
        setUserProjects([...userProjects, res.project]);
        setShowAddProjectModal(false);
        setProjectFormData({
          title: '',
          description: '',
          tags: 'React, JavaScript, CSS',
          demoUrl: '',
          githubUrl: '',
          image: []
        });
      } else {
        alert('ไม่สามารถเพิ่มผลงานได้');
      }
    }
  };

  // Delete project handler
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('คุณแน่ใจว่าต้องการลบผลงานโครงการนี้หรือไม่?')) {
      const res = await deleteUserProject(projectId);
      if (res && res.success) {
        setUserProjects(userProjects.filter(p => p.id !== projectId));
      } else {
        alert('ไม่สามารถลบผลงานได้');
      }
    }
  };

  const handleImageChange = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImagesChange = (e, callback) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      let results = [];
      let loadedCount = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          results.push(reader.result);
          loadedCount++;
          if (loadedCount === files.length) {
            callback(results);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Profile Banner */}
      <div style={{ overflow: 'hidden', padding: 0, background: '#ffffff', borderRadius: '20px', border: 'none', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>


        <div style={{ padding: '0 32px 32px 32px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px', marginTop: '24px', marginBottom: '20px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', cursor: readOnly ? 'default' : 'pointer' }} onClick={() => !readOnly && setShowEditProfileModal(true)} title={readOnly ? "" : "คลิกเพื่อแก้ไขรูปโปรไฟล์"}>
                <img
                  src={profileData.avatar || (isEmployer ? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')}
                  alt={profileData.name}
                  style={{ width: '110px', height: '110px', minWidth: '110px', minHeight: '110px', borderRadius: '24px', objectFit: 'cover', border: '4px solid #ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', background: '#ffffff' }}
                />
                {!readOnly && (
                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: '#3b82f6', color: '#ffffff', padding: '4px', borderRadius: '50%', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera style={{ width: '12px', height: '12px' }} />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {profileData.name}
                  </h1>
                  <span className={`badge ${isEmployer ? 'badge-accent' : 'badge-success'}`}>
                    {isEmployer ? '✓ Verified Employer' : 'Open to Work'}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isEmployer ? (
                    <><Building style={{ width: '18px', height: '18px', color: '#0d9488' }} /> {profileData.major || 'อุตสาหกรรมธุรกิจ'} — 📍 {profileData.university || 'กรุงเทพมหานคร'}</>
                  ) : (
                    <><GraduationCap style={{ width: '18px', height: '18px', color: '#2563eb' }} /> {profileData.university || 'มหาวิทยาลัย'} — {profileData.major || 'สาขาวิชา'}</>
                  )}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail style={{ width: '14px', height: '14px' }} /> {profileData.email}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone style={{ width: '14px', height: '14px' }} /> {profileData.phone || '02-123-4567'}</span>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {!isEmployer && (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="btn btn-accent"
                  style={{ fontSize: '0.85rem', padding: '10px 20px', borderRadius: '12px' }}
                >
                  <QrCode style={{ width: '16px', height: '16px' }} /> แชร์ QR Code
                </button>
              )}

              {!readOnly && (
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.85rem',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Edit style={{ width: '16px', height: '16px' }} /> แก้ไขข้อมูลส่วนตัว
                </button>
              )}
            </div>

          </div>

          <div style={{ padding: '16px', background: isEmployer ? '#f0fdfa' : '#f0f7ff', borderRadius: '16px', border: isEmployer ? '1px solid #ccfbf1' : '1px solid #bfdbfe', fontSize: '0.9rem', color: isEmployer ? '#0f766e' : '#1e3a8a', lineHeight: 1.6 }}>
            <span style={{ fontWeight: '800' }}>{isEmployer ? 'ข้อมูลองค์กรและสวัสดิการ:' : 'เกี่ยวกับผู้สมัคร:'} </span>
            {profileData.bio || 'ยังไม่มีการระบุคำแนะนำตัวเอง'}
          </div>

        </div>
      </div>

      {/* Loading state indicator */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontWeight: '600' }}>
          กำลังโหลดข้อมูลผลงานและประวัติ...
        </div>
      ) : (
        /* Conditional Content by Role */
        isEmployer ? (
          /* EMPLOYER COMPANY PROFILE VIEW */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building style={{ width: '20px', height: '20px', color: '#0d9488' }} /> ข้อมูลองค์กรที่เปิดเผยได้
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>ชื่อองค์กร:</span>
                  <span style={{ fontWeight: '700' }}>{profileData.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>อุตสาหกรรม:</span>
                  <span style={{ fontWeight: '700' }}>{profileData.major || 'ธุรกิจ / ซอฟต์แวร์'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>อีเมลธุรกิจ:</span>
                  <span style={{ fontWeight: '700', color: '#2563eb' }}>{profileData.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>เบอร์โทรศัพท์:</span>
                  <span style={{ fontWeight: '700' }}>{profileData.phone || 'ไม่ระบุ'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>ที่ตั้ง:</span>
                  <span style={{ fontWeight: '700' }}>📍 {profileData.university || 'กรุงเทพมหานคร'}</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#059669' }} /> Status การตรวจสอบองค์กร
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
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code style={{ width: '20px', height: '20px', color: '#2563eb' }} /> คลังทักษะ (Skill-based)
                </span>
                <span className="badge badge-primary">{userSkills.length} ทักษะ</span>
              </h3>

              {!readOnly && (
                <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px', marginBottom: '16px', position: 'relative' }}>
                  {/* Autocomplete Input Container */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => handleSkillInputChange(e.target.value)}
                      onFocus={() => {
                        if (newSkillName.trim() !== '') {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Small timeout to allow clicking on list items before it closes
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      placeholder="พิมพ์ทักษะ เช่น React, Figma, SEO..."
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
                    />
                    {showSuggestions && skillSuggestions.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        zIndex: 100,
                        marginTop: '4px',
                        maxHeight: '180px',
                        overflowY: 'auto'
                      }}>
                        {skillSuggestions.map((suggestion, i) => (
                          <div
                            key={i}
                            onMouseDown={() => {
                              setNewSkillName(suggestion);
                              setShowSuggestions(false);
                            }}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              color: '#1e293b',
                              transition: 'background 0.2s',
                              borderBottom: i < skillSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Level Dropdown Selector */}
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className="input-field"
                    style={{ width: '130px', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', background: '#ffffff' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>

                  <button type="submit" disabled={isAddingSkill} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', flexShrink: 0 }}>
                    <Plus style={{ width: '14px', height: '14px' }} /> เพิ่ม
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {userSkills.map((skill, idx) => (
                  <div key={skill.id || idx} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>{skill.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{skill.level || 'Intermediate'}</div>
                    </div>
                    {!readOnly && (
                      <Trash2
                        onClick={() => handleDeleteSkill(skill.id)}
                        style={{ width: '14px', height: '14px', color: '#ef4444', cursor: 'pointer' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Projects Showcase */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: '#0d9488' }} /> ผลงานโครงงาน (Projects Showcase)
                </span>
                {!readOnly && (
                  <button
                    onClick={() => setShowAddProjectModal(true)}
                    className="btn btn-primary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      borderRadius: '8px',
                      background: '#0d9488',
                      borderColor: '#0d9488',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus style={{ width: '12px', height: '12px' }} /> เพิ่มผลงาน
                  </button>
                )}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {userProjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    ยังไม่มีข้อมูลผลงาน ลงทะเบียนผลงานชิ้นแรกเพื่อเพิ่มความสนใจให้นายจ้าง!
                  </div>
                ) : (
                  userProjects.map((proj) => (
                    <div key={proj.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', background: '#ffffff', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0, paddingRight: '20px' }}>
                          {proj.title}
                        </h4>
                        {!readOnly && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                            <Edit
                              onClick={() => handleEditProjectClick(proj)}
                              style={{ width: '15px', height: '15px', color: '#2563eb', cursor: 'pointer' }}
                              title="แก้ไขผลงานนี้"
                            />
                            <Trash2
                              onClick={() => handleDeleteProject(proj.id)}
                              style={{ width: '15px', height: '15px', color: '#ef4444', cursor: 'pointer' }}
                              title="ลบผลงานนี้"
                            />
                          </div>
                        )}
                      </div>

                      {/* Multiple Images Horizontal Scroll */}
                      {proj.images && proj.images.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px', scrollbarWidth: 'thin' }}>
                          {proj.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${proj.title}-${idx}`}
                              style={{ width: '220px', height: '140px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
                            />
                          ))}
                        </div>
                      )}

                      <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, margin: '0 0 10px' }}>{proj.description}</p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                        {proj.tags?.map((t, i) => (
                          <span key={i} style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                        {proj.demoUrl && (
                          <a href={proj.demoUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                            <Globe style={{ width: '13px', height: '13px' }} /> ดูตัวอย่าง Demo <ExternalLink style={{ width: '11px', height: '11px' }} />
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                            <GitBranch style={{ width: '13px', height: '13px' }} /> Source Code <ExternalLink style={{ width: '11px', height: '11px' }} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )
      )}

      {/* 📝 Edit Profile Modal Overlay */}
      {showEditProfileModal && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit style={{ width: '20px', height: '20px', color: '#2563eb' }} /> แก้ไขข้อมูลโปรไฟล์
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>

              {/* Circular Avatar Dropzone */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', border: '2px dashed #3b82f6', overflow: 'hidden', cursor: 'pointer', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, (base64) => setEditFormData({ ...editFormData, avatar: base64 }))}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  />
                  {editFormData.avatar ? (
                    <img
                      src={editFormData.avatar}
                      alt="Avatar preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Camera style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                  )}
                </div>
                <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0, fontWeight: '700' }}>คลิกที่วงกลมเพื่ออัปโหลดรูปภาพโปรไฟล์</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  {isEmployer ? 'ชื่อองค์กร / บริษัท' : 'ชื่อ-นามสกุลจริง'}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isEmployer ? 'ที่ตั้งสำนักงานใหญ่' : 'มหาวิทยาลัย / สถาบัน'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.university}
                    onChange={(e) => setEditFormData({ ...editFormData, university: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isEmployer ? 'อุตสาหกรรมธุรกิจ' : 'สาขาวิชา'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.major}
                    onChange={(e) => setEditFormData({ ...editFormData, major: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  {isEmployer ? 'ข้อมูลองค์กรและสวัสดิการ' : 'แนะนำตัวเองโดยย่อ (Bio)'}
                </label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="input-field"
                  style={{ height: '90px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, borderRadius: '12px', padding: '12px' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn btn-primary"
                  style={{ flex: 1, borderRadius: '12px', padding: '12px' }}
                >
                  {isSavingProfile ? 'กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 Add Project Modal Overlay */}
      {showAddProjectModal && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '20px', height: '20px', color: '#0d9488' }} /> {editingProject ? 'แก้ไขผลงานโครงงาน' : 'เพิ่มผลงานโครงงานใหม่'}
              </h3>
              <button
                onClick={() => {
                  setShowAddProjectModal(false);
                  setEditingProject(null);
                  setProjectFormData({
                    title: '',
                    description: '',
                    tags: 'React, JavaScript, CSS',
                    demoUrl: '',
                    githubUrl: '',
                    image: []
                  });
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  ชื่อผลงาน / โครงงาน
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ระบบจองโรงยิมออนไลน์"
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  คำอธิบายรายละเอียดผลงาน
                </label>
                <textarea
                  required
                  placeholder="อธิบายว่าคืออะไร พัฒนาด้วยเทคโนโลยีอะไรบ้าง แก้ไขปัญหาใด..."
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  className="input-field"
                  style={{ height: '90px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  คำสำคัญ / แท็กที่เกี่ยวข้อง (คั่นด้วยจุลภาค `,`)
                </label>
                <input
                  type="text"
                  value={projectFormData.tags}
                  onChange={(e) => setProjectFormData({ ...projectFormData, tags: e.target.value })}
                  className="input-field"
                  placeholder="เช่น React, Node.js, Web App"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  รูปภาพตัวอย่างผลงาน (อัปโหลดได้หลายรูป)
                </label>

                {/* Previews of selected images */}
                {projectFormData.image && projectFormData.image.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px' }}>
                    {projectFormData.image.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '100px', height: '75px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                        <img src={img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = projectFormData.image.filter((_, i) => i !== idx);
                            setProjectFormData({ ...projectFormData, image: updated });
                          }}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(239, 68, 68, 0.85)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            padding: 0,
                            zIndex: 15
                          }}
                        >
                          <X style={{ width: '10px', height: '10px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '14px', border: '2px dashed #cbd5e1', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMultipleImagesChange(e, (base64Array) => {
                      const existing = projectFormData.image || [];
                      setProjectFormData({ ...projectFormData, image: [...existing, ...base64Array] });
                    })}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  />
                  <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <Camera style={{ width: '28px', height: '28px', margin: '0 auto 6px', color: '#94a3b8' }} />
                    <p style={{ fontSize: '0.75rem', margin: 0, fontWeight: '700' }}>คลิกเพื่อเลือกรูปภาพผลงาน (เลือกได้หลายรูป)</p>
                    <p style={{ fontSize: '0.65rem', margin: '2px 0 0', color: '#94a3b8' }}>รองรับไฟล์ PNG, JPG, GIF</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    ลิงก์ Demo (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={projectFormData.demoUrl}
                    onChange={(e) => setProjectFormData({ ...projectFormData, demoUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    ลิงก์ GitHub / Source (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={projectFormData.githubUrl}
                    onChange={(e) => setProjectFormData({ ...projectFormData, githubUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProjectModal(false);
                    setEditingProject(null);
                    setProjectFormData({
                      title: '',
                      description: '',
                      tags: 'React, JavaScript, CSS',
                      demoUrl: '',
                      githubUrl: '',
                      image: []
                    });
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1, borderRadius: '12px', padding: '12px' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="btn btn-primary"
                  style={{ flex: 1, borderRadius: '12px', padding: '12px', background: '#0d9488', borderColor: '#0d9488' }}
                >
                  {isSavingProject ? 'กำลังบันทึก...' : (editingProject ? '💾 บันทึกการแก้ไข' : '💾 เพิ่มผลงานลงบอร์ด')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQRModal && (
        <QRCodeModal user={profileData} onClose={() => setShowQRModal(false)} />
      )}

    </div>
  );
}
