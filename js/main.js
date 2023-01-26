'use strict'

const DYING = 'dying'
const WEAK = 'weak'
const WALL = 'wall'
const WALL2 = 'wall2'
const WALL3 = 'wall3'
const CANDY = 'candy'
const SHOT = 'shot'
const HELICOPTER = `helicopter`
const HERO = 'hero'
const SKY = 'sky'

const HERO_ELEMENT = `&#127918`
const BOARD_SIZE = 11
const HELICOPTER_ELEMENT = `&#128641`
const CANDY_ELEMENT = `&#128176`
const WALL_ELEMENT = ''

const HELICOPTER_ROW_LENGTH = 3
const HELICOPTER_COL_COUNT = BOARD_SIZE - 1

var shotGamerElement = `|`
var shotHlcptrsElement = `|`
var LASER_SPEED = 80
var NORMAL = 'normal'

var isPlay
var isBigBomb
var isVictory
var isGoLeftOk
var isSilent = false

var gWallShotCount
var gFastBomb
var gBigBomb
var gLifeElement
var gBigBombElement
var gFastBombElement
var gIsHhlcptrsFreeze
var gMoveCounter
var gHelicopters
var gBoard
var gWall

var gCurrFirstHkcptrsRow
var gCandyInterval
var gShotInterval
var gHlcptrShotInterval
var gHlcptrsShotingInterval
var gMovingHlcptrsInterval

var gGame = {
    isOn: false,
    helicopterCount: 0,
    speedGame: 2000
}
var gPlayer = {
    pos: null,
    laserSpeed: LASER_SPEED,
    isShoting: false,
    life: 3,
    points: 0
}

function initGame() {
    isVictory = false
    isGoLeftOk = true
    isBigBomb = false
    gIsHhlcptrsFreeze = false
    gBigBombElement = '&#128640 &#128640 &#128640'
    gFastBombElement = '&#128163 &#128163 &#128163'
    gLifeElement = '&#128155 &#128155 &#128155'
    gBigBomb = 3
    gFastBomb = 3
    gMoveCounter = 1
    gWallShotCount = 0
    gCurrFirstHkcptrsRow = HELICOPTER_ROW_LENGTH - 1
    gBoard = createBoard(BOARD_SIZE)
    gHelicopters = createHelicopters()
    gPlayer.pos = {
        i: gBoard.length - 1,
        j: gBoard.length - 2
    }
    randerBoard(gBoard)
    addHlptrs(gHelicopters)
    gWall = createWall()
    buildWall(gWall)
    console.log(gWall)
}

function play() {
    if (isPlay) return
    changeOpacity('play', '0')
    changeHtml('bomb', gBigBombElement)
    changeHtml('fast', gFastBombElement)
    changeHtml('life', gLifeElement)
    isPlay = true
    addElement(gPlayer.pos, HERO_ELEMENT, HERO, NORMAL)
    gHlcptrsShotingInterval = setInterval(hlcptrsShoting, 700)
    gMovingHlcptrsInterval = setInterval(movingHlcptrs, gGame.speedGame)
    gCandyInterval = setInterval(addCandy, 10000)
}

function restart() {
    isPlay = false
    gPlayer.points = 0
    gPlayer.life = 3
    changeOpacity('play', '1')
    changeText('points', gPlayer.points)
    clearIntervals()
    initGame()
}

function checkIfVictory() {
    if (gGame.helicopterCount === 0) {
        isVictory = true
        return true
    }
    return false
}

function gameOver() {
    isPlay = false
    clearIntervals()
    showForSec('bless')
    if (isVictory) {
        changeHtml('bless', 'You won!')
    } else {
        changeHtml('bless', 'You lose...')
    }
    deleteElement(gPlayer.pos, NORMAL)
}

function clearIntervals() {
    clearInterval(gHlcptrsShotingInterval)
    clearInterval(gMovingHlcptrsInterval)
    clearInterval(gHlcptrShotInterval)
    clearInterval(gCandyInterval)
}

function buildWall(wall) {
    var currBlock
    for (var i = 0; i < wall.length; i++) {
        currBlock = wall[i]
        addElement(currBlock.cell, currBlock.value, currBlock.element, currBlock.type)
    }
}

