import { calculateAIMatchRate } from './aiMatching.js';

/**
 * Dynamic Job & Skill Match Rate (%) Calculator powered by AI Semantic Engine
 */
export function calculateJobMatch(job, currentUser, userSkills = []) {
  if (!job || !currentUser) {
    return {
      matchRate: job?.matchRate || 85,
      matchedSkills: [],
      missingSkills: [],
      isMajorMatched: false,
      skillScore: 0,
      majorScore: 0
    };
  }

  // Combine userSkills from portfolio with currentUser skills
  let combinedSkills = [];
  if (Array.isArray(userSkills) && userSkills.length > 0) {
    combinedSkills = [...userSkills];
  }
  if (Array.isArray(currentUser.skills) && currentUser.skills.length > 0) {
    combinedSkills = [...combinedSkills, ...currentUser.skills];
  }

  const applicant = {
    ...currentUser,
    skills: combinedSkills,
    projects: currentUser.projects || [],
    bio: currentUser.bio || ''
  };

  const aiResult = calculateAIMatchRate(job, applicant);

  return {
    matchRate: aiResult.matchRate,
    matchedSkills: aiResult.matchedSkills,
    missingSkills: aiResult.missingSkills,
    isMajorMatched: aiResult.isMajorMatched,
    majorMatchReason: aiResult.majorMatchReason,
    skillScore: aiResult.skillScore,
    majorScore: aiResult.majorScore
  };
}

export { calculateAIMatchRate };
