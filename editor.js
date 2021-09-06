let log = console.log
let fs = require('fs')

let editor = document.querySelector('canvas')
let ctx = editor.getContext('2d')
editor.focus()

let cursor = {
	x: 0,
	y: 0,
	// if you moved up or down to a line that was narrower than the
	// current current position, the previous position is saved in
	// cursor.desiredX and restored when there is space again;
	// desiredX = 0 means don't restore
	desiredX: 0
}

editor.addEventListener('keydown', (ev) => {
	log(ev.key, 'down')

	if (ev.key.startsWith('Arrow')) {
		ev.preventDefault()
		switch (ev.key) {
			case 'ArrowLeft': cursor.x--; cursor.desiredX = 0; limitCursorX(); break;
			case 'ArrowRight': cursor.x++; cursor.desiredX = 0; limitCursorX(); break;
			case 'ArrowUp': cursor.y--; limitCursorY(); break;
			case 'ArrowDown': cursor.y++; limitCursorY(); break;
		}
		render()
	}

	if (ev.key.length === 1) {
		insert(cursor.y, cursor.x, ev.key)
		render()
	}

	if (ev.key === 'Enter') {
		newline(cursor.y, cursor.x)
		render()
	}

	if (ev.key === 'Backspace') {
		backspace(cursor.y, cursor.x)
		render()
	}

	render()
})

editor.addEventListener('keyup', (ev) => {
	log(ev.key, 'up')
})

let lines = fs.readFileSync('editor.js', 'utf8').split('\n')
//let lines = fs.readFileSync('index.html', 'utf8').split('\n')

// note that this contains the last line which is always empty,
// if the line is properly formatted (ends with a newline)
//log('lines', lines)

let fontWidth

// ensure correct cursor position after horizontal movement
function limitCursorX() {
	log('limitCursorX')

	let currentLine = lines[cursor.y] || ''
	// tried to go too left? go to previous line
	if (cursor.x < 0) {
		cursor.y--
		let thatLine = lines[cursor.y]
		cursor.x = thatLine ? thatLine.length : 0
	} else if (cursor.x > currentLine.length) {
		cursor.y++
		cursor.x = 0
	}

	// call this since cursor.y might have changed due to code above
	limitCursorY()
}

// ensure correct cursor position after vertical movement
function limitCursorY() {
	log('limitCursorY')
	if (cursor.y < 0) {
		cursor.y = 0
	}

	if (cursor.y > lines.length - 1) {
		cursor.y = lines.length - 1
	}

	// moved to a line that is narrower than cursor.x?
	if (cursor.x > lines[cursor.y].length) {
		// this ensures that cursor.desiredX remembers the rightmost
		// position where the cursor was when we started to move
		// vertically
		cursor.desiredX = Math.max(cursor.desiredX, cursor.x)
		cursor.x = lines[cursor.y].length
	}

	// and when the line gets wide again, restore the previous X
	// position that was saved in cursor.desiredX
	if (cursor.desiredX && cursor.desiredX <= lines[cursor.y].length) {
		cursor.x = cursor.desiredX
	}
}

// insert string 'what' at (line, column)
function insert(line, column, what) {
	log(`insert "${what}" at (${line}, ${column})`)
	let content = lines[line]
	let left = content.slice(0, column)
	let right = content.slice(column, content.length)
	lines[line] = left + what + right
	cursor.x++
}

// insert newline at (line, column)
function newline(line, column) {
	log(`insert newline at (${line}, ${column})`)
	let content = lines[line]
	let left = content.slice(0, column)
	let right = content.slice(column, content.length)
	lines[line] = left
	lines.splice(line + 1, 0, right)

	cursor.x = 0
	cursor.y++
}

// remove character to left at (line, column)
function backspace(line, column) {
	log(`backspace at (${line}, ${column})`)
	let content = lines[line]

	if (cursor.x > 0) {
		let left = content.slice(0, column - 1)
		let right = content.slice(column, content.length)
		lines[line] = left + right
		cursor.x--
	} else {
		if (cursor.y === 0) {
			return
		}
		cursor.x = lines[cursor.y - 1].length
		lines[cursor.y - 1] += lines[cursor.y]
		lines.splice(cursor.y, 1)
		cursor.y--
	}
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