function createWall() {
    var wall = []
    for (var j = 1; j <= 9; j++) {
        if (j > 3 && j < 7) continue
        wall.push(createBlock({ i: 9, j }, WALL_ELEMENT, WALL, WALL))
    }
    return wall
}

function createBlock(cell, value, element, type) {
    var block
    return block = {
        cell: cell,
        value: value,
        element: element,
        type: type,
        shoutingCount: 0
    }
}

function addCandy() {
    var currCell = findEnptyCell()
    addElement(currCell, CANDY_ELEMENT, CANDY, SKY)
    setTimeout(deleteElement, 5000, currCell, SKY)
}

function hlcptrsShoting() {
    var cell
    var shotPos
    var currPos
    var currHlcptrPos
    var currShotHlcptr
    var nextCell
    var counter = 0
    var avlbHlcptrs = []

    for (var i = gHelicopters.length - 1; i >= 0; i--) {
        if (gHelicopters[i].cell.i === gCurrFirstHkcptrsRow) {
            avlbHlcptrs.push(gHelicopters[i])
        }
    }
    if (!avlbHlcptrs.length) return
    currShotHlcptr = avlbHlcptrs[getRandomInt(0, avlbHlcptrs.length - 1)]
    currHlcptrPos = {
        i: currShotHlcptr.cell.i,
        j: currShotHlcptr.cell.j
    }

    shotPos = { i: currHlcptrPos.i + 1, j: currHlcptrPos.j }

    gHlcptrShotInterval = setInterval(() => {
        currPos = { i: shotPos.i + counter, j: shotPos.j }
        cell = gBoard[currPos.i][currPos.j]

        if (currPos.i < gBoard.length - 1) {
            nextCell = gBoard[currPos.i + 1][currPos.j]

            if (nextCell.gameElement === WALL) meetWall({ i: currPos.i + 1, j: currPos.j })
        }
        if (cell.gameElement === HERO) meetHero()

        addElement(currPos, shotHlcptrsElement, SHOT, SHOT)
        counter++
        setTimeout(deleteElement, 70, currPos, SHOT)
        if (currPos.i === gBoard.length - 1) {
            clearInterval(gHlcptrShotInterval)
        }
    }, gPlayer.laserSpeed)
}

function movingHlcptrs() {
    if (gIsHhlcptrsFreeze) return
    var currHlcptr

    if (!isGoLeftOk) {
        for (var i = gHelicopters.length - 1; i >= 0; i--) {
            currHlcptr = gHelicopters[i]
            deleteElement(currHlcptr.cell, currHlcptr.type)
            currHlcptr.cell.j++
            addElement(currHlcptr.cell, currHlcptr.value, currHlcptr.element, currHlcptr.type)
        }
    } else {
        for (var i = 0; i < gHelicopters.length; i++) {
            currHlcptr = gHelicopters[i]
            deleteElement(currHlcptr.cell, currHlcptr.type)
            currHlcptr.cell.j--
            addElement(currHlcptr.cell, currHlcptr.value, currHlcptr.element, currHlcptr.type)
        }
    }
    gMoveCounter++
    if (gMoveCounter === (2)) {
        if (isGoLeftOk) isGoLeftOk = false
        else isGoLeftOk = true
        gMoveCounter = 0

        setTimeout(() => {
            if (!isPlay) return
            for (var i = gBoard.length - 1; i >= 0; i--) {
                for (var j = 0; j < gBoard.length; j++) {

                    if (gBoard[i][j].gameElement === HELICOPTER) {
                        for (var h = 0; h < gHelicopters.length; h++) {
                            var hlcptr = gHelicopters[h]
                            if (hlcptr.cell.i === i && hlcptr.cell.j === j) {
                                currHlcptr = hlcptr
                            }
                        }
                        deleteElement(currHlcptr.cell, currHlcptr.type)
                        currHlcptr.cell.i++
                        addElement(currHlcptr.cell, currHlcptr.value, currHlcptr.element, currHlcptr.type)
                        if (currHlcptr.cell.i + 1 === gBoard.length - 2) gameOver()
                    }
                }
            }
        }, gGame.speedGame / 2)
        gCurrFirstHkcptrsRow++
    }
}

