
// quizService.js
import axios from 'axios';

const API_URL = '/api/exam'; // Updated to match backend endpoint

export async function submitQuiz(quizId, answers) {
	// Updated: POST /api/exam/submit
	const response = await axios.post(`${API_URL}/submit`, { quizId, answers });
	return response.data;
}
