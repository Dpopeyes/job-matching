import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

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
      description TEXT
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

  // Seed Initial Jobs only if table is completely empty
  const jobCount = db.prepare('SELECT count(*) as count FROM jobs').get().count;
  if (jobCount === 0) {
    const insertJob = db.prepare(`
      INSERT INTO jobs (id, title, company, logo, location, category, type, salary, experienceLevel, matchRate, postedDate, skillsRequired, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertJob.run(
      'job-101', 'Frontend Developer (React)', 'สยามนวัตกรรม เทค จำกัด',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      'กรุงเทพมหานคร', 'dev', 'งานเต็มเวลา (Entry-level)', '25,000 - 35,000 บาท/เดือน', 'เด็กจบใหม่ยินดีรับ', 98, 'วันนี้',
      JSON.stringify(['React', 'TypeScript', 'CSS/Tailwind', 'Git']),
      'พัฒนาเว็บแอปพลิเคชันยุคใหม่ด้วย React และ TypeScript ทำงานร่วมกับทีม UX/UI'
    );

    insertJob.run(
      'job-102', 'เจ้าหน้าที่การตลาดดิจิทัล (Digital Marketing)', 'เอเชีย บิสซิเนส กรุ๊ป',
      'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=60',
      'ชลบุรี', 'marketing', 'งานเต็มเวลา', '22,000 - 28,000 บาท/เดือน', 'ประสบการณ์ 0-1 ปี', 92, '1 วันที่แล้ว',
      JSON.stringify(['Digital Marketing', 'Facebook Ads', 'Content Creation', 'SEO']),
      'วางแผนและบริหารจัดการแคมเปญการตลาดออนไลน์ สร้างคอนเทนต์ดึงดูดกลุ่มเป้าหมาย'
    );

    insertJob.run(
      'job-103', 'เจ้าหน้าที่บัญชีและการเงิน (Junior Accountant)', 'ไทยไฟแนนซ์ โฮลดิ้ง',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=60',
      'นนทบุรี', 'finance', 'งานเต็มเวลา (Entry-level)', '20,000 - 25,000 บาท/เดือน', 'เด็กจบใหม่ยินดีรับ', 90, '2 วันที่แล้ว',
      JSON.stringify(['บัญชีการเงิน', 'MS Excel', 'Tax Planning', 'Express Accounting']),
      'จัดทำบัญชีรายรับ-รายจ่าย ตรวจสอบเอกสารทางการเงิน และเตรียมรายงานภาษีประจำเดือน'
    );

    insertJob.run(
      'job-104', 'วิศวกรโยธา / ผู้ช่วยวิศวกรโครงการ', 'บิลเดอร์ เอ็นจิเนียริ่ง จำกัด',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=100&auto=format&fit=crop&q=60',
      'เชียงใหม่', 'engineering', 'งานเต็มเวลา', '24,000 - 32,000 บาท/เดือน', 'เด็กจบใหม่ยินดีรับ', 94, '3 วันที่แล้ว',
      JSON.stringify(['AutoCAD', 'Structural Analysis', 'Project Management', 'การคุมงานก่อสร้าง']),
      'ควบคุมงานก่อสร้างให้เป็นไปตามแบบแปลน ตรวจสอบคุณภาพงานและความปลอดภัยหน้างาน'
    );
  }
}

export default db;
