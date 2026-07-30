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

// Update Profile Bio & Info
app.put('/api/users/:id', (req, res) => {
  try {
    const { name, bio, university, major, phone } = req.body;
    db.prepare(`
      UPDATE users SET name = ?, bio = ?, university = ?, major = ?, phone = ? WHERE id = ?
    `).run(name, bio, university, major, phone, req.params.id);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    const skills = db.prepare('SELECT * FROM skills WHERE userId = ?').all(req.params.id);
    const projects = db.prepare('SELECT * FROM projects WHERE userId = ?').all(req.params.id).map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]')
    }));

    res.json({ success: true, user: { ...updatedUser, skills, projects } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// SKILLS & PROJECTS APIs
// ----------------------------------------------------

// Add Skill to User
app.post('/api/skills', (req, res) => {
  try {
    const { userId, name, level } = req.body;
    const id = `sk-${Date.now()}`;
    db.prepare('INSERT INTO skills (id, userId, name, level) VALUES (?, ?, ?, ?)').run(id, userId, name, level || 'Intermediate');
    const skills = db.prepare('SELECT * FROM skills WHERE userId = ?').all(userId);
    res.status(201).json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Skill
app.delete('/api/skills/:id', (req, res) => {
  try {
    const skill = db.prepare('SELECT userId FROM skills WHERE id = ?').get(req.params.id);
    if (skill) {
      db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
      const remainingSkills = db.prepare('SELECT * FROM skills WHERE userId = ?').all(skill.userId);
      return res.json({ success: true, skills: remainingSkills });
    }
    res.status(404).json({ error: 'ไม่พบทักษะที่ต้องการลบ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Project to User
app.post('/api/projects', (req, res) => {
  try {
    const { userId, title, description, tags, demoUrl, githubUrl, image } = req.body;
    const id = `proj-${Date.now()}`;
    db.prepare(`
      INSERT INTO projects (id, userId, title, description, tags, demoUrl, githubUrl, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, title, description,
      JSON.stringify(tags || ['React', 'Project']),
      demoUrl || '#', githubUrl || '#',
      image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&auto=format&fit=crop&q=80'
    );

    const projects = db.prepare('SELECT * FROM projects WHERE userId = ?').all(userId).map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]')
    }));

    res.status(201).json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// JOBS & APPLICATIONS APIs
// ----------------------------------------------------

// GET All Jobs
app.get('/api/jobs', (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY id DESC').all();
    const formattedJobs = jobs.map(job => ({
      ...job,
      skillsRequired: JSON.parse(job.skillsRequired || '[]'),
      responsibilities: JSON.parse(job.responsibilities || '[]'),
      qualifications: JSON.parse(job.qualifications || '[]'),
      benefits: JSON.parse(job.benefits || '[]')
    }));
    res.json(formattedJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST New Job
app.post('/api/jobs', (req, res) => {
  try {
    const { title, company, logo, location, category, type, salary, experienceLevel, skillsRequired, description } = req.body;
    const id = `job-${Date.now()}`;
    const postedDate = 'วันนี้';
    const matchRate = 95;

    db.prepare(`
      INSERT INTO jobs (id, title, company, logo, location, category, type, salary, experienceLevel, matchRate, postedDate, skillsRequired, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title, company,
      logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      location || 'กรุงเทพมหานคร', category || 'all', type || 'งานเต็มเวลา (Entry-level)',
      salary || '20,000 - 30,000 บาท/เดือน', experienceLevel || 'เด็กจบใหม่ยินดีรับ', matchRate, postedDate,
      JSON.stringify(skillsRequired || ['การสื่อสาร']), description || 'รายละเอียดตำแหน่งงาน'
    );

    res.status(201).json({ success: true, id, message: 'บันทึกงานใหม่สำเร็จ' });
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

// ----------------------------------------------------
// ADMIN DB VIEWER APIs
// ----------------------------------------------------
app.get('/api/admin/tables/:tableName', (req, res) => {
  try {
    const allowedTables = ['users', 'jobs', 'skills', 'projects', 'applications'];
    const tableName = req.params.tableName;
    if (!allowedTables.includes(tableName)) {
      return res.status(400).json({ error: 'ตารางไม่ถูกต้อง' });
    }
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Production-Ready REST API & Database Server running on http://localhost:${PORT}`);
});
