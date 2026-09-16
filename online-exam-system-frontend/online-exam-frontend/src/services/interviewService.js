import apiClient from '../utils/api';

/**
 * Generate AI mock interview questions for a job role.
 * @param {string} jobRole  - e.g. "Software Engineer"
 * @param {number} questionCount - 1-10, default 5
 * @param {number} userId
 * @returns {Promise<{sessionId, jobRole, questions[]}>}
 */
export async function generateInterview(jobRole, questionCount, userId) {
  const response = await apiClient.post('/interview/generate', {
    jobRole,
    questionCount,
    userId,
  });
  return response.data;
}

/**
 * Submit answers and get AI evaluation + feedback.
 * @param {number} sessionId
 * @param {number} userId
 * @param {string} jobRole
 * @param {Array<{question, answer, category}>} answers
 * @returns {Promise<InterviewEvaluateResponse>}
 */
export async function evaluateInterview(sessionId, userId, jobRole, answers) {
  const response = await apiClient.post('/interview/evaluate', {
    sessionId,
    userId,
    jobRole,
    answers,
  });
  return response.data;
}

/**
 * Get all past interview sessions for a user.
 * @param {number} userId
 */
export async function getInterviewHistory(userId) {
  const response = await apiClient.get(`/interview/history/${userId}`);
  return response.data;
}

/**
 * Get detailed answers for a specific session.
 * @param {number} sessionId
 */
export async function getSessionAnswers(sessionId) {
  const response = await apiClient.get(`/interview/session/${sessionId}/answers`);
  return response.data;
}
