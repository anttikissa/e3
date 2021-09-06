let { app, BrowserWindow } = require('electron')

app.whenReady().then(() => {
	console.log('moi')
	let win = new BrowserWindow({
		width: 1280,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			nativeWindowOpen: true,
		}
	})

	win.loadFile('index.html')
})