function BlowUpNeighbors(cell) {
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) return
            if (gBoard[i][j].gameElement === HELICOPTER) {
                shotHlcptr({ i, j })
            }
        }
    }
}

function shotHlcptr(cell) {
    var hlcptr
    var currHlcptr
    for (var i = 0; i < gHelicopters.length; i++) {
        hlcptr = gHelicopters[i]
        if (hlcptr.cell.i === cell.i && hlcptr.cell.j === cell.j) {
            currHlcptr = hlcptr
            gHelicopters.splice(i, 1)
        }
    }
    deleteElement(currHlcptr.cell, currHlcptr.type)
    clearInterval(gShotInterval)
    gGame.helicopterCount--
    gPlayer.points++
    changeText('points', gPlayer.points)
    gPlayer.isShoting = false
    isBigBomb = false
    if (checkIfVictory()) gameOver()
}

function shoting() {
    if (gPlayer.isShoting) return
    gPlayer.isShoting = true

    var cell
    var currPos
    var counter = 1
    var shotPos = { i: gPlayer.pos.i, j: gPlayer.pos.j }

    gShotInterval = setInterval(() => {
        currPos = { i: shotPos.i - counter, j: shotPos.j }
        cell = gBoard[currPos.i][currPos.j]

        if (cell.gameElement === WALL) clearInterval(gShotInterval)
        else if (cell.gameElement === HELICOPTER) meetHelicopter(currPos)
        else {
            if (cell.gameElement === CANDY) meetCandy()
            addElement(currPos, shotGamerElement, SHOT, SHOT)
            counter++
            setTimeout(deleteElement, 70, currPos, SHOT)
            if (currPos.i === 0) {
                isBigBomb = false
                gPlayer.isShoting = false
                clearInterval(gShotInterval)
            }
        }
    }, gPlayer.laserSpeed)
}

function meetHelicopter(cell) {
    if (isBigBomb) BlowUpNeighbors(cell)
    else shotHlcptr(cell)
}

function meetHero() {
    clearInterval(gHlcptrShotInterval)
    if (gPlayer.life > 0) {
        gPlayer.life--
        gLifeElement = mySplit(gLifeElement, ' ')
        if (gPlayer.life === 0) gLifeElement = ''
        changeHtml('life', gLifeElement)
    }

    if (gPlayer.life === 2) NORMAL = 'sick'
    else if (gPlayer.life === 1) NORMAL = 'dying'

    deleteElement(gPlayer.pos, NORMAL)
    gPlayer.pos = {
        i: gBoard.length - 1,
        j: gBoard.length - 2
    }
    addElement(gPlayer.pos, HERO_ELEMENT, HERO, NORMAL)
    if (gPlayer.life === 0) gameOver()
}

function meetWall(cell) {
    var currBlock
    for (var i = 0; i < gWall.length; i++) {
        if (gWall[i].cell.i === cell.i && gWall[i].cell.j === cell.j) currBlock = gWall[i]
    }
    currBlock.shoutingCount++

    if (currBlock.shoutingCount === 1) {
        deleteElement(cell, WALL)
        addElement(cell, WALL_ELEMENT, WALL, WALL2)
    } else if (currBlock.shoutingCount === 3) {
        deleteElement(cell, WALL2)
        addElement(cell, WALL_ELEMENT, WALL, WALL3)
    } else if (currBlock.shoutingCount === 5) deleteElement(cell, WALL3)

    if (gPlayer.isShoting) clearInterval(gShotInterval)
    else clearInterval(gHlcptrShotInterval)
}

function meetCandy() {
    gPlayer.points += HELICOPTER_COL_COUNT
    changeText('points', gPlayer.points)
    gIsHhlcptrsFreeze = true
    setTimeout(() => { gIsHhlcptrsFreeze = false }, 5000)
}

function moveHero(i, j) {
    if (j < 0 || j > gBoard[0].length - 1) return
    deleteElement(gPlayer.pos, NORMAL)
    gPlayer.pos = { i, j }
    addElement(gPlayer.pos, HERO_ELEMENT, HERO, NORMAL)
}

