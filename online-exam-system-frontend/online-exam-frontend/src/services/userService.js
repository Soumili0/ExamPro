
// userService.js
import axios from 'axios';

const API_URL = '/api/user'; // Change as needed

export async function updateProfile(profile) {
	// Demo: PUT /api/user/profile
	const response = await axios.put(`${API_URL}/profile`, profile);
	return response.data;
}
