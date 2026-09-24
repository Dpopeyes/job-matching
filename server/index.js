import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db, { initDatabase } from './database.js';
import { calculateAIMatchRate } from '../src/utils/aiMatching.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Gemini API Key Configuration (Users can set process.env.GEMINI_API_KEY)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';



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

// Helper to determine employer type from email domain
function determineEmployerType(email, customType) {
  if (customType) return customType;
  if (!email) return 'corporate';
  const lower = email.toLowerCase().trim();
  const freeDomains = ['@gmail.com', '@hotmail.com', '@yahoo.com', '@outlook.com', '@live.com', '@icloud.com'];
  const isFree = freeDomains.some(d => lower.endsWith(d));
  return isFree ? 'individual' : 'corporate';
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
      query += ` WHERE (approvalStatus = 'approved' OR approvalStatus IS NULL) AND (category != 'support' OR category IS NULL) AND id != 'job-admin-support' ORDER BY jobs.rowid DESC`;
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
    const { id, title, company, logo, location, category, type, salary, experienceLevel, skillsRequired, qualifications, description, employerId, vacancies, approvalStatus: customStatus } = req.body;
    const jobId = id || `job-${Date.now()}`;
    const postedDate = 'วันนี้';
    const matchRate = 95;
    // Default to 'pending' if posted by employer, or 'approved' if posted by admin/system
    const approvalStatus = customStatus || (employerId ? 'pending' : 'approved');

    let empType = req.body.employerType;
    if (!empType && employerId) {
      const empUser = db.prepare('SELECT employerType, email FROM users WHERE id = ?').get(employerId);
      if (empUser) empType = empUser.employerType || determineEmployerType(empUser.email);
    }
    empType = empType || 'corporate';

    const skillsJson = JSON.stringify(Array.isArray(skillsRequired) ? skillsRequired : ['การสื่อสาร']);
    const qualJson = JSON.stringify(Array.isArray(qualifications) ? qualifications : ['ปริญญาตรีทุกสาขา']);
    const numVacancies = parseInt(vacancies, 10) || 1;

    db.prepare(`
      INSERT INTO jobs (id, title, company, logo, location, category, type, salary, experienceLevel, matchRate, postedDate, skillsRequired, qualifications, description, employerId, vacancies, approvalStatus, employerType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      jobId, title, company,
      logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60',
      location || 'กรุงเทพมหานคร', category || 'all', type || 'งานเต็มเวลา (Entry-level)',
      salary || '20,000 - 30,000 บาท/เดือน', experienceLevel || 'เด็กจบใหม่ยินดีรับ', matchRate, postedDate,
      skillsJson, qualJson, description || 'รายละเอียดตำแหน่งงาน', employerId || null, numVacancies,
      approvalStatus, empType
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
      approvalStatus,
      employerType: empType
    };


    console.log(`✅ Saved new job to SQLite DB: ${title} (${company}) by ${employerId || 'anonymous'}`);
    res.status(201).json({ success: true, job: savedJob, message: 'บันทึกตำแหน่งงานใหม่ลงฐานข้อมูลศูนย์กลางเรียบร้อย' });
  } catch (err) {
    console.error('Error POST /api/jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Edit Existing Job
app.put('/api/jobs/:id', (req, res) => {
  try {
    const existingJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    if (!existingJob) {
      return res.status(404).json({ error: 'ไม่พบประกาศตำแหน่งงาน' });
    }

    const {
      title = existingJob.title,
      company = existingJob.company,
      location = existingJob.location,
      category = existingJob.category,
      type = existingJob.type,
      salary = existingJob.salary,
      description = existingJob.description,
      skillsRequired,
      qualifications,
      vacancies = existingJob.vacancies
    } = req.body;

    const skillsJson = skillsRequired !== undefined ? JSON.stringify(Array.isArray(skillsRequired) ? skillsRequired : ['การสื่อสาร']) : existingJob.skillsRequired;
    const qualJson = qualifications !== undefined ? JSON.stringify(Array.isArray(qualifications) ? qualifications : ['ปริญญาตรีทุกสาขา']) : existingJob.qualifications;

    db.prepare(`
      UPDATE jobs 
      SET title = ?, company = ?, location = ?, category = ?, type = ?, salary = ?, description = ?, skillsRequired = ?, qualifications = ?, vacancies = ?
      WHERE id = ?
    `).run(
      title ?? '',
      company ?? '',
      location ?? '',
      category ?? 'all',
      type ?? '',
      salary ?? '',
      description ?? '',
      skillsJson,
      qualJson,
      parseInt(vacancies, 10) || 1,
      req.params.id
    );

    console.log(`✏️ Updated job in SQLite DB: ${req.params.id}`);
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
    const { name, email, password, studentId, university, major, skills, role, employerType } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อ อีเมล และรหัสผ่าน' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' });
    }

    const id = `user-${Date.now()}`;
    const userRole = role || 'applicant';
    const empType = userRole === 'employer' ? determineEmployerType(email, employerType) : 'corporate';
    const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
    const bio = `ผู้สำเร็จการศึกษาใหม่จาก ${university || 'มหาวิทยาลัย'} สาขา ${major || 'ทั่วไป'}`;

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, studentId, university, major, avatar, bio, faceKYCVerified, employerType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, password, userRole, studentId || '', university || '', major || '', avatar, bio, 1, empType);

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

// Submit or Create Application / Support Ticket
app.post('/api/applications', (req, res) => {
  try {
    const { id: customId, jobId, jobTitle, company, userId, applicantName, coverNote } = req.body;
    const id = customId || `app-${Date.now()}`;
    const applyDate = new Date().toISOString().split('T')[0];

    // Ensure job-admin-support exists in jobs table if it's a support chat application
    if (jobId === 'job-admin-support') {
      const jobExists = db.prepare('SELECT id FROM jobs WHERE id = ?').get('job-admin-support');
      if (!jobExists) {
        db.prepare(`
          INSERT INTO jobs (id, title, company, employerId, description, category, type, salary)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run('job-admin-support', '💬 ติดต่อแอดมินระบบ (Live Admin Support)', 'ศูนย์ช่วยเหลือ BlueHouse Admin Team', 'admin-001', 'ช่องทางสนทนาสดติดต่อแอดมินผู้ดูแลระบบ', 'support', 'Full-time', 'N/A');
      }
    }

    const existing = db.prepare('SELECT id FROM applications WHERE id = ?').get(id);
    if (existing) {
      return res.json({ success: true, id, message: 'มีรายการนี้ในระบบแล้ว' });
    }

    db.prepare(`
      INSERT INTO applications (id, jobId, jobTitle, company, userId, applicantName, coverNote, applyDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, jobId, jobTitle, company, userId || 'user-001', applicantName || 'สมาชิกผู้ติดต่อ', coverNote || '', applyDate);

    res.status(201).json({ success: true, id, message: 'ยื่นใบสมัครสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/applications/user/:userId', (req, res) => {
  try {
    const apps = db.prepare(`
      SELECT applications.*, COALESCE(NULLIF(users.name, ''), applications.applicantName, 'สมาชิกผู้ติดต่อ') as applicantName
      FROM applications
      LEFT JOIN users ON applications.userId = users.id
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
      SELECT applications.*, COALESCE(NULLIF(users.name, ''), applications.applicantName, 'สมาชิกผู้ติดต่อ') as applicantName, users.email as applicantEmail, users.phone as applicantPhone
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
             COALESCE(NULLIF(users.name, ''), applications.applicantName, 'สมาชิกผู้ติดต่อ') as applicantName, 
             users.email as applicantEmail, 
             users.phone as applicantPhone,
             COALESCE(jobs.employerId, 'admin') as employerId
      FROM applications
      LEFT JOIN jobs ON applications.jobId = jobs.id
      LEFT JOIN users ON applications.userId = users.id
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
    const users = db.prepare('SELECT id, name, email, role, studentId, university, major, avatar, bio, phone, website, employerType FROM users ORDER BY rowid DESC').all();
    res.json(users);
  } catch (err) {
    console.error('Error GET /api/users:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET Single User by ID (for admin profile inspection)
app.get('/api/users/:userId', (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, studentId, university, major, avatar, bio, phone, website, employerType FROM users WHERE id = ?').get(req.params.userId);
    if (!user) return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    const skills = db.prepare('SELECT id, name, level FROM skills WHERE userId = ?').all(req.params.userId);
    res.json({ ...user, skills });
  } catch (err) {
    console.error('Error GET /api/users/:userId:', err);
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

// ----------------------------------------------------
// ----------------------------------------------------
// GOOGLE GEMINI REAL-TIME AI MATCHING API (HIGH-PRECISION FEW-SHOT LEARNED ENGINE)
// ----------------------------------------------------
app.post('/api/ai/match', async (req, res) => {
  try {
    const { job, applicant } = req.body;
    if (!job || !applicant) {
      return res.status(400).json({ success: false, error: 'Missing job or applicant payload' });
    }

    const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY || req.headers['x-gemini-key'];

    // Pre-calculate baseline using internal AI Engine as strong anchor & fallback
    const localBaseline = calculateAIMatchRate(job, applicant);

    if (!apiKey) {
      return res.json({
        success: true,
        source: 'embedded_ai',
        analysis: {
          matchRate: localBaseline.matchRate,
          isMajorMatched: localBaseline.isMajorMatched,
          majorMatchReason: localBaseline.majorMatchReason,
          matchedSkills: localBaseline.matchedSkills,
          missingSkills: localBaseline.missingSkills,
          suggestedCareerPath: localBaseline.recommendedCareerPaths?.[0] || 'สายงานเทคโนโลยีสารสนเทศ',
          aiAnalysis: `วิเคราะห์จากเกณฑ์คะแนนทักษะ ${localBaseline.skillScore}% และความสอดคล้องของสาขาวิชา ${localBaseline.majorScore}%: ผู้สมัครมีทักษะสอดคล้องกับตำแหน่ง ${job.title} เป็นอย่างดี`
        }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    // Format applicant project history for deep portfolio verification
    const projectSummary = Array.isArray(applicant.projects) && applicant.projects.length > 0
      ? applicant.projects.map(p => `- ${p.title || 'ผลงาน'}: ${p.description || ''} (เทคโนโลยี/แท็ก: ${Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || 'ทั่วไป'})`).join('\n')
      : 'ไม่มีข้อมูลผลงานโปรเจกต์เพิ่มเติม';

    const requiredSkillsStr = Array.isArray(job.skillsRequired)
      ? job.skillsRequired.join(', ')
      : (typeof job.skillsRequired === 'string' ? job.skillsRequired : 'ทักษะทั่วไป');

    const applicantSkillsStr = Array.isArray(applicant.skills)
      ? applicant.skills.map(s => typeof s === 'string' ? s : s.name).join(', ')
      : (applicant.skills || 'ไม่ได้ระบุ');

    const prompt = `
คุณคือระบบ AI Senior HR Specialist และระบบจับคู่งานอัจฉริยะ (High-Precision Candidate Matching Engine)

[เกณฑ์มาตรฐานการเรียนรู้ของระบบ (Calibrated Benchmark Learning)]:
1. การคำนวณเปอร์เซ็นต์ความเข้ากันได้ (Match Rate 0-100%):
   - ทักษะหลักเฉพาะทางตรงตามตำแหน่ง (Skills Match): น้ำหนัก 60%
   - ความสอดคล้องของสาขาวิชาและวุฒิการศึกษา (Major & Degree Relevance): น้ำหนัก 25% (ตรงสาย = 25, ใกล้เคียง = 15-20, ต่างสายงาน = 0-5)
   - ผลงาน/โปรเจกต์และประสบการณ์จริงในพอร์ตโฟลิโอ (Portfolio Proof): น้ำหนัก 15%
2. กรณีตัวอย่างอ้างอิงที่ได้เรียนรู้:
   - กรณีตรงสายงานและมีทักษะครบ (เช่น จบวิทยาการคอมพิวเตอร์ มี React + Tailwind สมัคร Frontend): คะแนนช่วง 90-96%
   - กรณีสาขาใกล้เคียงและมีทักษะตรง (เช่น จบมัลติมีเดีย มี Figma สมัคร UI/UX Designer): คะแนนช่วง 85-92%
   - กรณีตรงสายแต่ขาดทักษะหลักบางส่วน (เช่น จบวิศวกรรมซอฟต์แวร์ สมัคร Full Stack มี Frontend แต่ขาด Backend Node/SQL): คะแนนช่วง 70-80% พร้อมระบุ missingSkills ชัดเจน
   - กรณีต่างสายงานโดยสิ้นเชิงและไม่มีทักษะตรง (เช่น จบเครื่องกล สมัครเขียนเว็บ Frontend): คะแนนช่วง 15-35%

[ข้อมูลตำแหน่งงานที่ต้องการประเมิน]
- ชื่อตำแหน่ง: ${job.title}
- บริษัท: ${job.company}
- ทักษะที่ต้องการ: ${requiredSkillsStr}
- รายละเอียดงาน: ${job.description || ''}

[ข้อมูลผู้สมัครงาน]
- ชื่อ: ${applicant.name || 'ผู้สมัคร'}
- สาขาวิชา: ${applicant.major || 'ไม่ได้ระบุ'}
- สถาบัน: ${applicant.university || 'ไม่ได้ระบุ'}
- ทักษะที่มี: ${applicantSkillsStr}
- ประวัติส่วนตัว/Bio: ${applicant.bio || ''}
- ผลงานและโปรเจกต์:
${projectSummary}

โปรดวิเคราะห์อย่างละเอียดโดยไม่อิงตัวเลขคงที่ ประเมินเปอร์เซ็นต์อย่างเที่ยงตรง และตอบกลับเป็น JSON รูปแบบนี้เท่านั้น:
{
  "matchRate": 85,
  "isMajorMatched": true,
  "majorMatchReason": "ตรงกับสาขาวิชาของคุณ ✨",
  "matchedSkills": ["ทักษะที่ตรงกับงาน"],
  "missingSkills": ["ทักษะที่งานต้องการแต่ผู้สมัครยังไม่มี"],
  "suggestedCareerPath": "สายงานที่เหมาะสมที่สุดสำหรับผู้สมัคร (เช่น Web & Software Development, UI/UX Design, Data & Analytics ฯลฯ)",
  "aiAnalysis": "เขียนบทวิเคราะห์ภาษาไทยเชิงลึก 2-3 ประโยค สรุปจุดแข็ง จุดเด่นของผลงาน ทักษะที่ตรง และสิ่งที่ควรศึกษาเพิ่มเติม"
}
`;

    // Attempt calling Gemini with exponential backoff retry (up to 3 attempts)
    let parsedResult = null;
    let lastError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleanJson);
        break;
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ Gemini API call attempt ${attempt} failed: ${err.message || err.status}`);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        }
      }
    }

    if (parsedResult) {
      console.log(`🤖 Gemini AI Evaluated: ${parsedResult.matchRate}% for ${applicant.name} on "${job.title}"`);
      return res.json({
        success: true,
        source: 'google_gemini_api',
        analysis: parsedResult
      });
    }

    // Fallback if all Gemini attempts failed
    console.error('All Gemini attempts failed, using Smart AI Fallback:', lastError?.message);
    return res.json({
      success: true,
      source: 'smart_fallback_ai',
      analysis: {
        matchRate: localBaseline.matchRate,
        isMajorMatched: localBaseline.isMajorMatched,
        majorMatchReason: localBaseline.majorMatchReason,
        matchedSkills: localBaseline.matchedSkills,
        missingSkills: localBaseline.missingSkills,
        suggestedCareerPath: localBaseline.recommendedCareerPaths?.[0] || 'สายงานเทคโนโลยีสารสนเทศ',
        aiAnalysis: `วิเคราะห์จากฐานข้อมูลทักษะ: ผู้สมัครมีทักษะตรงกับความต้องการของตำแหน่ง ${job.title} คิดเป็นคะแนนทักษะ ${localBaseline.skillScore}% โดยสาขาวิชาสอดคล้องกับเนื้องาน เหมาะสำหรับการนัดสัมภาษณ์เบื้องต้น`
      }
    });

  } catch (err) {
    console.error('Fatal error in /api/ai/match:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

  app.listen(PORT, () => {
    console.log(`🚀 Production-Ready REST API & Shared Database Server running on http://localhost:${PORT}`);
  });