function addHlptrs(helicopters) {
    var currHlcptr
    for (var i = 0; i < helicopters.length; i++) {
        currHlcptr = helicopters[i]
        currHlcptr.isLive = true
        addElement(currHlcptr.cell, currHlcptr.value, currHlcptr.element, currHlcptr.type)
    }
}

function createHelicopters() {
    var helicopters = []
    for (var i = 0; i < HELICOPTER_ROW_LENGTH; i++) {
        for (var j = 1; j < HELICOPTER_COL_COUNT; j++) {
            helicopters.push(createHelicopter({ i, j }, HELICOPTER_ELEMENT, HELICOPTER, SKY))
            gGame.helicopterCount++
        }
    }
    return helicopters
}

function createHelicopter(cell, value, element, type) {
    var helicpter
    return helicpter = {
        cell: cell,
        value: value,
        element: element,
        type: type
    }
}

function randerCell(cell, value) {
    document.querySelector(`.cell-${cell.i}-${cell.j}`).innerHTML = value
}

function randerBoard(board) {
    var strHtml = ``
    var typeClass
    for (var i = 0; i < board.length; i++) {
        strHtml += `<tr>`
        if (i === board.length - 1) typeClass = NORMAL
        for (var j = 0; j < board[i].length; j++) {
            strHtml += `<td class=" ${typeClass} cell-${i}-${j}"></td>`
        }
        strHtml += `</tr >`
    }
    changeHtml('board', strHtml)
    return strHtml
}

function createBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                gameElement: null,
                type: null
            }
        }
    }
    return board
}

function handleKey(event) {
    if (!isPlay) return

    var i = gPlayer.pos.i;
    var j = gPlayer.pos.j;

    switch (event.key) {
        case 'ArrowLeft':
            moveHero(i, j - 1);
            break;
        case 'ArrowRight':
            moveHero(i, j + 1);
            break;
        case ' ':
            shoting();
            break;
        case 'n':
            if (gPlayer.isShoting) return
            if (gBigBomb > 0) {
                gBigBombElement = mySplit(gBigBombElement, ' ')
                gBigBomb--
                isBigBomb = true
                shotGamerElement = '&#128640'
                shoting()
                setTimeout(() => {
                    shotGamerElement = '|'
                }, 1000)
                if (gBigBomb === 0) gBigBombElement = ''
                changeHtml('bomb', gBigBombElement)
            }
            break;
        case 'x':
            if (gPlayer.isShoting) return
            if (gFastBomb > 0) {
                gFastBombElement = mySplit(gFastBombElement, ' ')
                LASER_SPEED *= 3
                gFastBomb--
                shotGamerElement = '^'
                shoting()
                setTimeout(() => {
                    LASER_SPEED /= 3
                    shotGamerElement = '|'
                }, 1000)
                if (gFastBomb === 0) gFastBombElement = ''
                changeHtml('fast', gFastBombElement)
            }
            break;
        default: console.log(event)
    }

}

function addElement(cell, value, element, type) {
    addClassToCell(cell, type)
    gBoard[cell.i][cell.j].gameElement = element
    gBoard[cell.i][cell.j].type = type
    randerCell(cell, value)
}

function deleteElement(cell, value) {
    gBoard[cell.i][cell.j].gameElement = null
    gBoard[cell.i][cell.j].type = null
    randerCell(cell, null)
    removeClassFromCell(cell, value)
}

function changeHtml(cell, value) {
    document.querySelector(`.${cell}`).innerHTML = value
}

function changeText(cell, value) {
    document.querySelector(`.${cell}`).innerText = value
}

function changeBackgroundColor(location, color) {
    document.querySelector(location).style.backgroundColor = color
}

function changeBackground(location, value) {
    document.querySelector(location).style.background = value
}

function changeColor(location, color) {
    document.querySelector(location).style.color = color
}

function changeOpacity(cell, value) {
    document.querySelector(`.${cell}`).style.opacity = value
}

function addClassToCell(cell, value) {
    document.querySelector(`.cell-${cell.i}-${cell.j}`).classList.add(value)
}

function removeClassFromCell(cell, value) {
    document.querySelector(`.cell-${cell.i}-${cell.j}`).classList.remove(value)
}

function showForSec(cell) {
    changeOpacity(cell, '0.91')
    setTimeout(changeOpacity, 1500, cell, '0')
}

