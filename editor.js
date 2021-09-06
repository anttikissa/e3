let log = console.log
let fs = require('fs')

let editor = document.querySelector('canvas')
let ctx = editor.getContext('2d')
editor.focus()

let cursor = {
	x: 0,
	y: 0,
}

editor.addEventListener('keydown', (ev) => {
	log(ev.key, 'down')

	if (ev.key.startsWith('Arrow')) {
		ev.preventDefault()
		switch (ev.key) {
			case 'ArrowLeft': cursor.x--; break;
			case 'ArrowRight': cursor.x++; break;
			case 'ArrowUp': cursor.y--; break;
			case 'ArrowDown': cursor.y++; break;
		}
		render()
	}

	if (ev.key.length === 1) {
		insert(cursor.y, cursor.x, ev.key)
		cursor.x++
		render()
	}

	if (ev.key === 'Enter') {
		newline(cursor.y, cursor.x)
		cursor.x = 0
		cursor.y++
		render()
	}

	render()
})

editor.addEventListener('keyup', (ev) => {
	log(ev.key, 'up')
})

let lines = fs.readFileSync('editor.js', 'utf8').split('\n')

// note that this contains the last line which is always empty,
// if the line is properly formatted (ends with a newline)
//log('lines', lines)

let fontWidth

// insert string 'what' at (line, column)
function insert(line, column, what) {
	log(`insert "${what}" at (${line}, ${column})`)
	let content = lines[line]
	let left = content.slice(0, column)
	let right = content.slice(column, content.length)
	lines[line] = left + what + right
}

// insert newline at (line, column)
function newline(line, column) {
	log(`insert newline at (${line}, ${column})`)
	let content = lines[line]
	let left = content.slice(0, column)
	let right = content.slice(column, content.length)
	lines[line] = left
	lines.splice(line + 1, 0, right)
}

function render() {
	//
	// settings
	//
	let fontWeight = 300
	let lineHeight = 36
	let fontHeight = 32
	let cursorWidth = 4

	ctx.font = `${fontWeight} ${fontHeight}px Source Code Pro`
	let glyphWidth = ctx.measureText('x').width

	//
	// clear
	//
	ctx.clearRect(0, 0, editor.width, editor.height)

	//
	// draw cursor
	//
	ctx.fillStyle = '#f80'
	let cursorX = cursor.x * glyphWidth
	let cursorY = cursor.y * lineHeight
	ctx.fillRect(cursorX, cursorY, cursorWidth, lineHeight)

	//
	// draw text
	//
	ctx.fillStyle = 'white'
	let y = fontHeight
	for (let line of lines) {
		let x = 0
		ctx.fillText(line, x, y)
		y += lineHeight
	}
}

render()
