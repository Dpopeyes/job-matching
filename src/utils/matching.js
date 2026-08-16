/**
 * Dynamic Job & Skill Match Rate (%) Calculator
 * Calculates precise match rate (ranging from 10% to 99%) based on Applicant's Major/Field and Skills.
 */
export function calculateJobMatch(job, currentUser, userSkills = []) {
  // If not logged in or not an applicant, return standard job match rate
  if (!currentUser || currentUser.role !== 'applicant') {
    return {
      matchRate: job.matchRate || 85,
      matchedSkills: [],
      isMajorMatched: false
    };
  }

  // 1. Extract Applicant Skills
  let applicantSkillsList = [];
  if (Array.isArray(userSkills) && userSkills.length > 0) {
    applicantSkillsList = userSkills.map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
  } else if (Array.isArray(currentUser.skills) && currentUser.skills.length > 0) {
    applicantSkillsList = currentUser.skills.map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
  }

  // Fallback skills for demo applicant user if skills array is empty in DB
  if (applicantSkillsList.length === 0) {
    applicantSkillsList = ['react', 'javascript', 'html', 'css', 'คอมพิวเตอร์', 'การสื่อสาร', 'การทำงานเป็นทีม'];
  }

  // 2. Extract Job Skills Required
  const jobSkillsList = (job.skillsRequired || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());

  // 3. Calculate Skill Match Ratio (0% to 100%)
  const matchedSkills = [];
  if (jobSkillsList.length > 0) {
    jobSkillsList.forEach(jobSkill => {
      const isMatched = applicantSkillsList.some(userSkill => 
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      );
      if (isMatched) {
        matchedSkills.push(jobSkill);
      }
    });
  }

  let skillRatio = 0;
  if (jobSkillsList.length > 0) {
    skillRatio = matchedSkills.length / jobSkillsList.length;
  } else {
    // If job has no specified skills, check if description contains applicant skills
    const desc = (job.description || '').toLowerCase();
    const matchedInDesc = applicantSkillsList.filter(userSkill => desc.includes(userSkill));
    skillRatio = matchedInDesc.length > 0 ? 0.6 : 0.2;
  }

  const skillScore = skillRatio * 100;

  // 4. Calculate Major / Field Match (15% to 95%)
  let isMajorMatched = false;
  const major = (currentUser.major || '').toLowerCase();
  const jobTitle = (job.title || '').toLowerCase();
  const jobCat = (job.category || '').toLowerCase();
  const jobDesc = (job.description || '').toLowerCase();

  if (major.includes('คอมพิวเตอร์') || major.includes('ไอที') || major.includes('เทคโนโลยี') || major.includes('ซอฟต์แวร์') || major.includes('software')) {
    if (jobCat === 'dev' || jobCat === 'design' || jobTitle.includes('developer') || jobTitle.includes('coding') || jobTitle.includes('data') || jobTitle.includes('programmer') || jobTitle.includes('ux') || jobTitle.includes('ui') || jobTitle.includes('software')) {
      isMajorMatched = true;
    }
  } else if (major.includes('การตลาด') || major.includes('บริหาร') || major.includes('ธุรกิจ')) {
    if (jobCat === 'marketing' || jobTitle.includes('การตลาด') || jobTitle.includes('เซลล์') || jobTitle.includes('sales')) {
      isMajorMatched = true;
    }
  } else if (major.includes('บัญชี') || major.includes('การเงิน')) {
    if (jobCat === 'finance' || jobTitle.includes('บัญชี') || jobTitle.includes('การเงิน') || jobTitle.includes('คลัง')) {
      isMajorMatched = true;
    }
  } else if (major.includes('วิศว') || major.includes('ช่าง')) {
    if (jobCat === 'engineering' || jobTitle.includes('วิศวกร') || jobTitle.includes('เครื่องจักร') || jobTitle.includes('ช่าง')) {
      isMajorMatched = true;
    }
  } else if (major.includes('ธุรการ') || major.includes('ทรัพยากร') || major.includes('hr')) {
    if (jobCat === 'hr' || jobTitle.includes('ธุรการ') || jobTitle.includes('hr')) {
      isMajorMatched = true;
    }
  }

  // Keyword direct match check
  if (!isMajorMatched && major) {
    const majorTokens = major.split(/[\s,]+/);
    isMajorMatched = majorTokens.some(token => token.length >= 3 && (jobTitle.includes(token) || jobDesc.includes(token)));
  }

  const majorScore = isMajorMatched ? 95 : 15;

  // 5. Final Weighted Match Rate (Skill Score 60%, Major Score 40%)
  let finalMatch = Math.round((skillScore * 0.6) + (majorScore * 0.4));
  
  // Allow full dynamic range down to 15% - 99%
  finalMatch = Math.max(15, Math.min(99, finalMatch));

  return {
    matchRate: finalMatch,
    matchedSkills,
    isMajorMatched
  };
}
