//Models
import ReportForm from '../../assets/models/ReportForm.js'
import Map from '../../assets/models/Map.js'

//Variable Declaration
const currentReport = new ReportForm()
let position = Map.DEFAULT_LOCATION
let map = null
const API_URL = 'https://enchanting-llama-6664aa.netlify.app/.netlify/functions'

/**
 * Page Init
 */

window.onload = function () {
	displayCurrentSection()
	window.addEventListener('hashchange', displayCurrentSection)

	// Loads the map even if the user has not accepted the permissions
	map = new Map(position)
	map.setMarkerOnMap(position.latitude, position.longitude, 'You', {
		draggable: true,
	}) //TODO: Consult with design the message of the marker

	//Override the current location if the user accepts the permissions
	loadGeolocation()
}

const displayCurrentSection = () => {
	const allPages = document.querySelectorAll('section.page')

	const pageId = location.hash ? location.hash : '#select-location'
	for (let page of allPages) {
		if (pageId === '#' + page.id) {
			page.style.display = 'block'
		} else {
			page.style.display = 'none'
		}
	}
}

const loadGeolocation = async () => {
	position = await Map.getCurrentLocation()
	map.setMarkerOnMap(position.latitude, position.longitude, 'You', {
		draggable: true,
	})
}

/**
 * Step 1: Location
 */

if (map) {
	map.on('click', onSelectLocation)
}

const onSelectLocation = (event) => {
	map.removeLayer(marker)
	map.setMarkerOnMap(event.latlng.lat, event.latlng.lng, 'Location selected', {
		draggable: true,
	})

	currentReport.location = {
		lat: event.latlng.lat,
		lng: event.latlng.lng,
		address: 'Fake address', //TODO: Get address
	}
}

/**
 * Step 2: Category List
 */
let categories = []
const getCategories = async () => {
	try {
		let response = await fetch(`${API_URL}/hazard-category`)
		let { data } = await response.json()
		const content = document.getElementById('hazard-category-content')

		for (let i = 0; i < data.length; i++) {
			const category = data[i]
			const div = document.createElement('div')
			const radio = document.createElement('input')

			if (category.options.length === 1) {
				categories.push(category.id)
			}

			radio.setAttribute('type', 'radio')
			radio.setAttribute('name', 'categoryRadioBtn')
			radio.setAttribute('id', `category-${category.id}-radio`)
			radio.setAttribute('value', category.id)
			radio.addEventListener('change', (event) => {
				currentReport.categoryId = event.target.value
			})

			const label = document.createElement('label')

			label.setAttribute('id', `category-${category.id}-label`)
			label.setAttribute('for', `category-${category.id}-radio`)
			label.innerHTML = category.name

			div.appendChild(radio)
			div.appendChild(label)

			content.appendChild(div)
		}
	} catch (error) {
		console.error(error)
	}
}

getCategories()

/**
 * Step 3: Hazard Options List
 */

hazardTypeBtn.addEventListener('click', async () => {
	console.log(categories.includes(currentReport.categoryId))
	if (categories.includes(currentReport.categoryId)) {
		window.location.href = '#additional-details'

		const content = document.getElementById('hazard-type-content')

		if (content) {
			content.innerHTML = ''
		}
	} else {
		window.location.href = '#hazard-type'

		const content = document.getElementById('hazard-type-content')

		if (content) {
			content.innerHTML = ''
		}
		try {
			const response = await fetch(`${API_URL}/hazard-category`)
			const { data } = await response.json()
			const content = document.getElementById('hazard-type-content')

			let index = -1
			for (let i = 0; i < data.length; i++) {
				if (data[i].id === currentReport.categoryId) {
					index = i
					break
				}
			}

			if (index !== -1) {
				const arrayType = data[index].options

				for (let i = 0; i < arrayType.length; i++) {
					const div = document.createElement('div')
					const radio = document.createElement('input')

					radio.setAttribute('type', 'radio')
					radio.setAttribute('name', 'categoryRadioBtn')
					radio.setAttribute('id', `category-${arrayType[i].id}-radio`)
					radio.setAttribute('value', arrayType[i].id)

					radio.addEventListener('change', (event) => {
						currentReport.typeId = event.target.value
					})

					const label = document.createElement('label')
					label.setAttribute('id', `category-${arrayType[i].id}-label`)
					label.setAttribute('for', `category-${arrayType[i].id}-radio`)
					label.innerHTML = arrayType[i].name

					div.appendChild(radio)
					div.appendChild(label)

					content.appendChild(div)
				}
			} else {
				console.log('Category not found on JSON.')
			}
		} catch (error) {
			console.error(error)
		}
	}
})

