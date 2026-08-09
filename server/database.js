import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new DatabaseSync(dbPath);

function ensureColumnExists(tableName, columnName, columnDefinition) {
  try {
    const info = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const exists = info.some(c => c.name.toLowerCase() === columnName.toLowerCase());
    if (!exists) {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
      console.log(`📡 Added missing column [${columnName}] to table [${tableName}]`);
    }
  } catch (e) {
    console.error(`Failed to ensure column ${columnName} in ${tableName}:`, e);
  }
}

export function initDatabase() {
  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'applicant',
      studentId TEXT,
      university TEXT,
      major TEXT,
      avatar TEXT,
      bio TEXT,
      qrCodeUrl TEXT,
      phone TEXT,
      faceKYCVerified INTEGER DEFAULT 1
    )
  `);

  // Create Jobs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      logo TEXT,
      location TEXT,
      category TEXT DEFAULT 'all',
      type TEXT,
      salary TEXT,
      experienceLevel TEXT,
      matchRate INTEGER DEFAULT 90,
      postedDate TEXT,
      skillsRequired TEXT,
      qualifications TEXT,
      responsibilities TEXT,
      benefits TEXT,
      description TEXT,
      employerId TEXT,
      vacancies INTEGER DEFAULT 1
    )
  `);

  // Create Skills Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      level TEXT DEFAULT 'Intermediate'
    )
  `);

  // Create Projects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      demoUrl TEXT,
      githubUrl TEXT,
      image TEXT
    )
  `);

  // Create Applications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      jobTitle TEXT NOT NULL,
      company TEXT NOT NULL,
      userId TEXT NOT NULL,
      coverNote TEXT,
      applyDate TEXT,
      status TEXT DEFAULT 'กำลังพิจารณา (Under Review)'
    )
  `);

  // Create Messages Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      applicationId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      senderName TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  // Ensure all columns exist dynamically for backward compatibility with existing SQLite DB
  ensureColumnExists('jobs', 'category', "TEXT DEFAULT 'all'");
  ensureColumnExists('jobs', 'type', 'TEXT');
  ensureColumnExists('jobs', 'salary', 'TEXT');
  ensureColumnExists('jobs', 'experienceLevel', 'TEXT');
  ensureColumnExists('jobs', 'matchRate', 'INTEGER DEFAULT 90');
  ensureColumnExists('jobs', 'postedDate', 'TEXT');
  ensureColumnExists('jobs', 'skillsRequired', 'TEXT');
  ensureColumnExists('jobs', 'qualifications', 'TEXT');
  ensureColumnExists('jobs', 'responsibilities', 'TEXT');
  ensureColumnExists('jobs', 'benefits', 'TEXT');
  ensureColumnExists('jobs', 'description', 'TEXT');
  ensureColumnExists('jobs', 'employerId', 'TEXT');
  ensureColumnExists('jobs', 'vacancies', 'INTEGER DEFAULT 1');

  ensureColumnExists('users', 'role', "TEXT DEFAULT 'applicant'");
  ensureColumnExists('users', 'studentId', 'TEXT');
  ensureColumnExists('users', 'university', 'TEXT');
  ensureColumnExists('users', 'major', 'TEXT');
  ensureColumnExists('users', 'avatar', 'TEXT');
  ensureColumnExists('users', 'bio', 'TEXT');
  ensureColumnExists('users', 'qrCodeUrl', 'TEXT');
  ensureColumnExists('users', 'phone', 'TEXT');
  ensureColumnExists('users', 'faceKYCVerified', 'INTEGER DEFAULT 1');

  ensureColumnExists('applications', 'jobTitle', 'TEXT');
  ensureColumnExists('applications', 'company', 'TEXT');
  ensureColumnExists('applications', 'coverNote', 'TEXT');
  ensureColumnExists('applications', 'applyDate', 'TEXT');
  ensureColumnExists('applications', 'status', "TEXT DEFAULT 'กำลังพิจารณา (Under Review)'");
  ensureColumnExists('applications', 'interviewDate', 'TEXT');
  ensureColumnExists('applications', 'interviewNote', 'TEXT');

  ensureColumnExists('jobs', 'approvalStatus', "TEXT DEFAULT 'approved'");

  // Create default admin user if not exists
  try {
    const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
    if (!adminExists) {
      db.prepare(`
        INSERT INTO users (id, name, email, password, role, studentId, university, major, avatar, bio, faceKYCVerified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'admin-001', 
        'แอดมินระบบ BlueHouse', 
        'admin@bluehouse.com', 
        'admin1234', 
        'admin', 
        'ADMIN01', 
        'BlueHouse HQ', 
        'ระบบจัดการแพลตฟอร์ม', 
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 
        'ผู้ดูแลระบบกลางสำหรับอนุมัติงานและช่วยเหลือสมาชิกร่วมกัน', 
        1
      );
      console.log('📡 Seeded default admin user: admin@bluehouse.com / admin1234');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
}

export default db;
