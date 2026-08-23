import { calculateAIMatchRate } from './aiMatching';

/**
 * Dynamic Job & Skill Match Rate (%) Calculator powered by AI Semantic Engine
 */
export function calculateJobMatch(job, currentUser, userSkills = []) {
  if (!job || !currentUser) {
    return {
      matchRate: job?.matchRate || 85,
      matchedSkills: [],
      missingSkills: [],
      isMajorMatched: false
    };
  }

  // Build composite applicant object
  let skills = userSkills;
  if (!skills || skills.length === 0) {
    skills = currentUser.skills || ['React', 'JavaScript', 'HTML/CSS', 'Git'];
  }

  const applicant = {
    ...currentUser,
    skills: skills
  };

  const aiResult = calculateAIMatchRate(job, applicant);

  return {
    matchRate: aiResult.matchRate,
    matchedSkills: aiResult.matchedSkills,
    missingSkills: aiResult.missingSkills,
    isMajorMatched: aiResult.isMajorMatched,
    majorMatchReason: aiResult.majorMatchReason
  };
}

export { calculateAIMatchRate };
