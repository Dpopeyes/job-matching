// AI-Powered Semantic Job & Candidate Matching Engine

// Major Taxonomy Clusters for Semantic Distance
const MAJOR_CLUSTERS = {
  tech: [
    'เทคโนโลยีสารสนเทศ', 'วิทยาการคอมพิวเตอร์', 'วิศวกรรมซอฟต์แวร์', 'เทคโนโลยีดิจิทัล',
    'ดิจิทัลและคอมพิวเตอร์', 'computer science', 'software engineering', 'information technology',
    'it', 'digital technology', 'data science', 'cybersecurity'
  ],
  design: [
    'ออกแบบ', 'กราฟิก', 'นิเทศศิลป์', 'ออกแบบมัลติมีเดีย', 'ui/ux', 'digital art',
    'graphic design', 'visual design', 'interactive design'
  ],
  business: [
    'การตลาด', 'บริหารธุรกิจ', 'การเงิน', 'บัญชี', 'เศรษฐศาสตร์', 'การจัดการ',
    'marketing', 'business administration', 'finance', 'accounting', 'digital marketing'
  ],
  engineering: [
    'วิศวกรรมศาสตร์', 'วิศวกรรมไฟฟ้า', 'วิศวกรรมเครื่องกล', 'วิศวกรรมโยธา', 'engineering'
  ]
};

// Skill Alias Normalize Dictionary
const SKILL_ALIASES = {
  'js': 'javascript',
  'ts': 'typescript',
  'react': 'react.js',
  'reactjs': 'react.js',
  'node': 'node.js',
  'nodejs': 'node.js',
  'vue': 'vue.js',
  'vuejs': 'vue.js',
  'py': 'python',
  'html/css': 'html',
  'css3': 'css',
  'html5': 'html',
  'tailwind': 'tailwind css',
  'ui/ux': 'ui/ux design',
  'figma design': 'figma'
};

function normalizeText(text) {
  if (!text) return '';
  return text.toString().toLowerCase().trim();
}

function normalizeSkill(skill) {
  const norm = normalizeText(skill);
  return SKILL_ALIASES[norm] || norm;
}

// Find taxonomy cluster of a given major string
function getMajorCluster(majorStr) {
  const norm = normalizeText(majorStr);
  for (const [clusterKey, keywords] of Object.entries(MAJOR_CLUSTERS)) {
    if (keywords.some(kw => norm.includes(kw) || kw.includes(norm))) {
      return clusterKey;
    }
  }
  return null;
}

/**
 * AI Semantic Match Calculation for both Applicant & Employer views
 * @param {Object} job - Job posting details
 * @param {Object} applicant - Applicant profile (major, skills, bio)
 * @returns {Object} Match analysis result
 */
export function calculateAIMatchRate(job, applicant) {
  if (!job || !applicant) {
    return {
      matchRate: 50,
      isMajorMatched: false,
      majorMatchReason: 'ไม่พบข้อมูลในการเปรียบเทียบ',
      matchedSkills: [],
      missingSkills: []
    };
  }

  // 1. Skill Matching Analysis (60% Weight)
  const jobSkills = (job.skills || []).flatMap(s => {
    const norm = normalizeText(s);
    if (norm.includes('/')) {
      return norm.split('/').map(sub => normalizeSkill(sub));
    }
    return [normalizeSkill(norm)];
  });

  const applicantSkills = (applicant.skills || []).map(s => {
    const skillName = typeof s === 'string' ? s : (s.name || '');
    return normalizeSkill(skillName);
  });

  const matchedSkillsSet = new Set();
  const missingSkillsSet = new Set();

  jobSkills.forEach(js => {
    const isMatched = applicantSkills.some(as => as === js || as.includes(js) || js.includes(as));
    if (isMatched) {
      matchedSkillsSet.add(js);
    } else {
      missingSkillsSet.add(js);
    }
  });

  const matchedSkills = Array.from(matchedSkillsSet);
  const missingSkills = Array.from(missingSkillsSet);

  const skillMatchRatio = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0.5;

  // 2. Major Taxonomy Matching Analysis (40% Weight)
  const applicantMajor = normalizeText(applicant.major);
  const jobTitle = normalizeText(job.title);
  const jobCategory = normalizeText(job.category);
  const jobDescription = normalizeText(job.description);

  const applicantCluster = getMajorCluster(applicantMajor);
  const jobTitleCluster = getMajorCluster(jobTitle) || getMajorCluster(jobCategory) || getMajorCluster(jobDescription);

  let majorScore = 0.3; // Base score for different major
  let isMajorMatched = false;
  let majorMatchReason = 'สายงานใกล้เคียง';

  if (applicantCluster && jobTitleCluster && applicantCluster === jobTitleCluster) {
    majorScore = 0.95;
    isMajorMatched = true;
    majorMatchReason = `ตรงกับสายงาน ${applicant.major || 'ของคุณ'} ✨`;
  } else if (applicantMajor && (jobTitle.includes(applicantMajor) || applicantMajor.includes(jobTitle))) {
    majorScore = 1.0;
    isMajorMatched = true;
    majorMatchReason = `ตรงกับสาขา ${applicant.major} ✨`;
  } else if (isMajorMatched || matchedSkills.length >= 3) {
    majorScore = 0.75;
    majorMatchReason = `ทักษะสอดคล้องกับตำแหน่งงาน`;
  }

  // 3. Final Combined Weighted Score
  const rawScore = (skillMatchRatio * 0.6) + (majorScore * 0.4);
  
  // Dynamic scale from 15% to 99%
  let finalMatchRate = Math.round(15 + (rawScore * 84));

  // Cap boundaries
  if (finalMatchRate > 99) finalMatchRate = 99;
  if (finalMatchRate < 15) finalMatchRate = 15;

  return {
    matchRate: finalMatchRate,
    isMajorMatched,
    majorMatchReason,
    matchedSkills,
    missingSkills
  };
}
