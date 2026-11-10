import { JOBS, SKILLS } from './data.js';

export function inferSkills(story) {
  const text = [story.problem, story.action, story.outcome].join(' ').toLowerCase();
  return SKILLS.filter((skill) => skill.keywords.some((keyword) => text.includes(keyword)));
}

export function evidenceForSkill(skill, proofs) {
  return proofs.find((proof) => proof.selectedSkills.includes(skill)) || null;
}

export function evaluate(job, proofs) {
  const supported = [];
  const gaps = [];
  job.requirements.forEach((requirement) => {
    const proof = evidenceForSkill(requirement.skill, proofs);
    if (proof) supported.push({ ...requirement, proof });
    else gaps.push(requirement);
  });
  return { supported, gaps, count: supported.length };
}

export function sortJobs(proofs) {
  return [...JOBS].sort((a, b) => {
    const diff = evaluate(b, proofs).count - evaluate(a, proofs).count;
    if (diff) return diff;
    return JOBS.indexOf(a) - JOBS.indexOf(b);
  });
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

export function shortText(value = '', max = 146) {
  const normalized = String(value).trim().replace(/\s+/g, ' ');
  return normalized.length > max ? `${normalized.slice(0, max - 1).trimEnd()}…` : normalized;
}

export function allSelectedSkills(proofs) {
  return [...new Set(proofs.flatMap((proof) => proof.selectedSkills))];
}
