// AI-Powered Semantic Job & Candidate Matching Engine (Realistic Real-World Semantic Matcher)

// Major & Job Field Taxonomy Clusters for Semantic Distance Calculation
const TAXONOMY_CLUSTERS = {
  tech: {
    keywords: [
      'คอมพิวเตอร์', 'ไอที', 'เทคโนโลยี', 'ซอฟต์แวร์', 'ดิจิทัล', 'โปรแกรมเมอร์',
      'developer', 'software', 'frontend', 'backend', 'fullstack', 'coding', 'web',
      'data', 'it', 'digital technology', 'computer science', 'cybersecurity', 'ux', 'ui'
    ],
    antiKeywords: ['เครื่องจักร', 'บัญชี', 'ช่าง', 'การเงิน', 'การตลาด', 'เซลล์', 'แม่บ้าน', 'ขับรถ']
  },
  design: {
    keywords: [
      'ออกแบบ', 'กราฟิก', 'นิเทศศิลป์', 'มัลติมีเดีย', 'ui/ux', 'digital art',
      'graphic design', 'visual design', 'figma', 'photoshop', 'illustrator'
    ],
    antiKeywords: ['บัญชี', 'เครื่องจักร', 'วิศวกรไฟฟ้า']
  },
  business: {
    keywords: [
      'การตลาด', 'บริหารธุรกิจ', 'การเงิน', 'บัญชี', 'เศรษฐศาสตร์', 'การจัดการ', 'เซลล์', 'ขาย',
      'marketing', 'business administration', 'finance', 'accounting', 'sales'
    ],
    antiKeywords: ['เขียนโปรแกรม', 'วิศวกรซอฟต์แวร์']
  },
  machinery_engineering: {
    keywords: [
      'เครื่องจักร', 'ช่าง', 'วิศวกรรมเครื่องกล', 'วิศวกรรมไฟฟ้า', 'ช่างเครื่อง', 'ฝ่ายผลิต', 'โรงงาน',
      'machinery', 'mechanical', 'technician', 'operator'
    ],
    antiKeywords: ['ซอฟต์แวร์', 'โปรแกรมเมอร์', 'frontend']
  }
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

// Determine cluster key of text
function getClusterKey(textStr) {
  const norm = normalizeText(textStr);
  if (!norm) return null;

  for (const [clusterKey, clusterData] of Object.entries(TAXONOMY_CLUSTERS)) {
    if (clusterData.keywords.some(kw => norm.includes(kw))) {
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
      matchRate: 35,
      isMajorMatched: false,
      majorMatchReason: 'ต่างสายงาน',
      matchedSkills: [],
      missingSkills: []
    };
  }

  // 1. Extract Required Skills from Job safely
  let rawJobSkills = [];
  if (Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0) {
    rawJobSkills = job.skillsRequired;
  } else if (Array.isArray(job.skills) && job.skills.length > 0) {
    rawJobSkills = job.skills;
  } else if (typeof job.skillsRequired === 'string') {
    rawJobSkills = job.skillsRequired.split(/[\n,]+/);
  }

  const jobSkills = rawJobSkills.flatMap(s => {
    const norm = normalizeText(s);
    if (norm.includes('/')) {
      return norm.split('/').map(sub => normalizeSkill(sub));
    }
    return [normalizeSkill(norm)];
  }).filter(Boolean);

  // 2. Extract Applicant Skills safely
  let rawApplicantSkills = [];
  if (Array.isArray(applicant.skills) && applicant.skills.length > 0) {
    rawApplicantSkills = applicant.skills;
  }

  const applicantSkills = rawApplicantSkills.map(s => {
    const skillName = typeof s === 'string' ? s : (s.name || '');
    return normalizeSkill(skillName);
  }).filter(Boolean);

  // Match skills with taxonomy normalization
  const matchedSkillsSet = new Set();
  const missingSkillsSet = new Set();

  // Explicit tech skills vs generic soft skills filter
  const genericSoftSkills = ['การสื่อสาร', 'การทำงานเป็นทีม', 'คอมพิวเตอร์', 'ความคิดสร้างสรรค์'];

  jobSkills.forEach(js => {
    const isGeneric = genericSoftSkills.some(gs => js.includes(gs));
    const isMatched = applicantSkills.some(as => as === js || as.includes(js) || js.includes(as));

    if (isMatched) {
      // Generic soft skills count with 50% weight
      matchedSkillsSet.add(js);
    } else {
      missingSkillsSet.add(js);
    }
  });

  const matchedSkills = Array.from(matchedSkillsSet);
  const missingSkills = Array.from(missingSkillsSet);

  // Specific hard technical skill match ratio
  const hardJobSkills = jobSkills.filter(js => !genericSoftSkills.some(gs => js.includes(gs)));
  const hardMatchedSkills = matchedSkills.filter(ms => !genericSoftSkills.some(gs => ms.includes(gs)));

  let skillMatchRatio = 0.2;
  if (hardJobSkills.length > 0) {
    skillMatchRatio = hardMatchedSkills.length / hardJobSkills.length;
  } else if (jobSkills.length > 0) {
    skillMatchRatio = matchedSkills.length / jobSkills.length;
  }

  // 3. Major Taxonomy & Field Matching Analysis (40% Weight)
  const applicantMajor = normalizeText(applicant.major);
  const jobTitle = normalizeText(job.title);
  const jobCategory = normalizeText(job.category);
  const jobDescription = normalizeText(job.description);

  const applicantCluster = getClusterKey(applicantMajor);
  const jobTitleCluster = getClusterKey(jobTitle) || getClusterKey(jobCategory) || getClusterKey(jobDescription);

  let majorScore = 0.15; // Base score for totally different major
  let isMajorMatched = false;
  let majorMatchReason = '⚠️ ต่างสายงาน';

  // Check if job is in a conflicting/anti-cluster (e.g. Machinery Operator for Tech student)
  if (applicantCluster === 'tech') {
    if (jobTitle.includes('เครื่องจักร') || jobTitle.includes('ช่างเครื่อง') || jobTitle.includes('บัญชี') || jobTitle.includes('การเงิน') || jobTitle.includes('ขาย')) {
      // Clearly unrelated job role
      majorScore = 0.1;
      isMajorMatched = false;
      majorMatchReason = '⚠️ ต่างสายงาน';
    } else if (jobTitleCluster === 'tech') {
      majorScore = 0.95;
      isMajorMatched = true;
      majorMatchReason = `ตรงกับสาขา ${applicant.major || 'ของคุณ'} ✨`;
    } else if (jobTitleCluster === 'design') {
      majorScore = 0.65;
      isMajorMatched = false;
      majorMatchReason = 'สายงานใกล้เคียง (UI/UX Design)';
    }
  } else if (applicantCluster && jobTitleCluster && applicantCluster === jobTitleCluster) {
    majorScore = 0.95;
    isMajorMatched = true;
    majorMatchReason = `ตรงกับสาขา ${applicant.major || 'ของคุณ'} ✨`;
  } else if (applicantMajor && (jobTitle.includes(applicantMajor) || applicantMajor.includes(jobTitle))) {
    majorScore = 0.95;
    isMajorMatched = true;
    majorMatchReason = `ตรงกับสาขา ${applicant.major} ✨`;
  }

  // If major is NOT matched, cap skill influence so unrelated jobs never get high scores
  if (!isMajorMatched) {
    skillMatchRatio = Math.min(skillMatchRatio, 0.35);
  }

  // 4. Combined Weighted Match Calculation
  const rawScore = (skillMatchRatio * 0.6) + (majorScore * 0.4);
  
  // Dynamic scale from 18% to 98%
  let finalMatchRate = Math.round(15 + (rawScore * 83));

  // Hard boundaries: Unrelated jobs max 38%, Direct major jobs min 75%
  if (!isMajorMatched) {
    finalMatchRate = Math.min(38, finalMatchRate);
  } else {
    finalMatchRate = Math.max(78, finalMatchRate);
  }

  return {
    matchRate: finalMatchRate,
    isMajorMatched,
    majorMatchReason,
    matchedSkills,
    missingSkills
  };
}
