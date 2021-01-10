require('dotenv').config();

const axios = require('axios').default;

const canvas = axios.create({
	baseURL: "https://canvas.instructure.com/api/v1/",
	headers: {
		"Authorization": "Bearer " + process.env['CANVAS_DEVELOPER_KEY'],
	},
});

async function main() {
	const courseList = await canvas.get('/courses', {params: {
	}})
	const userRequest = courseList.data.map(async (course) => {
		const response = await canvas.get(`courses/${course.id}/users`, {
			params: {
				enrollment_type: ['student'],
				include: ['enrollments'],
			},
		})
		return response.data.map((student) => ({
			id: course.id,
			name: course.name,
			student: {
				id: student.id,
				email: student.email,
				name: student.name,
				// This is a lazy hack, there can be multiple enrollments as different 'types' ie teacher, student etc.
				// since most people are students, and only a few are not and we dont care about them, this should be fine
				score: student.enrollments[0].grades.final_score
			}
		}));
	})
	const userList = await Promise.all(userRequest);

	console.dir(userList, { depth: null });
}


main();
