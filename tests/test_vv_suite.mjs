import http from 'http';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateJobMatch } from '../src/utils/matching.js';

const BASE_URL = 'http://localhost:3001';

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const results = [];
function test(name, fn) {
  return async () => {
    try {
      await fn();
      results.push({ name, status: 'PASSED' });
      console.log(`  ✅ PASS: ${name}`);
    } catch (err) {
      results.push({ name, status: 'FAILED', error: err.message });
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
    }
  };
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 STARTING COMPREHENSIVE V&V AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  const testCases = [
    // ----------------------------------------------------
    // PART 1: VERIFICATION (Code, API Contract, DB Integrity)
    // ----------------------------------------------------
    test('VER-01: System Health & DB Connectivity Check', async () => {
      const res = await request('GET', '/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'ok');
      assert.ok(typeof res.body.stats.users === 'number');
      assert.ok(typeof res.body.stats.jobs === 'number');
    }),

    test('VER-02: User Registration - Applicant (Valid Payload)', async () => {
      const timestamp = Date.now();
      const res = await request('POST', '/api/auth/register', {
        name: `Test Student ${timestamp}`,
        email: `student_${timestamp}@test.ac.th`,
        password: 'Password123!',
        role: 'applicant',
        studentId: '63010099',
        university: 'Chulalongkorn University',
        major: 'Computer Engineering'
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.role, 'applicant');
      assert.strictEqual(res.body.user.major, 'Computer Engineering');
    }),

    test('VER-03: User Registration - Missing Required Fields Validation', async () => {
      const res = await request('POST', '/api/auth/register', {
        name: 'Incomplete User'
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    }),

    test('VER-04: User Registration - Prevent Duplicate Email', async () => {
      const email = `dup_${Date.now()}@test.com`;
      await request('POST', '/api/auth/register', {
        name: 'User 1', email, password: 'pwd', role: 'applicant'
      });
      const res = await request('POST', '/api/auth/register', {
        name: 'User 2', email, password: 'pwd', role: 'applicant'
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error.includes('อีเมลนี้ถูกใช้งานในระบบแล้ว'));
    }),

    test('VER-05: Employer Domain Classification (Corporate vs Individual)', async () => {
      const t = Date.now();
      // Individual (Free domain)
      const resInd = await request('POST', '/api/auth/register', {
        name: 'Individual Employer',
        email: `boss_${t}@gmail.com`,
        password: 'pwd',
        role: 'employer'
      });
      assert.strictEqual(resInd.body.user.employerType, 'individual');

      // Corporate
      const resCorp = await request('POST', '/api/auth/register', {
        name: 'Company HR',
        email: `hr_${t}@techcorp.co.th`,
        password: 'pwd',
        role: 'employer'
      });
      assert.strictEqual(resCorp.body.user.employerType, 'corporate');
    }),

    test('VER-06: Authentication - Login Success & Failure', async () => {
      const email = `login_test_${Date.now()}@test.com`;
      await request('POST', '/api/auth/register', {
        name: 'Auth Test', email, password: 'correctPassword', role: 'applicant'
      });

      // Wrong password
      const badRes = await request('POST', '/api/auth/login', {
        email, password: 'wrongPassword'
      });
      assert.strictEqual(badRes.status, 401);

      // Correct password
      const goodRes = await request('POST', '/api/auth/login', {
        email, password: 'correctPassword'
      });
      assert.strictEqual(goodRes.status, 200);
      assert.strictEqual(goodRes.body.user.email, email);
    }),

    test('VER-07: SQL Injection Safety on Login Input', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: "' OR 1=1 --",
        password: "' OR '1'='1"
      });
      assert.strictEqual(res.status, 401);
    }),

    test('VER-08: Job Posting & Admin Approval Workflow', async () => {
      const t = Date.now();
      const employerId = `emp-${t}`;

      // 1. Employer creates a job (default pending)
      const postRes = await request('POST', '/api/jobs', {
        title: `Software Engineer Intern ${t}`,
        company: 'Agile Innovations Co., Ltd.',
        location: 'กรุงเทพมหานคร',
        category: 'IT / Software',
        salary: '18,000 - 25,000 บาท/เดือน',
        employerId,
        vacancies: 2,
        skillsRequired: ['React', 'Node.js', 'SQL']
      });
      assert.strictEqual(postRes.status, 201);
      const jobId = postRes.body.job.id;
      assert.strictEqual(postRes.body.job.approvalStatus, 'pending');

      // 2. Public /api/jobs should NOT include pending job
      const pubRes1 = await request('GET', '/api/jobs');
      const foundInPublic1 = pubRes1.body.some(j => j.id === jobId);
      assert.strictEqual(foundInPublic1, false);

      // 3. Admin view should see pending job
      const adminRes = await request('GET', '/api/jobs?adminView=true');
      const foundInAdmin = adminRes.body.some(j => j.id === jobId);
      assert.strictEqual(foundInAdmin, true);

      // 4. Admin approves the job
      const approveRes = await request('PUT', `/api/jobs/${jobId}/approval`, {
        approvalStatus: 'approved'
      });
      assert.strictEqual(approveRes.status, 200);

      // 5. Public /api/jobs now DOES include approved job
      const pubRes2 = await request('GET', '/api/jobs');
      const foundInPublic2 = pubRes2.body.some(j => j.id === jobId);
      assert.strictEqual(foundInPublic2, true);

      // 6. Edit Job
      const editRes = await request('PUT', `/api/jobs/${jobId}`, {
        title: `Senior Software Engineer Intern ${t}`,
        company: 'Agile Innovations Co., Ltd.',
        location: 'กรุงเทพมหานคร',
        category: 'IT / Software',
        salary: '25,000 - 35,000 บาท/เดือน',
        vacancies: 2,
        skillsRequired: ['React', 'Node.js', 'TypeScript']
      });
      assert.strictEqual(editRes.status, 200);

      // 7. Delete Job
      const delRes = await request('DELETE', `/api/jobs/${jobId}`);
      assert.strictEqual(delRes.status, 200);
    }),

    test('VER-09: Candidate Skills & Portfolio Management (CRUD)', async () => {
      const t = Date.now();
      // Create base user
      const regRes = await request('POST', '/api/auth/register', {
        name: 'Skillful Student',
        email: `skill_${t}@test.com`,
        password: 'pwd',
        role: 'applicant'
      });
      const userId = regRes.body.user.id;

      // 1. Add Skill
      const addSkillRes = await request('POST', '/api/skills', {
        userId,
        name: 'Docker & Kubernetes',
        level: 'Advanced'
      });
      assert.strictEqual(addSkillRes.status, 201);
      assert.ok(addSkillRes.body.skills.some(s => s.name === 'Docker & Kubernetes'));
      const skillId = addSkillRes.body.skills[0].id;

      // 2. Add Project
      const addProjRes = await request('POST', `/api/users/${userId}/projects`, {
        title: 'Job Matching Cloud Platform',
        description: 'Microservices architecture with Node.js',
        tags: ['Node.js', 'Express', 'SQLite'],
        demoUrl: 'https://demo.example.com',
        githubUrl: 'https://github.com/example/repo'
      });
      assert.strictEqual(addProjRes.status, 201);
      const projectId = addProjRes.body.project.id;

      // 3. Fetch Portfolio
      const portRes = await request('GET', `/api/users/${userId}/portfolio`);
      assert.strictEqual(portRes.status, 200);
      assert.ok(portRes.body.projects.length >= 1);

      // 4. Clean up Project & Skill
      const delProj = await request('DELETE', `/api/projects/${projectId}`);
      assert.strictEqual(delProj.status, 200);

      const delSkill = await request('DELETE', `/api/skills/${skillId}`);
      assert.strictEqual(delSkill.status, 200);
    }),

    test('VER-10: Application Messaging & Support Communication', async () => {
      const appId = `app-msg-test-${Date.now()}`;
      // Send message
      const postMsg = await request('POST', `/api/applications/${appId}/messages`, {
        senderId: 'candidate-01',
        senderName: 'สมชาย ผู้สมัคร',
        content: 'สอบถามรายละเอียดวันสัมภาษณ์เพิ่มเติมครับ'
      });
      assert.strictEqual(postMsg.status, 201);
      assert.strictEqual(postMsg.body.applicationId, appId);

      // Retrieve messages
      const getMsg = await request('GET', `/api/applications/${appId}/messages`);
      assert.strictEqual(getMsg.status, 200);
      assert.ok(Array.isArray(getMsg.body));
      assert.ok(getMsg.body.some(m => m.content.includes('วันสัมภาษณ์เพิ่มเติม')));
    }),

    test('VER-11: AI Matching Analysis Fallback & Contract', async () => {
      const res = await request('POST', '/api/ai/match', {
        job: {
          title: 'Frontend Developer',
          company: 'Tech Solutions',
          skillsRequired: ['React', 'CSS', 'JavaScript'],
          description: 'พัฒนาเว็บแอปพลิเคชัน'
        },
        applicant: {
          name: 'กิตติศักดิ์ นักศึกษา',
          major: 'วิทยาการคอมพิวเตอร์',
          university: 'มหาวิทยาลัยเทคโนโลยี',
          skills: ['React', 'HTML', 'JavaScript'],
          bio: 'สนใจงานด้าน Web Frontend'
        }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(typeof res.body.analysis.matchRate === 'number');
      assert.ok(res.body.analysis.aiAnalysis);
    }),

    // ----------------------------------------------------
    // PART 2: VALIDATION (E2E End-User Scenarios)
    // ----------------------------------------------------
    test('VAL-01: End-to-End Recruitment Lifecycle Scenario', async () => {
      const t = Date.now();
      const employerEmail = `recruiter_${t}@innovative.co.th`;
      const candidateEmail = `freshgrad_${t}@uni.ac.th`;

      // 1. Employer signs up
      const empReg = await request('POST', '/api/auth/register', {
        name: 'บริษัท นวัตกรรมล้ำเลิศ จำกัด',
        email: employerEmail,
        password: 'empPassword123',
        role: 'employer',
        employerType: 'corporate'
      });
      const employerId = empReg.body.user.id;

      // 2. Candidate signs up
      const candReg = await request('POST', '/api/auth/register', {
        name: 'สุดสวย จบใหม่ไฟแรง',
        email: candidateEmail,
        password: 'candPassword123',
        role: 'applicant',
        studentId: '65099887',
        university: 'มหาวิทยาลัยธรรมศาสตร์',
        major: 'การตลาดดิจิทัล'
      });
      const candidateId = candReg.body.user.id;

      // 3. Employer posts a job with 1 vacancy
      const jobPost = await request('POST', '/api/jobs', {
        title: `Digital Marketing Specialist ${t}`,
        company: 'บริษัท นวัตกรรมล้ำเลิศ จำกัด',
        location: 'กรุงเทพมหานคร',
        category: 'การตลาด / Marketing',
        salary: '22,000 - 30,000 บาท/เดือน',
        employerId,
        vacancies: 1,
        skillsRequired: ['SEO', 'Content Marketing', 'Google Ads'],
        approvalStatus: 'approved'
      });
      const jobId = jobPost.body.job.id;

      // 4. Candidate browses and submits application
      const appSubmit = await request('POST', '/api/applications', {
        jobId,
        jobTitle: `Digital Marketing Specialist ${t}`,
        company: 'บริษัท นวัตกรรมล้ำเลิศ จำกัด',
        userId: candidateId,
        applicantName: 'สุดสวย จบใหม่ไฟแรง',
        coverNote: 'มีความสนใจและผ่านการฝึกงานด้าน SEO มาโดยตรง'
      });
      assert.strictEqual(appSubmit.status, 201);
      const appId = appSubmit.body.id;

      // 5. Employer reviews applications
      const empApps = await request('GET', `/api/applications/employer/${employerId}`);
      assert.strictEqual(empApps.status, 200);
      assert.ok(empApps.body.some(a => a.id === appId));

      // 6. Employer schedules interview
      const interviewDate = '2026-10-01 10:00 AM';
      const scheduleRes = await request('PUT', `/api/applications/${appId}/status`, {
        status: 'นัดสัมภาษณ์ (Interview)',
        interviewDate,
        interviewNote: 'สัมภาษณ์ออนไลน์ผ่าน Google Meet'
      });
      assert.strictEqual(scheduleRes.status, 200);

      // 7. Candidate checks application status
      const candApps = await request('GET', `/api/applications/user/${candidateId}`);
      const myApp = candApps.body.find(a => a.id === appId);
      assert.strictEqual(myApp.status, 'นัดสัมภาษณ์ (Interview)');
      assert.strictEqual(myApp.interviewDate, interviewDate);

      // 8. Employer accepts candidate (Hired!)
      const acceptRes = await request('PUT', `/api/applications/${appId}/status`, {
        status: 'ผ่านการคัดเลือก (Accepted)'
      });
      assert.strictEqual(acceptRes.status, 200);

      // 9. Validation of Business Rule:
      // Since vacancies was 1 and acceptedCount is now 1, the job must be automatically hidden from public listing!
      const publicJobs = await request('GET', '/api/jobs');
      const isStillInPublic = publicJobs.body.some(j => j.id === jobId);
      assert.strictEqual(isStillInPublic, false, 'Job should be filled and hidden from active job seekers');
    }),

    test('VAL-02: Platform Admin Oversight & Statistics Scenario', async () => {
      // 1. Admin checks global stats
      const health = await request('GET', '/api/health');
      assert.ok(health.body.stats.users > 0);
      assert.ok(health.body.stats.jobs > 0);

      // 2. Admin retrieves all users
      const usersRes = await request('GET', '/api/users');
      assert.strictEqual(usersRes.status, 200);
      assert.ok(Array.isArray(usersRes.body));
      assert.ok(usersRes.body.length > 0);

      // 3. Admin retrieves all applications across all employers
      const adminApps = await request('GET', '/api/applications/admin');
      assert.strictEqual(adminApps.status, 200);
      assert.ok(Array.isArray(adminApps.body));
    }),

    test('VER-12: Client-side AI Semantic Matching Unit Test', () => {
      const job = {
        title: 'React Frontend Developer',
        category: 'it',
        skillsRequired: ['React', 'JavaScript', 'Tailwind CSS']
      };
      const candidate = {
        name: 'พงศ์ศธร สุขสม',
        major: 'วิศวกรรมคอมพิวเตอร์',
        skills: ['React', 'JavaScript', 'HTML/CSS']
      };
      const match = calculateJobMatch(job, candidate);
      assert.ok(typeof match.matchRate === 'number');
      assert.ok(match.matchRate >= 80, `Expected high match rate for CS grad with React, got ${match.matchRate}`);
      assert.strictEqual(match.isMajorMatched, true);
    }),

    test('VAL-03: Security & Role Data Boundary Validation', async () => {
      // Ensure candidate cannot fetch another arbitrary applicant's private email via public endpoints
      const pubJobs = await request('GET', '/api/jobs');
      assert.strictEqual(pubJobs.status, 200);
      for (const j of pubJobs.body) {
        assert.strictEqual(j.password, undefined, 'Passwords must never leak in jobs list');
      }
    })
  ];

  for (const tc of testCases) {
    await tc();
  }

  console.log('\n======================================================');
  console.log('📊 TEST EXECUTION SUMMARY:');
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  console.log(`Total Tests : ${results.length}`);
  console.log(`Passed      : ${passed} ✅`);
  console.log(`Failed      : ${failed} ${failed > 0 ? '❌' : '✨'}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