/**
 * Step 4: Comments
 */
commentInput.addEventListener('change', (event) => {
	currentReport.comment = event.target.value
})

/**
 * Step 5: Images
 * Pending
 */

//Checking if the user is accessing through a mobile browser or a desktop browser
function checkMobileDevice() {
	if (
		navigator.userAgent.match(/Android/i) ||
		navigator.userAgent.match(/webOS/i) ||
		navigator.userAgent.match(/iPhone/i) ||
		navigator.userAgent.match(/iPad/i) ||
		navigator.userAgent.match(/iPod/i) ||
		navigator.userAgent.match(/BlackBerry/i) ||
		navigator.userAgent.match(/Windows Phone/i)
	) {
		document.getElementById('desktop').style.display = 'none'
	} else {
		document.getElementById('mobile').style.display = 'none'
	}
}

checkMobileDevice()

let arrayPict = []

const video = document.getElementById('video')
const canvas1 = document.getElementById('canvas-1')
const context1 = canvas1.getContext('2d')
context1.scale(0.5, 0.5)
const startBtn = document.getElementById('starCameraBtn')
const stopBtn = document.getElementById('stop')
const sapBtn = document.getElementById('takePictureBtn')

//Open and close the camera on a desktop browser if the device has a camera
function startCamera() {
	document.getElementById('takePhoto').style.display = 'block'
	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		const mediaPromise = navigator.mediaDevices.getUserMedia({ video: true })
		mediaPromise.then((stream) => {
			video.srcObject = stream

			startBtn.disabled = true
			stopBtn.disabled = false
		})
		mediaPromise.catch((error) => {
			console.error(error)

			context1.font = '20px Tahoma'
			context1.fillText(error, 20, 100)
		})
		sapBtn.disabled = false
	} else {
		console.log("this browser doesn't support media devices")
	}
}

startBtn.addEventListener('click', startCamera)

function stopCamera() {
	document.getElementById('takePhoto').style.display = 'none'
	const tracks = video.srcObject.getTracks()
	tracks.forEach((track) => track.stop())
	startBtn.disabled = false
	stopBtn.disabled = true
	sapBtn.disabled = true
}

stopBtn.addEventListener('click', stopCamera)

document.getElementById('takePictureBtn').addEventListener('click', snapPhoto)

function snapPhoto() {
	if (arrayPict.length < 3) {
		context1.drawImage(video, 0, 0)

		const canvasDataURL = canvas1.toDataURL()

		arrayPict.push(canvasDataURL)
	} else {
		console.log('You have already taken 3 pictures.') //Display an alert box
	}
	currentReport.images = arrayPict
}

const fileInput = document.getElementById('uploadPictureInputDesktop')

//Click to upload a picture
fileInput.addEventListener('change', function () {
	const selectedFile = fileInput.files[0]
	if (arrayPict.length < 3) {
		if (selectedFile) {
			const reader = new FileReader()

			reader.onload = function (e) {
				const base64String = e.target.result.split(',')[1]
				arrayPict.push('data:image/png;base64,' + base64String)
			}

			reader.readAsDataURL(selectedFile)
		} else {
			imagesFirstOutput.innerHTML = ''
		}
	} else {
		console.log('You have already taken 3 pictures.') //Display an alert box
	}
})

