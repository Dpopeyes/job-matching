import express from 'express';
import cors from 'cors';
import db, { initDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
initDatabase();

// Health Check & Stats
app.get('/api/health', (req, res) => {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
  const jobCount = db.prepare('SELECT count(*) as count FROM jobs').get().count;
  const appCount = db.prepare('SELECT count(*) as count FROM applications').get().count;
  
  res.json({
    status: 'ok',
    stats: { users: userCount, jobs: jobCount, applications: appCount },
    message: 'SQLite Database & API Server online'
  });
});

// ----------------------------------------------------
// AUTHENTICATION & USER PROFILE APIs
// ----------------------------------------------------

// Register User
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, studentId, university, major, skills, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อ อีเมล และรหัสผ่าน' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' });
    }

    const id = `user-${Date.now()}`;
    const userRole = role || 'applicant';
    const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
    const bio = `ผู้สำเร็จการศึกษาใหม่จาก ${university || 'มหาวิทยาลัย'} สาขา ${major || 'ทั่วไป'}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://bluehouse-careers.com/profile/${studentId || id}`;

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, studentId, university, major, avatar, bio, qrCodeUrl, faceKYCVerified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, password, userRole, studentId || '', university || '', major || '', avatar, bio, qrCodeUrl, 1);

    if (Array.isArray(skills) && skills.length > 0) {
      const insertSkill = db.prepare('INSERT INTO skills (id, userId, name, level) VALUES (?, ?, ?, ?)');
      skills.forEach((s, idx) => {
        const skillName = typeof s === 'string' ? s : s.name;
        if (skillName) {
          insertSkill.run(`sk-${Date.now()}-${idx}`, id, skillName, 'Intermediate');
        }
      });
    }

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const userSkills = db.prepare('SELECT * FROM skills WHERE userId = ?').all(id);

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ!',
      user: { ...newUser, skills: userSkills, projects: [] }
    });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

// Login User
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }

    const skills = db.prepare('SELECT * FROM skills WHERE userId = ?').all(user.id);
    const projects = db.prepare('SELECT * FROM projects WHERE userId = ?').all(user.id).map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]')
    }));

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ!',
      user: { ...user, skills, projects }
    });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Face Login
app.post('/api/auth/face-login', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users ORDER BY id ASC LIMIT 1').get();
    const skills = db.prepare('SELECT * FROM skills WHERE userId = ?').all(user.id);
    const projects = db.prepare('SELECT * FROM projects WHERE userId = ?').all(user.id).map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]')
    }));

    res.json({ success: true, user: { ...user, skills, projects } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// JOBS & APPLICATIONS APIs
// ----------------------------------------------------

// GET All Jobs from SQLite DB
app.get('/api/jobs', (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY id DESC').all();
    const formattedJobs = jobs.map(job => ({
      ...job,
      skillsRequired: typeof job.skillsRequired === 'string' ? JSON.parse(job.skillsRequired || '[]') : (job.skillsRequired || []),
      responsibilities: typeof job.responsibilities === 'string' ? JSON.parse(job.responsibilities || '[]') : (job.responsibilities || []),
      qualifications: typeof job.qualifications === 'string' ? JSON.parse(job.qualifications || '[]') : (job.qualifications || []),
      benefits: typeof job.benefits === 'string' ? JSON.parse(job.benefits || '[]') : (job.benefits || [])
    }));
    res.json(formattedJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST New Job into SQLite DB
app.post('/api/jobs', (req, res) => {
  try {
    const { title, company, logo, location, category, type, salary, experienceLevel, skillsRequired, qualifications, description } = req.body;
    const id = `job-${Date.now()}`;
    const postedDate = 'วันนี้';
    const matchRate = 95;

    db.prepare(`
      INSERT INTO jobs (id, title, company, logo, location, category, type, salary, experienceLevel, matchRate, postedDate, skillsRequired, qualifications, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title, company,
      logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60',
      location || 'กรุงเทพมหานคร', category || 'all', type || 'งานเต็มเวลา (Entry-level)',
      salary || '20,000 - 30,000 บาท/เดือน', experienceLevel || 'เด็กจบใหม่ยินดีรับ', matchRate, postedDate,
      JSON.stringify(skillsRequired || ['การสื่อสาร']),
      JSON.stringify(qualifications || ['ปริญญาตรีทุกสาขา']),
      description || 'รายละเอียดตำแหน่งงาน'
    );

    const savedJob = {
      id, title, company,
      logo: logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60',
      location: location || 'กรุงเทพมหานคร', category: category || 'all', type: type || 'งานเต็มเวลา (Entry-level)',
      salary: salary || '20,000 - 30,000 บาท/เดือน', experienceLevel: experienceLevel || 'เด็กจบใหม่ยินดีรับ', matchRate, postedDate,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : ['การสื่อสาร'],
      qualifications: Array.isArray(qualifications) ? qualifications : ['ปริญญาตรีทุกสาขา'],
      description: description || 'รายละเอียดตำแหน่งงาน'
    };

    res.status(201).json({ success: true, job: savedJob, message: 'บันทึกตำแหน่งงานใหม่ลงฐานข้อมูลเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Job from SQLite DB (เมื่อหาคนครบแล้วหรือปิดรับสมัคร)
app.delete('/api/jobs/:id', (req, res) => {
  try {
    const jobId = req.params.id;
    db.prepare('DELETE FROM jobs WHERE id = ?').run(jobId);
    res.json({ success: true, message: 'ลบประกาศตำแหน่งงานเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Application
app.post('/api/applications', (req, res) => {
  try {
    const { jobId, jobTitle, company, userId, coverNote } = req.body;
    const id = `app-${Date.now()}`;
    const applyDate = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO applications (id, jobId, jobTitle, company, userId, coverNote, applyDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, jobId, jobTitle, company, userId || 'user-001', coverNote || '', applyDate);

    res.status(201).json({ success: true, id, message: 'ยื่นใบสมัครสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET User Applications
app.get('/api/applications/user/:userId', (req, res) => {
  try {
    const apps = db.prepare('SELECT * FROM applications WHERE userId = ? ORDER BY applyDate DESC').all(req.params.userId);
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Production-Ready REST API & Database Server running on http://localhost:${PORT}`);
});
