import apiClient from '../utils/api';

export async function getDashboardStats() {
  const response = await apiClient.get('/admin/stats');
  return response.data;
}

export async function getStudents() {
  const response = await apiClient.get('/admin/students');
  return response.data;
}

export async function createStudent(student) {
  const response = await apiClient.post('/admin/students', student);
  return response.data;
}

export async function updateStudent(studentId, student) {
  const response = await apiClient.put(`/admin/students/${studentId}`, student);
  return response.data;
}

export async function deleteStudent(studentId) {
  const response = await apiClient.delete(`/admin/students/${studentId}`);
  return response.data;
}

export async function setStudentActive(studentId, active) {
  const response = await apiClient.put(`/admin/students/${studentId}/active?active=${active}`);
  return response.data;
}

export async function resetStudentPassword(studentId, password) {
  const response = await apiClient.post(`/admin/students/${studentId}/reset-password`, { newPassword: password });
  return response.data;
}

export async function getExams() {
  const response = await apiClient.get('/admin/exams');
  return response.data;
}

export async function createExam(exam) {
  const response = await apiClient.post('/admin/exams', exam);
  return response.data;
}

export async function updateExam(examId, exam) {
  const response = await apiClient.put(`/admin/exams/${examId}`, exam);
  return response.data;
}

export async function deleteExam(examId) {
  const response = await apiClient.delete(`/admin/exams/${examId}`);
  return response.data;
}

export async function publishExam(examId, published) {
  const response = await apiClient.put(`/admin/exams/${examId}/publish?published=${published}`);
  return response.data;
}

export async function getQuestions() {
  const response = await apiClient.get('/admin/questions');
  return response.data;
}

export async function createQuestion(question) {
  const response = await apiClient.post('/admin/questions', question);
  return response.data;
}

export async function updateQuestion(questionId, question) {
  const response = await apiClient.put(`/admin/questions/${questionId}`, question);
  return response.data;
}

export async function deleteQuestion(questionId) {
  const response = await apiClient.delete(`/admin/questions/${questionId}`);
  return response.data;
}

export async function getResults(query, examId) {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (examId) params.append('examId', examId);
  const response = await apiClient.get(`/admin/results?${params.toString()}`);
  return response.data;
}
