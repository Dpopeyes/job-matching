// AI-Powered Semantic Job & Candidate Matching Engine (Multi-Source Deep Profile Extractor)

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
  'react': 'react',
  'react.js': 'react',
  'reactjs': 'react',
  'node': 'node.js',
  'nodejs': 'node.js',
  'vue': 'vue.js',
  'vuejs': 'vue.js',
  'py': 'python',
  'html/css': 'html/css',
  'css': 'css',
  'html': 'html',
  'css3': 'css',
  'html5': 'html',
  'tailwind': 'tailwind css',
  'tailwindcss': 'tailwind css',
  'ui/ux': 'ui/ux',
  'figma design': 'figma'
};

// Default Tech Skills for Tech/CS applicants if profile is completely empty
const DEFAULT_TECH_SKILLS = [
  'React', 'JavaScript', 'HTML/CSS', 'Git', 'Tailwind CSS', 'คอมพิวเตอร์', 'การสื่อสาร', 'การทำงานเป็นทีม'
];

function normalizeText(text) {
  if (!text) return '';
  return text.toString().toLowerCase().trim();
}

function normalizeSkill(skill) {
  const norm = normalizeText(skill);
  return SKILL_ALIASES[norm] || norm;
}

// Extract skill tokens from all sources of applicant profile (Skills + Project Tags + Bio)
function extractAllApplicantSkillTokens(applicant) {
  const tokens = new Set();

  // 1. Extract from applicant.skills list
  if (Array.isArray(applicant.skills)) {
    applicant.skills.forEach(s => {
      const name = typeof s === 'string' ? s : (s.name || '');
      if (name) {
        tokens.add(name);
        // Split composite phrase (e.g. "เขียนเว็บ React.js (React.js)" -> "React.js", "React", "เขียนเว็บ")
        name.split(/[\s,()/]+/).forEach(tok => {
          if (tok.length >= 2) tokens.add(tok);
        });
      }
    });
  }

  // 2. Extract from applicant.projects tags & descriptions
  if (Array.isArray(applicant.projects)) {
    applicant.projects.forEach(p => {
      const tags = Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(/[\s,#]+/) : []);
      tags.forEach(t => {
        if (t) {
          const cleanTag = t.replace(/^#/, '').trim();
          if (cleanTag.length >= 2) tokens.add(cleanTag);
        }
      });
      if (p.description) {
        p.description.split(/[\s,()/]+/).forEach(tok => {
          if (tok.length >= 2) tokens.add(tok);
        });
      }
    });
  }

  // 3. Extract from applicant.bio
  if (applicant.bio) {
    applicant.bio.split(/[\s,()/]+/).forEach(tok => {
      if (tok.length >= 2) tokens.add(tok);
    });
  }

  // 4. Default fallback if still empty
  if (tokens.size === 0) {
    DEFAULT_TECH_SKILLS.forEach(s => tokens.add(s));
  }

  return Array.from(tokens);
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
 * AI Multi-Source Match Calculation (70% Skill Score + 30% Major Score)
 * @param {Object} job - Job posting details
 * @param {Object} applicant - Applicant profile (major, skills, projects, bio)
 * @returns {Object} Match analysis result
 */
export function calculateAIMatchRate(job, applicant) {
  if (!job || !applicant) {
    return {
      matchRate: 15,
      isMajorMatched: false,
      majorMatchReason: 'ต่างสายงาน',
      matchedSkills: [],
      missingSkills: [],
      skillScore: 0,
      majorScore: 0
    };
  }

  // 1. Extract Required Skills from Job
  let rawJobSkills = [];
  if (Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0) {
    rawJobSkills = job.skillsRequired;
  } else if (Array.isArray(job.skills) && job.skills.length > 0) {
    rawJobSkills = job.skills;
  } else if (typeof job.skillsRequired === 'string') {
    rawJobSkills = job.skillsRequired.split(/[\n,/]+/);
  }

  // Extract skills from job title if list is empty
  if (rawJobSkills.length === 0 && job.title) {
    const jobTitleNorm = normalizeText(job.title);
    if (jobTitleNorm.includes('react')) rawJobSkills.push('React');
    if (jobTitleNorm.includes('javascript') || jobTitleNorm.includes('js')) rawJobSkills.push('JavaScript');
    if (jobTitleNorm.includes('tailwind')) rawJobSkills.push('Tailwind CSS');
    if (jobTitleNorm.includes('node')) rawJobSkills.push('Node.js');
    if (jobTitleNorm.includes('python')) rawJobSkills.push('Python');
    if (jobTitleNorm.includes('ux') || jobTitleNorm.includes('ui')) rawJobSkills.push('UI/UX');
  }

  const jobSkillsClean = rawJobSkills.map(s => (typeof s === 'string' ? s : s.name || '')).filter(Boolean);

  // 2. Extract Applicant Skills from ALL sources (Skills List + Project Tags + Bio)
  const rawApplicantSkills = extractAllApplicantSkillTokens(applicant);
  const normApplicantSkills = rawApplicantSkills.map(s => normalizeSkill(s));

  // Match skills using flexible token & substring matching
  const matchedSkillsSet = new Set();
  const missingSkillsSet = new Set();

  jobSkillsClean.forEach(jsRaw => {
    const jsNorm = normalizeSkill(jsRaw);

    const isMatched = normApplicantSkills.some(asNorm => {
      if (asNorm === jsNorm || asNorm.includes(jsNorm) || jsNorm.includes(asNorm)) {
        return true;
      }
      const jsTokens = jsNorm.split(/[/\s,]+/);
      const asTokens = asNorm.split(/[/\s,]+/);
      return jsTokens.some(jt => jt.length >= 2 && asTokens.some(at => at.includes(jt) || jt.includes(at)));
    });

    if (isMatched) {
      matchedSkillsSet.add(jsRaw);
    } else {
      missingSkillsSet.add(jsRaw);
    }
  });

  const matchedSkills = Array.from(matchedSkillsSet);
  const missingSkills = Array.from(missingSkillsSet);

  // Skill Score Calculation (0% to 100%)
  let skillRatio = 0;
  if (jobSkillsClean.length > 0) {
    skillRatio = matchedSkills.length / jobSkillsClean.length;
  } else {
    skillRatio = 0.5;
  }
  const skillScore = Math.round(skillRatio * 100);

  // 3. Major Taxonomy & Field Matching Analysis (0% to 100%)
  const applicantMajor = normalizeText(applicant.major);
  const jobTitle = normalizeText(job.title);
  const jobCategory = normalizeText(job.category);
  const jobDescription = normalizeText(job.description);

  const applicantCluster = getClusterKey(applicantMajor);
  const jobTitleCluster = getClusterKey(jobTitle) || getClusterKey(jobCategory) || getClusterKey(jobDescription);

  let majorScore = 0;
  let isMajorMatched = false;
  let majorMatchReason = '⚠️ ต่างสายงาน';

  if (applicantCluster === 'tech') {
    if (jobTitle.includes('เครื่องจักร') || jobTitle.includes('ช่างเครื่อง') || jobTitle.includes('บัญชี') || jobTitle.includes('การเงิน') || jobTitle.includes('ขาย')) {
      majorScore = 0;
      isMajorMatched = false;
      majorMatchReason = '⚠️ ต่างสายงาน';
    } else if (jobTitleCluster === 'tech') {
      majorScore = 100;
      isMajorMatched = true;
      majorMatchReason = `ตรงกับสาขา ${applicant.major || 'ของคุณ'} ✨`;
    } else if (jobTitleCluster === 'design') {
      majorScore = 50;
      isMajorMatched = false;
      majorMatchReason = 'สายงานใกล้เคียง (UI/UX Design)';
    }
  } else if (applicantCluster && jobTitleCluster && applicantCluster === jobTitleCluster) {
    majorScore = 100;
    isMajorMatched = true;
    majorMatchReason = `ตรงกับสาขา ${applicant.major || 'ของคุณ'} ✨`;
  } else if (applicantMajor && (jobTitle.includes(applicantMajor) || applicantMajor.includes(jobTitle))) {
    majorScore = 100;
    isMajorMatched = true;
    majorMatchReason = `ตรงกับสาขา ${applicant.major} ✨`;
  }

  // 4. Combined Weighted Match Rate: (Skill Score * 70%) + (Major Score * 30%)
  let finalMatchRate = Math.round((skillScore * 0.7) + (majorScore * 0.3));

  // Minimum floor 15%
  finalMatchRate = Math.max(15, Math.min(100, finalMatchRate));

  return {
    matchRate: finalMatchRate,
    isMajorMatched,
    majorMatchReason,
    matchedSkills,
    missingSkills,
    skillScore,
    majorScore
  };
}
