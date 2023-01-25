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
var isVictory
var isGoLeftOk
var gIsHhlcptrsFreeze

var gShotInterval
var gMovingHlcptrsInterval
var gMoveCounter
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
    gIsHhlcptrsFreeze = false
    gMoveCounter = 1
    gBoard = createBoard(BOARD_SIZE)
    gPlayer.pos = { i: gBoard.length - 1, j: (BOARD_SIZE - 1) / 2 }
    randerBoard(gBoard)
    addHlptrs()
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
    var currCell
    if (!isGoLeftOk) {
        for (var i = gBoard.length - 1; i >= 0; i--) {
            for (var j = gBoard.length - 1; j >= 0; j--) {
                if (gBoard[i][j].gameElement === HELICOPTER) {
                    deleteElement({ i, j }, SKY)
                    currCell = { i, j: j + 1 }
                    addElement(currCell, HELICOPTER_ELEMENT, HELICOPTER, SKY)
                }
            }
        }
        gMoveCounter++
    }

    else {
        for (var i = gBoard.length - 1; i >= 0; i--) {
            for (var j = 0; j < gBoard.length; j++) {
                if (gBoard[i][j].gameElement === HELICOPTER) {
                    deleteElement({ i, j }, SKY)
                    currCell = { i, j: j - 1 }
                    addElement(currCell, HELICOPTER_ELEMENT, HELICOPTER, SKY)
                }
            }
        }
        gMoveCounter++
    }
    if (gMoveCounter === 2) {
        setTimeout(() => {
            if (!isPlay) return
            for (var i = gBoard.length - 1; i >= 0; i--) {
                for (var j = 0; j < gBoard.length; j++) {
                    if (gBoard[i][j].gameElement === HELICOPTER) {
                        deleteElement({ i, j }, SKY)
                        currCell = { i: i + 1, j }
                        if (gBoard[currCell.i][currCell.j].type === LAND) gameOver()
                        addElement(currCell, HELICOPTER_ELEMENT, HELICOPTER, SKY)
                    }
                }
            }
        }, gGame.speedGame / 2)

        if (isGoLeftOk) {
            isGoLeftOk = false
            gMoveCounter = 0
        } else if (!isGoLeftOk) {
            isGoLeftOk = true
            gMoveCounter = 0
        }
    }
}

function shotHlcptr(cell) {
    clearInterval(gShotInterval)
    gGame.helicopterCount--
    gPlayer.points++
    changeText('points', gPlayer.points)
    gPlayer.isShoting = false
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
        if (gBoard[currPos.i][currPos.j].gameElement === HELICOPTER) shotHlcptr(currPos)
        addElement(currPos, SHOT_ELEMENT, SHOT, SHOT)
        counter++
        setTimeout(deleteElement, 70, currPos, SHOT)
        if (currPos.i === 0) {
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

function addHlptrs() {
    for (var i = 0; i < HELICOPTER_ROW_LENGTH; i++) {
        for (var j = 1; j < HELICOPTER_COL_COUNT; j++) {
            addElement({ i, j }, HELICOPTER_ELEMENT, HELICOPTER, SKY)
            gGame.helicopterCount++
        }
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
    randerCell(cell, null)
    removeClassFromCell(cell, type)
}

function changeHtml(cell, value) {
    document.querySelector(`.${cell}`).innerHTML = value
}

function changeText(cell, value) {
    document.querySelector(`.${cell}`).innerText = value
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