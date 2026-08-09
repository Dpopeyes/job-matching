import express from 'express';
import cors from 'cors';
import db, { initDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
    const { adminView, employerId } = req.query;
    let query = `
      SELECT jobs.*, 
             (SELECT COUNT(*) FROM applications WHERE jobId = jobs.id AND status = 'ผ่านการคัดเลือก (Accepted)') as acceptedCount
      FROM jobs 
    `;
    let params = [];

    if (adminView === 'true') {
      query += ` ORDER BY jobs.rowid DESC`;
    } else if (employerId) {
      query += ` WHERE employerId = ? ORDER BY jobs.rowid DESC`;
      params.push(employerId);
    } else {
      query += ` WHERE approvalStatus = 'approved' ORDER BY jobs.rowid DESC`;
    }

    const jobs = db.prepare(query).all(...params);
    
    const formattedJobs = jobs
      .map(job => ({
        ...job,
        skillsRequired: safeJsonParse(job.skillsRequired, ['การสื่อสาร']),
        qualifications: safeJsonParse(job.qualifications, ['ปริญญาตรีทุกสาขา']),
        responsibilities: safeJsonParse(job.responsibilities, []),
        benefits: safeJsonParse(job.benefits, [])
      }));

    if (adminView !== 'true' && !employerId) {
      res.json(formattedJobs.filter(job => {
        const vacancies = parseInt(job.vacancies, 10) || 1;
        const accepted = parseInt(job.acceptedCount, 10) || 0;
        return accepted < vacancies;
      }));
    } else {
      res.json(formattedJobs);
    }
  } catch (err) {
    console.error('Error GET /api/jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST New Job into Universal Shared SQLite DB
app.post('/api/jobs', (req, res) => {
  try {
    const { id, title, company, logo, location, category, type, salary, experienceLevel, skillsRequired, qualifications, description, employerId, vacancies } = req.body;
    const jobId = id || `job-${Date.now()}`;
    const postedDate = 'วันนี้';
    const matchRate = 95;

    const skillsJson = JSON.stringify(Array.isArray(skillsRequired) ? skillsRequired : ['การสื่อสาร']);
    const qualJson = JSON.stringify(Array.isArray(qualifications) ? qualifications : ['ปริญญาตรีทุกสาขา']);
    const numVacancies = parseInt(vacancies, 10) || 1;

    db.prepare(`
      INSERT INTO jobs (id, title, company, logo, location, category, type, salary, experienceLevel, matchRate, postedDate, skillsRequired, qualifications, description, employerId, vacancies, approvalStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      jobId, title, company,
      logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60',
      location || 'กรุงเทพมหานคร', category || 'all', type || 'งานเต็มเวลา (Entry-level)',
      salary || '20,000 - 30,000 บาท/เดือน', experienceLevel || 'เด็กจบใหม่ยินดีรับ', matchRate, postedDate,
      skillsJson, qualJson, description || 'รายละเอียดตำแหน่งงาน', employerId || null, numVacancies,
      'pending'
    );

    const savedJob = {
      id: jobId, title, company,
      logo: logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60',
      location: location || 'กรุงเทพมหานคร', category: category || 'all', type: type || 'งานเต็มเวลา (Entry-level)',
      salary: salary || '20,000 - 30,000 บาท/เดือน', experienceLevel: experienceLevel || 'เด็กจบใหม่ยินดีรับ', matchRate, postedDate,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : ['การสื่อสาร'],
      qualifications: Array.isArray(qualifications) ? qualifications : ['ปริญญาตรีทุกสาขา'],
      description: description || 'รายละเอียดตำแหน่งงาน',
      employerId: employerId || null,
      vacancies: numVacancies,
      approvalStatus: 'pending'
    };

    console.log(`✅ Saved new job to SQLite DB: ${title} (${company}) by ${employerId || 'anonymous'}`);
    res.status(201).json({ success: true, job: savedJob, message: 'บันทึกตำแหน่งงานใหม่ลงฐานข้อมูลศูนย์กลางเรียบร้อย' });
  } catch (err) {
    console.error('Error POST /api/jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Edit Job in SQLite DB
app.put('/api/jobs/:id', (req, res) => {
  try {
    const { title, company, location, category, type, salary, skillsRequired, qualifications, description, vacancies } = req.body;
    const skillsJson = JSON.stringify(Array.isArray(skillsRequired) ? skillsRequired : []);
    const qualJson = JSON.stringify(Array.isArray(qualifications) ? qualifications : []);
    const numVacancies = parseInt(vacancies, 10) || 1;

    db.prepare(`
      UPDATE jobs 
      SET title = ?, company = ?, location = ?, category = ?, type = ?, salary = ?, skillsRequired = ?, qualifications = ?, description = ?, vacancies = ?
      WHERE id = ?
    `).run(title, company, location, category, type, salary, skillsJson, qualJson, description, numVacancies, req.params.id);

    console.log(`✅ Updated job in SQLite DB: ${title} (${company})`);
    res.json({ success: true, message: 'แก้ไขประกาศตำแหน่งงานสำเร็จ' });
  } catch (err) {
    console.error('Error PUT /api/jobs/:id:', err);
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
    const apps = db.prepare(`
      SELECT applications.*, users.name as applicantName
      FROM applications
      JOIN users ON applications.userId = users.id
      WHERE applications.userId = ?
      ORDER BY applications.rowid DESC
    `).all(req.params.userId);
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Applications for Employer
app.get('/api/applications/employer/:employerId', (req, res) => {
  try {
    const apps = db.prepare(`
      SELECT applications.*, users.name as applicantName, users.email as applicantEmail, users.phone as applicantPhone
      FROM applications
      JOIN jobs ON applications.jobId = jobs.id
      JOIN users ON applications.userId = users.id
      WHERE jobs.employerId = ?
      ORDER BY applications.rowid DESC
    `).all(req.params.employerId);
    res.json(apps);
  } catch (err) {
    console.error('Error GET /api/applications/employer:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET Applications for Admin
app.get('/api/applications/admin', (req, res) => {
  try {
    const apps = db.prepare(`
      SELECT applications.*, 
             users.name as applicantName, 
             users.email as applicantEmail, 
             users.phone as applicantPhone,
             jobs.employerId
      FROM applications
      JOIN jobs ON applications.jobId = jobs.id
      JOIN users ON applications.userId = users.id
      ORDER BY applications.rowid DESC
    `).all();
    res.json(apps);
  } catch (err) {
    console.error('Error GET /api/applications/admin:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Job Approval Status (for Admin)
app.put('/api/jobs/:id/approval', (req, res) => {
  try {
    const { approvalStatus } = req.body;
    db.prepare('UPDATE jobs SET approvalStatus = ? WHERE id = ?').run(approvalStatus, req.params.id);
    console.log(`📡 Updated job ${req.params.id} approvalStatus to: ${approvalStatus}`);
    res.json({ success: true, message: 'อัปเดตสถานะการอนุมัติสำเร็จ' });
  } catch (err) {
    console.error('Error PUT /api/jobs/:id/approval:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Application Status
app.put('/api/applications/:id/status', (req, res) => {
  try {
    const { status, interviewDate, interviewNote } = req.body;
    if (interviewDate !== undefined || interviewNote !== undefined) {
      db.prepare(`
        UPDATE applications 
        SET status = ?, interviewDate = ?, interviewNote = ? 
        WHERE id = ?
      `).run(status, interviewDate || null, interviewNote || null, req.params.id);
    } else {
      db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, req.params.id);
    }
    res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ' });
  } catch (err) {
    console.error('Error PUT /api/applications/:id/status:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET Messages for an Application
app.get('/api/applications/:appId/messages', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM messages WHERE applicationId = ? ORDER BY timestamp ASC').all(req.params.appId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Send Message
app.post('/api/applications/:appId/messages', (req, res) => {
  try {
    const { senderId, senderName, content } = req.body;
    const messageId = `msg-${Date.now()}`;
    const timestamp = new Date().toISOString();

    db.prepare(`
      INSERT INTO messages (id, applicationId, senderId, senderName, content, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(messageId, req.params.appId, senderId, senderName, content, timestamp);

    const newMessage = {
      id: messageId,
      applicationId: req.params.appId,
      senderId,
      senderName,
      content,
      timestamp
    };

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Users (Admin only — list all users)
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, university, major, avatar, bio, phone, website FROM users ORDER BY createdAt DESC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Single User by ID (for admin profile inspection)
app.get('/api/users/:userId', (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, studentId, university, major, avatar, bio, phone, website FROM users WHERE id = ?').get(req.params.userId);
    if (!user) return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    const skills = db.prepare('SELECT id, name, level FROM skills WHERE userId = ?').all(req.params.userId);
    res.json({ ...user, skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET User Portfolio (ดึงข้อมูลประวัติและผลงานทั้งหมด)
app.get('/api/users/:userId/portfolio', (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, studentId, university, major, avatar, bio, phone FROM users WHERE id = ?').get(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    }
    const skills = db.prepare('SELECT * FROM skills WHERE userId = ?').all(req.params.userId);
    const projects = db.prepare('SELECT * FROM projects WHERE userId = ?').all(req.params.userId);
    
    res.json({
      user,
      skills,
      projects: projects.map(p => {
        let parsedImages = [];
        try {
          const imgVal = safeJsonParse(p.image, []);
          parsedImages = Array.isArray(imgVal) ? imgVal : (imgVal ? [imgVal] : []);
        } catch (e) {
          parsedImages = p.image ? [p.image] : [];
        }
        if (parsedImages.length === 0) {
          parsedImages = ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&auto=format&fit=crop&q=80'];
        }
        return {
          ...p,
          tags: safeJsonParse(p.tags, []),
          images: parsedImages
        };
      })
    });
  } catch (err) {
    console.error('Error GET /api/users/:userId/portfolio:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Update User Details in SQLite DB
app.put('/api/users/:userId', (req, res) => {
  try {
    const { name, university, major, phone, bio, avatar } = req.body;
    db.prepare(`
      UPDATE users 
      SET name = ?, university = ?, major = ?, phone = ?, bio = ?, avatar = ?
      WHERE id = ?
    `).run(name, university, major, phone, bio, avatar, req.params.userId);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
    console.log(`👤 Updated user profile: ${name} (${req.params.userId})`);
    res.json({ success: true, user: updatedUser, message: 'อัปเดตโปรไฟล์สำเร็จ' });
  } catch (err) {
    console.error('Error PUT /api/users/:userId:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST Add User Project to SQLite DB
app.post('/api/users/:userId/projects', (req, res) => {
  try {
    const { title, description, tags, demoUrl, githubUrl, image } = req.body;
    const projectId = `p-${Date.now()}`;
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
    
    const imageArray = Array.isArray(image) ? image : (image ? [image] : []);
    const imageJson = JSON.stringify(imageArray);

    db.prepare(`
      INSERT INTO projects (id, userId, title, description, tags, demoUrl, githubUrl, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      req.params.userId,
      title,
      description,
      tagsJson,
      demoUrl || '',
      githubUrl || '',
      imageJson
    );

    const newProject = {
      id: projectId,
      userId: req.params.userId,
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      demoUrl: demoUrl || '',
      githubUrl: githubUrl || '',
      images: imageArray
    };

    console.log(`📁 Added new project: ${title} for user ${req.params.userId}`);
    res.status(201).json({ success: true, project: newProject, message: 'เพิ่มผลงานสำเร็จ' });
  } catch (err) {
    console.error('Error POST /api/users/:userId/projects:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE User Project from SQLite DB
app.delete('/api/projects/:projectId', (req, res) => {
  try {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.projectId);
    console.log(`🗑️ Deleted project from SQLite DB: ${req.params.projectId}`);
    res.json({ success: true, message: 'ลบผลงานสำเร็จ' });
  } catch (err) {
    console.error('Error DELETE /api/projects/:projectId:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Update User Project in SQLite DB
app.put('/api/projects/:projectId', (req, res) => {
  try {
    const { title, description, tags, demoUrl, githubUrl, image } = req.body;
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
    const imageArray = Array.isArray(image) ? image : (image ? [image] : []);
    const imageJson = JSON.stringify(imageArray);

    db.prepare(`
      UPDATE projects
      SET title = ?, description = ?, tags = ?, demoUrl = ?, githubUrl = ?, image = ?
      WHERE id = ?
    `).run(
      title,
      description,
      tagsJson,
      demoUrl || '',
      githubUrl || '',
      imageJson,
      req.params.projectId
    );

    const updatedProject = {
      id: req.params.projectId,
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      demoUrl: demoUrl || '',
      githubUrl: githubUrl || '',
      images: imageArray
    };

    console.log(`📝 Updated project: ${title} (${req.params.projectId})`);
    res.json({ success: true, project: updatedProject, message: 'แก้ไขผลงานสำเร็จ' });
  } catch (err) {
    console.error('Error PUT /api/projects/:projectId:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST Add Skill to SQLite DB
app.post('/api/skills', (req, res) => {
  try {
    const { userId, name, level } = req.body;
    const skillId = `sk-${Date.now()}`;
    db.prepare(`
      INSERT INTO skills (id, userId, name, level)
      VALUES (?, ?, ?, ?)
    `).run(skillId, userId, name, level || 'Intermediate');

    const updatedSkills = db.prepare('SELECT * FROM skills WHERE userId = ?').all(userId);
    console.log(`📡 Added skill: ${name} (${level}) for user ${userId}`);
    res.status(201).json({ success: true, skills: updatedSkills, message: 'เพิ่มทักษะสำเร็จ' });
  } catch (err) {
    console.error('Error POST /api/skills:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE Skill from SQLite DB
app.delete('/api/skills/:skillId', (req, res) => {
  try {
    const skill = db.prepare('SELECT userId FROM skills WHERE id = ?').get(req.params.skillId);
    if (skill) {
      db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.skillId);
      const updatedSkills = db.prepare('SELECT * FROM skills WHERE userId = ?').all(skill.userId);
      console.log(`🗑️ Deleted skill: ${req.params.skillId}`);
      res.json({ success: true, skills: updatedSkills, message: 'ลบทักษะสำเร็จ' });
    } else {
      res.status(404).json({ error: 'ไม่พบข้อมูลทักษะ' });
    }
  } catch (err) {
    console.error('Error DELETE /api/skills/:skillId:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Production-Ready REST API & Shared Database Server running on http://localhost:${PORT}`);
});