//drag and drop option to upload picture
const dragAndDropArea = document.getElementById('dragAndDropArea')

dragAndDropArea.addEventListener('dragover', (e) => {
	e.preventDefault()
	dragAndDropArea.classList.add('active')
})

dragAndDropArea.addEventListener('dragleave', () => {
	dragAndDropArea.classList.remove('active')
})

dragAndDropArea.addEventListener('drop', (e) => {
	e.preventDefault()
	dragAndDropArea.classList.remove('active')
	handleFiles(e.dataTransfer.files)
})

function handleFiles(files) {
	for (const file of files) {
		if (file) {
			const reader = new FileReader()

			reader.onload = function (e) {
				const base64String = e.target.result.split(',')[1]
				arrayPict.push('data:image/png;base64,' + base64String)
			}

			reader.readAsDataURL(file)
		} else {
			imagesFirstOutput.innerHTML = ''
		}
	}
}

// Print images
function printPhotos() {
	imagesFirstOutput.innerHTML = ''

	for (let i = 0; i < 3; i++) {
		if (arrayPict[i]) {
			imagesFirstOutput.innerHTML += `<img src="${arrayPict[i]}" width="150" />`
			if (arrayPict.length > 2) {
				document.getElementById('takePictureBtn').style.display = 'none'
			}
		}
	}
}

function checkForChanges() {
	const newArrayPict = [...arrayPict]
	if (!arraysAreEqual(newArrayPict, previousArrayPict)) {
		previousArrayPict = newArrayPict
		const arrayChangeEvent = new Event('arraychange')
		document.dispatchEvent(arrayChangeEvent)
	}
}

function arraysAreEqual(array1, array2) {
	if (array1.length !== array2.length) {
		return false
	}
	for (let i = 0; i < array1.length; i++) {
		if (array1[i] !== array2[i]) {
			return false
		}
	}
	return true
}

const imagesFirstOutput = document.getElementById('imagesFirstOutput')
let previousArrayPict = []

setInterval(checkForChanges, 1000)

document.addEventListener('arraychange', printPhotos)

printPhotos()

//Mobile browser

const environmentMobileInput = document.getElementById('environmentMobile')
const uploadPictureInputMobile = document.getElementById(
	'uploadPictureInputMobile'
)
const imagesFirstOutput2 = document.getElementById('imagesFirstOutput2')

environmentMobileInput.addEventListener('change', handleFileSelection)
uploadPictureInputMobile.addEventListener('change', handleFileSelection)

function handleFileSelection(event) {
	const selectedFiles = event.target.files

	for (let i = 0; i < selectedFiles.length; i++) {
		if (arrayPict.length >= 3) {
			break
		}
		const selectedFile = selectedFiles[i]
		if (selectedFile.type.startsWith('image/')) {
			const imageElement = document.createElement('img')
			imageElement.src = URL.createObjectURL(selectedFile)
			arrayPict.push(imageElement)
		}
	}
	renderPhotos()
}

function renderPhotos() {
	imagesFirstOutput2.innerHTML = ''

	for (let i = 0; i < arrayPict.length; i++) {
		imagesFirstOutput2.appendChild(arrayPict[i])
	}
}

/**
 * Step 6: Show Confirmation
 */
showConfirmationBtn.addEventListener('click', () => {
	locationOutput.innerHTML = `${currentReport.location.address} (${currentReport.location.lat},${currentReport.location.lng})`
	categoryOutput.innerHTML = currentReport.categoryId
	hazardOptionOutput.innerHTML = currentReport.typeId
	commentOutput.innerHTML = currentReport.comment
})

/**
 * Submit Form
 */
reportHazardForm.addEventListener('submit', function (event) {
	event.preventDefault()
	console.log(currentReport)
	//TODO: Hit create hazard report endpoint
})
