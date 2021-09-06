let log = console.log
let fs = require('fs')

let editor = document.querySelector('canvas')
let ctx = editor.getContext('2d')
editor.focus()

editor.addEventListener('keydown', (ev) => {
	log(ev.key, 'down')
})

editor.addEventListener('keydown', (ev) => {
	log(ev.key, 'up')
})

let lines = fs.readFileSync('editor.js', 'utf8').split('\n')
log('lines', lines)

function render() {
	let fontWeight = 300
	let lineHeight = 36

	ctx.fillStyle = 'white'
	ctx.font = `${fontWeight} 32px Source Code Pro`

	let y = lineHeight
	for (let line of lines) {
		let x = 0
		ctx.fillText(line, x, y)
		y += lineHeight
	}
}

render()
