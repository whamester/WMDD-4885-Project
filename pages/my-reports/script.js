import MyReport from '../../assets/helpers/report-card.js'
import { API_URL } from '../../constants.js'
import { getUserSession } from '../../assets/helpers/storage.js'

const user = getUserSession()
let userID = user?.id
let recentReportArr = []
let olderReportArr = []
const recentReports = document.getElementById('recentReports')
const olderReports = document.getElementById('olderReports')
const recentBtn = document.getElementById('recentReportsBtn')
const olderBtn = document.getElementById('olderReportsBtn')

// Get all the recent reports for the logged in user and display them

async function getRecentReports() {
	try {
		recentReportArr.splice(0, recentReportArr.length)

		const response = await fetch(
			`${API_URL}/hazard-report?cursor=20&size=40&user_id=${userID}&type=recent`
		)
		const result = await response.json()

		recentReportArr.push(...result.data.results)
	} catch (error) {
		console.log('Could not get user reports', error)
	}
}

async function displayRecentReports() {
	await getRecentReports()

	for (const index of recentReportArr) {
		let hazardReport = new MyReport(
			index.id,
			index.hazardCategory.name,
			index.hazard.name,
			index.location.address,
			index.created_at,
			index.images,
			index.comment
		)
		recentReports.appendChild(hazardReport.reportContent())
	}
}

displayRecentReports()