function silent() {
    if (!isSilent) {
        isSilent = true
        changeHtml('silent', '&#128263')
    }
    else {
        isSilent = false
        changeHtml('silent', '&#128266')
    }
}

function chooseBoardColors(value) {
    if (value === '1') {
        changeBackground('body', 'rgb(50, 72, 144)')
        changeBackground('body', 'linear-gradient(90deg, rgba(50, 72, 144, 1) 7%, rgba(123, 182, 198, 1) 98%)')

        changeBackground('h1', 'rgb(101, 96, 172)')
        changeBackground('h1', 'linear-gradient(90deg, rgba(177, 171, 247, 1) 7%, rgba(158, 225, 230, 1) 82%)')
        changeColor('h1', 'black')

        changeBackground('.bless', '#003cff')
        changeColor('.bless', 'white')

        changeBackground('button', 'rgb(101, 96, 172)')
        changeBackground('button', 'linear-gradient(90deg, rgba(177, 171, 247, 1) 7%, rgba(158, 225, 230, 1) 82%)')
        changeColor('button', 'white')

        changeBackground('.restart', 'rgb(101, 96, 172)')
        changeBackground('.restart', 'linear-gradient(90deg, rgba(177, 171, 247, 1) 7%, rgba(158, 225, 230, 1) 82%)')
        changeColor('.restart', 'white')

        changeBackground('.silent', 'none')
        changeBackground('.silent', 'rgbrgb(17, 0, 100)')
        changeColor('.silent', 'white')

        changeBackground('.point', 'rgb(17, 0, 100)')
        changeColor('.point', 'white')

        changeBackground('.colors', 'rgb(17, 0, 100)')
        changeColor('.colors', 'white')
    }
    if (value === '2') {
        changeBackground('body', 'rgb(0, 0, 0)')
        changeBackground('body', 'linear-gradient(90deg, rgba(0, 0, 0, 1) 7%, rgba(193, 37, 37, 1) 98%)')

        changeBackground('h1', 'rgb(0, 0, 0)')
        changeBackground('h1', 'linear-gradient(90deg, rgba(0, 0, 0, 1) 7%, rgba(193, 37, 37, 1) 98%)')
        changeColor('h1', 'white')

        changeBackground('.bless', 'rgb(0, 0, 0)')
        changeBackground('.bless', 'linear-gradient(90deg, rgba(0, 0, 0, 1) 7%, rgba(193, 37, 37, 1) 98%)')
        changeColor('.bless', 'white')

        changeBackground('button', 'rgb(0, 0, 0)')
        changeBackground('button', 'linear-gradient(90deg, rgba(0, 0, 0, 1) 7%, rgba(193, 37, 37, 1) 98%)')
        changeColor('button', 'white')

        changeBackground('.restart', 'rgb(0, 0, 0)')
        changeBackground('.restart', 'linear-gradient(90deg, rgba(0, 0, 0, 1) 7%, rgba(193, 37, 37, 1) 98%)')
        changeColor('.restart', 'white')

        changeBackground('.silent', 'rgb(0, 0, 0)')
        changeBackground('.silent', 'linear-gradient(90deg, rgba(0, 0, 0, 1) 7%, rgba(193, 37, 37, 1) 98%)')
        changeColor('.silent', 'white')

        changeBackground('.point', 'rgb(0, 0, 0)')
        changeBackground('.point', 'linear-gradient(90deg, rgba(0, 0, 0, 1) 7%, rgba(193, 37, 37, 1) 98%)')
        changeColor('.point', 'white')

        changeBackground('.colors', 'rgb(0, 0, 0)')
        changeBackground('.colors', 'rgba(193, 37, 37, 1)')
        changeColor('.colors', 'black')
    }
}

function mySplit(str, sep) {
    for (var i = 0; i < str.length; i++) {
        if (str[i] === sep) {
            str = str.slice(i + 1, str.length)
        }
    }
    if (!str.includes(sep)) return str
    return str
}

function findEnptyCell() {
    var emptyCells = []
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].gameElement === null) emptyCells.push({ i, j })
        }
    }
    return emptyCells[getRandomInt(0, emptyCells.length - 1)]
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
}