import express from 'express';
import cors from 'cors';
import db, { initDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
initDatabase();

// Helper to safely parse JSON strings or return array/object
function safeJsonParse(str, fallback = []) {
  if (!str) return fallback;
  if (Array.isArray(str) || typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

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
// JOBS APIs (UNIVERSAL SHARED DATABASE)
// ----------------------------------------------------

// GET All Jobs for ALL Browsers and ALL Users
app.get('/api/jobs', (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY rowid DESC').all();
    const formattedJobs = jobs.map(job => ({
      ...job,
      skillsRequired: safeJsonParse(job.skillsRequired, ['การสื่อสาร']),
      qualifications: safeJsonParse(job.qualifications, ['ปริญญาตรีทุกสาขา']),
      responsibilities: safeJsonParse(job.responsibilities, []),
      benefits: safeJsonParse(job.benefits, [])
    }));
    res.json(formattedJobs);
  } catch (err) {
    console.error('Error GET /api/jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST New Job into Universal Shared SQLite DB
app.post('/api/jobs', (req, res) => {
  try {
    const { id, title, company, logo, location, category, type, salary, experienceLevel, skillsRequired, qualifications, description } = req.body;
    const jobId = id || `job-${Date.now()}`;
    const postedDate = 'วันนี้';
    const matchRate = 95;

    const skillsJson = JSON.stringify(Array.isArray(skillsRequired) ? skillsRequired : ['การสื่อสาร']);
    const qualJson = JSON.stringify(Array.isArray(qualifications) ? qualifications : ['ปริญญาตรีทุกสาขา']);

    db.prepare(`
      INSERT INTO jobs (id, title, company, logo, location, category, type, salary, experienceLevel, matchRate, postedDate, skillsRequired, qualifications, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      jobId, title, company,
      logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60',
      location || 'กรุงเทพมหานคร', category || 'all', type || 'งานเต็มเวลา (Entry-level)',
      salary || '20,000 - 30,000 บาท/เดือน', experienceLevel || 'เด็กจบใหม่ยินดีรับ', matchRate, postedDate,
      skillsJson, qualJson, description || 'รายละเอียดตำแหน่งงาน'
    );

    const savedJob = {
      id: jobId, title, company,
      logo: logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60',
      location: location || 'กรุงเทพมหานคร', category: category || 'all', type: type || 'งานเต็มเวลา (Entry-level)',
      salary: salary || '20,000 - 30,000 บาท/เดือน', experienceLevel: experienceLevel || 'เด็กจบใหม่ยินดีรับ', matchRate, postedDate,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : ['การสื่อสาร'],
      qualifications: Array.isArray(qualifications) ? qualifications : ['ปริญญาตรีทุกสาขา'],
      description: description || 'รายละเอียดตำแหน่งงาน'
    };

    console.log(`✅ Saved new job to SQLite DB: ${title} (${company})`);
    res.status(201).json({ success: true, job: savedJob, message: 'บันทึกตำแหน่งงานใหม่ลงฐานข้อมูลศูนย์กลางเรียบร้อย' });
  } catch (err) {
    console.error('Error POST /api/jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE Job from SQLite DB
app.delete('/api/jobs/:id', (req, res) => {
  try {
    const jobId = req.params.id;
    db.prepare('DELETE FROM jobs WHERE id = ?').run(jobId);
    console.log(`🗑️ Deleted job from SQLite DB: ${jobId}`);
    res.json({ success: true, message: 'ลบประกาศตำแหน่งงานเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// AUTHENTICATION & USER PROFILE APIs
// ----------------------------------------------------
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

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, studentId, university, major, avatar, bio, faceKYCVerified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, password, userRole, studentId || '', university || '', major || '', avatar, bio, 1);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.status(201).json({ success: true, user: { ...newUser, skills: [], projects: [] } });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
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

app.get('/api/applications/user/:userId', (req, res) => {
  try {
    const apps = db.prepare('SELECT * FROM applications WHERE userId = ? ORDER BY applyDate DESC').all(req.params.userId);
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Production-Ready REST API & Shared Database Server running on http://localhost:${PORT}`);
});
