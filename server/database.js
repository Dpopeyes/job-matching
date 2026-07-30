import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'applicant',
      studentId TEXT,
      university TEXT,
      major TEXT,
      academicYear TEXT,
      avatar TEXT,
      bio TEXT,
      qrCodeUrl TEXT,
      faceKYCVerified INTEGER DEFAULT 1
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      logo TEXT,
      location TEXT,
      category TEXT DEFAULT 'ทั่วไป',
      type TEXT,
      salary TEXT,
      experienceLevel TEXT,
      matchRate INTEGER DEFAULT 90,
      postedDate TEXT,
      skillsRequired TEXT,
      description TEXT,
      responsibilities TEXT,
      qualifications TEXT,
      benefits TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      level TEXT DEFAULT 'Intermediate',
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      demoUrl TEXT,
      githubUrl TEXT,
      image TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      jobTitle TEXT NOT NULL,
      company TEXT NOT NULL,
      userId TEXT NOT NULL,
      coverNote TEXT,
      status TEXT DEFAULT 'กำลังพิจารณา (Under Review)',
      statusColor TEXT DEFAULT 'badge-accent',
      notes TEXT,
      applyDate TEXT,
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedData();
}

function seedData() {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
  if (userCount === 0) {
    db.prepare(`
      INSERT INTO users (id, name, email, password, phone, role, studentId, university, major, academicYear, avatar, bio, qrCodeUrl, faceKYCVerified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'user-001',
      'ชยธร ดอกกุหลาบ (ปอนด์)',
      'pounzazakub@gmail.com',
      'password123',
      '066-109-1026',
      'applicant',
      'B6534066',
      'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      'เทคโนโลยีดิจิทัล (Project in Digital Technology)',
      '1/2569',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      'ผู้สำเร็จการศึกษาใหม่มุ่งมั่นพัฒนาทักษะการทำงานในทุกสายอาชีพพร้อมเริ่มงานทันที',
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://bluehouse-careers.com/profile/B6534066',
      1
    );

    const insertSkill = db.prepare('INSERT INTO skills (id, userId, name, level) VALUES (?, ?, ?, ?)');
    insertSkill.run('s1', 'user-001', 'การสื่อสารและการทำงานร่วมกัน', 'Advanced');
    insertSkill.run('s2', 'user-001', 'การวิเคราะห์และแก้ไขปัญหา', 'Advanced');
    insertSkill.run('s3', 'user-001', 'คอมพิวเตอร์และ MS Office', 'Expert');
  }

  // Multi-category jobs seeding
  const jobCount = db.prepare('SELECT count(*) as count FROM jobs').get().count;
  if (jobCount === 0) {
    console.log('🌱 Seeding multi-category jobs into SQLite DB...');
    const insertJob = db.prepare(`
      INSERT INTO jobs (id, title, company, logo, location, category, type, salary, experienceLevel, matchRate, postedDate, skillsRequired, description, responsibilities, qualifications, benefits)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. IT & Dev
    insertJob.run(
      'job-1',
      'Junior Frontend Developer (React / Web)',
      'TechPulse Solutions Ltd.',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      'กรุงเทพมหานคร (BTS อโศก)',
      'dev',
      'งานเต็มเวลา (Entry-level)',
      '28,000 - 38,000 บาท/เดือน',
      'เด็กจบใหม่ยินดีรับ (0-1 ปี)',
      98,
      '2 วันที่แล้ว',
      JSON.stringify(['React', 'JavaScript', 'HTML/CSS', 'Git', 'Responsive Design']),
      'พัฒนา User Interface ของเว็บแอปพลิเคชันยุคใหม่ พร้อมเรียนรู้เทคโนโลยีกับทีมงานมืออาชีพ',
      JSON.stringify(['เขียนโค้ด React.js', 'ปรับแต่งเว็บให้รองรับมือถือ']),
      JSON.stringify(['จบด้านคอมพิวเตอร์หรือสายงานที่เกี่ยวข้อง', 'มีความตั้งใจเรียนรู้']),
      JSON.stringify(['WFH Hybrid', 'ประกันสุขภาพ', 'โบนัสประจำปี'])
    );

    // 2. Marketing & Sales
    insertJob.run(
      'job-2',
      'เจ้าหน้าที่การตลาดดิจิทัล (Digital Marketing Executive)',
      'Siam Content & Media Co., Ltd.',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=60',
      'นนทบุรี',
      'marketing',
      'งานเต็มเวลา (Entry-level)',
      '22,000 - 30,000 บาท/เดือน',
      'เด็กจบใหม่ยินดีรับ',
      94,
      '1 วันที่แล้ว',
      JSON.stringify(['Digital Marketing', 'Facebook Ads', 'TikTok Content', 'SEO', 'Canva']),
      'วางแผนคอนเทนต์และบริหารโฆษณาบนโซเชียลมีเดีย (Facebook, TikTok, IG) เพื่อขยายฐานลูกค้า',
      JSON.stringify(['คิดคอนเทนต์และเขียน Copywriting', 'ยิงโฆษณาโซเชียลมีเดีย', 'สรุปรายงานยอดการเข้าชม']),
      JSON.stringify(['จบปริญญาตรีด้านการตลาด สื่อสารมวลชน หรือนิเทศศาสตร์', 'ใช้ Canva หรือ Photoshop เบื้องต้นได้']),
      JSON.stringify(['ส่วนลดสินค้าบริษัท', 'เบี้ยขยันประจำเดือน', 'อบรมฟรี'])
    );

    // 3. Accounting & Finance
    insertJob.run(
      'job-3',
      'เจ้าหน้าที่บัญชีและการเงิน (Junior Accountant)',
      'Grand Horizon Group',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=60',
      'นครราชสีมา',
      'finance',
      'งานเต็มเวลา (Entry-level)',
      '20,000 - 26,000 บาท/เดือน',
      'เด็กจบใหม่ยินดีรับ',
      91,
      'วันนี้',
      JSON.stringify(['MS Excel', 'Express Program', 'การลงบัญชี', 'ภาษีมูลค่าเพิ่ม VAT']),
      'จัดทำเอกสารรับ-จ่าย บันทึกบัญชีในระบบ Express และประสานงานเรื่องภาษีกับสรรพากร',
      JSON.stringify(['บันทึกเอกสารใบกำกับภาษี', 'ตรวจสอบความถูกต้องของบิลเงินสด', 'สรุปยอดบัญชีรายเดือน']),
      JSON.stringify(['วุฒิปริญญาตรี สาขาการบัญชี หรือการเงิน', 'ละเอียดรอบคอบในการทำงาน']),
      JSON.stringify(['ยูนิฟอร์มฟรี', 'เงินกู้สวัสดิการ', 'ประกันสังคม'])
    );

    // 4. Engineering & Tech
    insertJob.run(
      'job-4',
      'วิศวกรไฟฟ้าโยธาระดับเริ่มต้น (Junior Site Engineer)',
      'Advance Build Engineering',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&auto=format&fit=crop&q=60',
      'ชลบุรี',
      'engineering',
      'งานเต็มเวลา (Entry-level)',
      '25,000 - 32,000 บาท/เดือน',
      'เด็กจบใหม่ยินดีรับ (มีใบ กว.)',
      89,
      '3 วันที่แล้ว',
      JSON.stringify(['AutoCAD', 'Site Inspection', 'การคำนวณโครงสร้าง', 'Safety Officer']),
      'ควบคุมงานก่อสร้างหน้างาน ตรวจสอบมาตรฐานวิศวกรรมและถอดแบบคณิตศาสตร์ก่อสร้าง',
      JSON.stringify(['คุมงานก่อสร้างและคนงานหน้างาน', 'เขียนและแก้ไขแบบด้วย AutoCAD']),
      JSON.stringify(['จบวิศวกรรมศาสตร์ (ไฟฟ้า/โยธา/เครื่องกล)', 'พร้อมปฏิบัติงานต่างจังหวัดได้']),
      JSON.stringify(['ค่าเบี้ยเลี้ยงหน้างาน', 'ค่าที่พักฟรี', 'ประกันอุบัติเหตุ'])
    );

    // 5. HR & Admin
    insertJob.run(
      'job-5',
      'เจ้าหน้าที่สรรหาและบริหารงานบุคคล (HR & Admin Officer)',
      'Apex People Solutions',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60',
      'ขอนแก่น',
      'hr',
      'งานเต็มเวลา (Entry-level)',
      '18,000 - 24,000 บาท/เดือน',
      'เด็กจบใหม่ยินดีรับ',
      93,
      'วันนี้',
      JSON.stringify(['Recruitment', 'การสัมภาษณ์งาน', 'MS Word & Excel', 'ประสานงาน']),
      'คัดกรองเรซูเม่ นัดหมายสัมภาษณ์งาน จัดทำสัญญาวัดผลงาน และงานธุรการทั่วไปของบริษัท',
      JSON.stringify(['นัดหมายสัมภาษณ์ผู้สมัครงาน', 'ดูแลเอกสารพนักงานใหม่']),
      JSON.stringify(['วุฒิปริญญาตรี ด้านบริหารทรัพยากรมนุษย์ หรือจิตวิทยา']),
      JSON.stringify(['ทำงานจันทร์-ศุกร์', 'โบนัสผลงาน'])
    );

    // 6. Design & Media
    insertJob.run(
      'job-6',
      'Graphic Designer / กราฟิกดีไซเนอร์',
      'Creative Lab Thailand',
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=100&auto=format&fit=crop&q=60',
      'เชียงใหม่',
      'design',
      'งานเต็มเวลา (Entry-level)',
      '20,000 - 28,000 บาท/เดือน',
      'เด็กจบใหม่ยินดีรับ',
      96,
      '2 วันที่แล้ว',
      JSON.stringify(['Photoshop', 'Illustrator', 'Premiere Pro', 'Canva', 'Banner Design']),
      'ออกแบบภาพโฆษณา แบนเนอร์ สื่อสิ่งพิมพ์ และตัดต่อวิดีโอสั้นสำหรับช่องทางออนไลน์',
      JSON.stringify(['ออกแบบ Artwork สำหรับโซเชียลมีเดีย', 'ตัดต่อคลิป Reels/TikTok']),
      JSON.stringify(['ปริญญาตรีสายออกแบบ หรือมี Portfolio ผลงาน']),
      JSON.stringify(['บรรยากาศทำงานเป็นกันเอง', 'เครื่องดื่มฟรี'])
    );

    // 7. Internship / Part-time
    insertJob.run(
      'job-7',
      'นักศึกษาฝึกงานธุรการและประสานงาน (Admin Intern)',
      'Universal Business Service',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=60',
      'ปทุมธานี',
      'intern',
      'งานฝึกงาน (Internship)',
      '450 - 600 บาท/วัน',
      'นักศึกษาฝึกงานทุกชั้นปี',
      97,
      'วันนี้',
      JSON.stringify(['MS Office', 'การประสานงาน', 'ความกระตือรือร้น']),
      'เปิดรับนักศึกษาฝึกงานช่วยงานประสานงาน คีย์ข้อมูล และดูแลงานเอกสารขององค์กร',
      JSON.stringify(['คีย์ข้อมูลและจัดเก็บเอกสาร', 'ช่วยงานประสานงานทั่วไป']),
      JSON.stringify(['กำลังศึกษาในระดับ ปวส. หรือ ปริญญาตรี']),
      JSON.stringify(['เบี้ยเลี้ยงรายวัน', 'หนังสือรับรองการฝึกงาน'])
    );
  }
}

export default db;
