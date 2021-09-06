let { app, BrowserWindow } = require('electron')

app.whenReady().then(() => {
	let win = new BrowserWindow({
		width: 1280,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			nativeWindowOpen: true,
			contextIsolation: false,
		}
	})

	win.loadFile('index.html')
})
