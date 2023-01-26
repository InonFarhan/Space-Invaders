'use strict'

const BOARD_SIZE = 11
const HERO_ELEMENT = `&#127918`
const HELICOPTER_ELEMENT = `&#128641`
const SHOT_ELEMENT = `|`

const SHOT = 'shot'
const HELICOPTER = `helicopter`
const HERO = 'hero'
const SKY = 'sky'
const LAND = 'land'

const HELICOPTER_ROW_LENGTH = 3
const HELICOPTER_COL_COUNT = BOARD_SIZE - 1
const LASER_SPEED = 80

var isPlay
var isBigBomb
var isVictory
var isGoLeftOk
var gIsHhlcptrsFreeze
var isSilent = false

var gShotInterval
var gMovingHlcptrsInterval
var gMoveCounter
var gHelicopters
var gBoard

var gGame = {
    isOn: false,
    helicopterCount: 0,
    speedGame: 2000
}
var gPlayer = {
    pos: null,
    laserSpeed: LASER_SPEED,
    isShoting: false,
    points: 0
}

function initGame() {
    isVictory = false
    isGoLeftOk = true
    isBigBomb = false
    gIsHhlcptrsFreeze = false
    gMoveCounter = 1
    gBoard = createBoard(BOARD_SIZE)
    gHelicopters = createHelicopters()
    gPlayer.pos = {
        i: gBoard.length - 2,
        j: (BOARD_SIZE - 1) / 2
    }
    randerBoard(gBoard)
    addHlptrs(gHelicopters)
}

function play() {
    if (isPlay) return
    changeOpacity('play', '0')
    isPlay = true
    addElement(gPlayer.pos, HERO_ELEMENT, HERO, LAND)
    gMovingHlcptrsInterval = setInterval(movingHlcptrs, gGame.speedGame)
}

function restart() {
    isPlay = false
    gPlayer.points = 0
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
}

function clearIntervals() {
    clearInterval(gMovingHlcptrsInterval)
}

function cellCliked(cell) {
    console.log(cell)
}

function frees() {
    if (gIsHhlcptrsFreeze) gIsHhlcptrsFreeze = false
    else gIsHhlcptrsFreeze = true
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
    }
}

function BlowUpNeighbors(cell) {
    // HERO_ELEMENT = 
    // deleteElement(gPlayer.pos, LAND)
    // addElement(gPlayer.pos, HERO_ELEMENT, HERO, LAND)

    // setTimeout(() => {
    //     deleteElement(gPlayer.pos, LAND)
    //     HERO_ELEMENT = `&#127918`
    //     addElement(gPlayer.pos, HERO_ELEMENT, HERO, LAND)
    // }, 1000)

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

    var currPos
    var counter = 1
    var shotPos = { i: gPlayer.pos.i, j: gPlayer.pos.j }

    gShotInterval = setInterval(() => {
        currPos = { i: shotPos.i - counter, j: shotPos.j }
        if (gBoard[currPos.i][currPos.j].gameElement === HELICOPTER) {
            if (isBigBomb) BlowUpNeighbors(currPos)
            else shotHlcptr(currPos)
        }
        addElement(currPos, SHOT_ELEMENT, SHOT, SHOT)
        counter++
        setTimeout(deleteElement, 70, currPos, SHOT)
        if (currPos.i === 0) {
            isBigBomb = false
            gPlayer.isShoting = false
            clearInterval(gShotInterval)
        }
    }, gPlayer.laserSpeed)
}

function moveHero(i, j) {
    if (j < 0 || j > gBoard[0].length - 1) return
    deleteElement(gPlayer.pos, LAND)
    gPlayer.pos = { i, j }
    addElement(gPlayer.pos, HERO_ELEMENT, HERO, LAND)
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

    for (var i = 0; i < board.length; i++) {
        strHtml += `<tr>`
        for (var j = 0; j < board[i].length; j++) {

            strHtml += `<td onclick="cellCliked(this)" class="cell-${i}-${j}"></td>`
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
        case '`':
            frees();
            break;
        case 'n':
            isBigBomb = true
            shoting()
            break;

        default: console.log(event)
    }

}

function addElement(cell, value, element, type) {
    randerCell(cell, value)
    gBoard[cell.i][cell.j].gameElement = element
    gBoard[cell.i][cell.j].type = type
    addClassToCell(cell, type)
}

function deleteElement(cell, type) {
    gBoard[cell.i][cell.j].gameElement = null
    gBoard[cell.i][cell.j].type = null
    randerCell(cell, null)
    removeClassFromCell(cell, type)
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