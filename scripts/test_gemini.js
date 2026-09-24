import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-3.6-flash',
  generationConfig: { responseMimeType: 'application/json' }
});

const benchmarkExamples = `
[เกณฑ์มาตรฐานการเรียนรู้ของระบบ AI Matching (Few-Shot Calibrated Benchmarks)]

กรณีตัวอย่างที่ 1: ตรงสายงานและมีทักษะครบ
- ผู้สมัคร: สาขาวิทยาการคอมพิวเตอร์ | ทักษะ: React, JavaScript, HTML/CSS, Git, Tailwind CSS
- ตำแหน่ง: Junior Frontend Developer (ต้องการ: React, JavaScript, Tailwind CSS)
- ผลลัพธ์: matchRate: 94, isMajorMatched: true, suggestedCareerPath: "Web & Software Development"

กรณีตัวอย่างที่ 2: สายงานออกแบบดิจิทัล / สื่อประยุกต์
- ผู้สมัคร: สาขาเทคโนโลยีมัลติมีเดีย | ทักษะ: Figma, Photoshop, Wireframing
- ตำแหน่ง: UI/UX Designer (ต้องการ: Figma, UI/UX, Wireframing)
- ผลลัพธ์: matchRate: 91, isMajorMatched: true, suggestedCareerPath: "UI/UX & Graphic Design"

กรณีตัวอย่างที่ 3: ต่างสายงานและไม่มีทักษะตรง
- ผู้สมัคร: สาขาวิศวกรรมเครื่องกล | ทักษะ: AutoCAD, SolidWorks, MATLAB
- ตำแหน่ง: Junior Frontend Developer (ต้องการ: React, JavaScript, CSS)
- ผลลัพธ์: matchRate: 25, isMajorMatched: false, suggestedCareerPath: "Engineering & Production"
`;

const job = {
  title: 'Full Stack React & Node Developer',
  company: 'BlueHouse Innovation',
  skillsRequired: ['React', 'Node.js', 'JavaScript', 'SQL'],
  description: 'พัฒนา Web Platform ทั้งส่วน Frontend ด้วย React และ Backend ด้วย Node.js'
};

const applicant = {
  name: 'นายกิตติศักดิ์ พัฒนาการ',
  major: 'วิศวกรรมซอฟต์แวร์',
  university: 'มหาวิทยาลัยเกษตรศาสตร์',
  skills: ['React', 'JavaScript', 'Tailwind CSS', 'Git', 'HTML/CSS'],
  projects: [
    { title: 'ระบบจองห้องพักออนไลน์', description: 'สร้างด้วย React และ Tailwind CSS', tags: ['React', 'Web'] }
  ],
  bio: 'สนใจงานพัฒนาเว็บไซต์ มุ่งมั่นเป็น Full Stack Developer'
};

const prompt = `
คุณคือ AI Senior HR Specialist และระบบคัดกรองประเมินผู้สมัครงานอัจฉริยะ (High-Precision Candidate Matching Engine)

${benchmarkExamples}

[กฎการคำนวณคะแนน Match Rate % ให้แม่นยำสูง]:
1. ทักษะหลักที่ตรงกับความต้องการ (Skill Match Weight): 60%
2. ความตรงสายของสาขาวิชาและวุฒิการศึกษา (Major Relevance Weight): 25%
3. ผลงาน/โปรเจกต์ที่ตรงกับสายงาน (Portfolio & Real Projects Weight): 15%
4. คำนวณเปอร์เซ็นต์ (matchRate) ระหว่าง 15 - 98 ตามความเป็นจริง

[ข้อมูลตำแหน่งงานที่ต้องการประเมิน]
- ชื่อตำแหน่ง: ${job.title}
- บริษัท: ${job.company}
- ทักษะที่ต้องการ: ${job.skillsRequired.join(', ')}
- หน้าที่รับผิดชอบ: ${job.description}

[ข้อมูลผู้สมัครงาน]
- ชื่อ: ${applicant.name}
- สาขาวิชา: ${applicant.major}
- สถาบัน: ${applicant.university}
- ทักษะที่มี: ${applicant.skills.join(', ')}
- ประวัติ/Bio: ${applicant.bio}
- โปรเจกต์ในพอร์ตโฟลิโอ:
  ${applicant.projects.map(p => `- ${p.title}: ${p.description} (แท็ก: ${p.tags.join(', ')})`).join('\n  ')}

โปรดวิเคราะห์อย่างละเอียดและตอบกลับเป็น JSON รูปแบบนี้เท่านั้น:
{
  "matchRate": 82,
  "isMajorMatched": true,
  "majorMatchReason": "ตรงกับสาขาวิศวกรรมซอฟต์แวร์ 💻✨",
  "matchedSkills": ["React", "JavaScript"],
  "missingSkills": ["Node.js", "SQL"],
  "suggestedCareerPath": "Web & Software Development (สายงานพัฒนาเว็บและซอฟต์แวร์)",
  "aiAnalysis": "เขียนบทวิเคราะห์ภาษาไทยเชิงลึก 2-3 ประโยค สรุปจุดเด่น ทักษะที่ตรง และสิ่งที่ควรเตรียมตัวเพิ่มเติม"
}
`;

async function testMatchWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Sending request to Gemini (Attempt ${attempt})...`);
      const res = await model.generateContent(prompt);
      console.log('Gemini Result:\n', res.response.text());
      return;
    } catch (err) {
      console.log(`Attempt ${attempt} failed:`, err.status || err.message);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 2000 * attempt));
      } else {
        throw err;
      }
    }
  }
}

testMatchWithRetry().catch(console.error);
