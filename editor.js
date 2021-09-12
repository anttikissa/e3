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

let scroll = {
	x: 0,
	y: 0,
}

editor.addEventListener('keydown', (ev) => {
//	log(ev.key, 'down')

	if (ev.key.startsWith('Arrow')) {
		ev.preventDefault()
		switch (ev.key) {
			case 'ArrowLeft': cursor.x--; cursor.desiredX = 0; limitCursorX(); break;
			case 'ArrowRight': cursor.x++; cursor.desiredX = 0; limitCursorX(); break;
			case 'ArrowUp': cursor.y--; limitCursorY(); break;
			case 'ArrowDown': cursor.y++; limitCursorY(); break;
		}

		// dummy scrolling
		//scroll.y = cursor.y
		//scroll.x = cursor.x

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

//	render()
})

editor.addEventListener('keyup', (ev) => {
//	log(ev.key, 'up')
})

let lines = fs.readFileSync('editor.js', 'utf8').split('\n')
//let lines = fs.readFileSync('index.html', 'utf8').split('\n')

// note that this contains the last line which is always empty,
// if the line is properly formatted (ends with a newline)
//log('lines', lines)

let fontWidth

// ensure correct cursor position after horizontal movement
function limitCursorX() {
//	log('limitCursorX')

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
//	log('limitCursorY')
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
		log('set cursor.desiredX', cursor.desiredX)
		cursor.x = lines[cursor.y].length
	}

	// and when the line gets wide again, restore the previous X
	// position that was saved in cursor.desiredX
	if (cursor.desiredX) {
		cursor.x = Math.min(cursor.desiredX, lines[cursor.y].length)
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
	let visibleLines = Math.ceil(editor.height / lineHeight)

	ctx.font = `${fontWeight} ${fontHeight}px Source Code Pro`
	let glyphWidth = ctx.measureText('x').width

	//
	// clear
	//
	ctx.clearRect(0, 0, editor.width, editor.height)

	let xAdjust = -scroll.x * lineHeight
	let yAdjust = -scroll.y * lineHeight

	// -1 because lines.length - 1 is the last line to be rendered
	// +1 because the number is converted from 0-based to 1-based number
	let maxLineNumberLength = String(lines.length).length - 1 + 1
	let textStartX = glyphWidth * (maxLineNumberLength + 1)

	//
	// draw cursor
	//
	ctx.fillStyle = '#f80'
	let cursorX = cursor.x * glyphWidth + textStartX
	let cursorY = cursor.y * lineHeight
	ctx.fillRect(cursorX + xAdjust, cursorY + yAdjust, cursorWidth, lineHeight)

	//
	// draw text
	//
	ctx.fillStyle = 'white'
	let y = fontHeight

	let start = 0
	let end = start + visibleLines

	// pad('x', 3') => '  x'
	function pad(s, length) {
		while (s.length < length) {
			s = ' ' + s
		}
		return s
	}

//	log(`rendering lines ${start + 1} to ${end - 1 + 1}`)
	for (let i = start; i < end; i++) {
		let line = lines[i]
		let x = 0
		let y = fontHeight + lineHeight * i
		if (i === cursor.y) {
			ctx.fillStyle = 'red'
		} else {
			ctx.fillStyle = 'white'
		}

		let lineText = pad(String(i + 1), maxLineNumberLength) + ' '
		ctx.fillText(lineText + line, x + xAdjust, y + yAdjust)
	}
}

//render()

function update(t) {
//	scroll.x = (1 + Math.sin(0.5 * t / 1000 - .5 * Math.PI)) * 10
//	scroll.y = (1 + Math.cos(0.7 * t / 1000 - .5 * Math.PI)) * 4
//	scroll.y = 5
	render()
	requestAnimationFrame(update)
}

update(0)

