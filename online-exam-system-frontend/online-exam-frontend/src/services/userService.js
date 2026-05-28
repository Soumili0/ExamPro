
// userService.js
import axios from 'axios';

const API_URL = '/api/user'; // প্রয়োজন অনুযায়ী পরিবর্তন করুন

export async function updateProfile(profile) {
	// ডেমো: PUT /api/user/profile
	const response = await axios.put(`${API_URL}/profile`, profile);
	return response.data;
}
