'use strict'

var WALL_BROKEN_SOUND = new Audio('sound/broken2.wav')
const END_OF_WARR_SOUND = new Audio('sound/end of warr.wav')
const BIG_BOMB_SOUND_SEND = new Audio('sound/big bomb send.wav')
const BIG_BOMB_SOUND = new Audio('sound/big bomb.mp3')
const FAST_BOMB_SOUND = new Audio('sound/fast bomb.wav')
const SHOTING_SOUND = new Audio('sound/shuting.wav')
const LOSE_SOUND = new Audio('sound/lose.wav')
const WIN_SOUND = new Audio('sound/win.mp3')
const BOUTTON_SOUND = new Audio('sound/button.mp3')
const CANDY_SOUND = new Audio('sound/candy.wav')

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

const HERO_ELEMENTS = [`&#127918`, `&#128053`, `&#128405`, `&#128526`, `&#129311`, `&#129409`, `&#129419`, `&#129492`, `&#129491`, `&#129497`, '&#128018']
const HELICOPTER_ELEMENTS = [`&#128641`, `&#9889`, `&#9992`, `&#11088`, `&#128009`, `&#128018`, `&#128029`, `&#128121`, `&#128122`, `&#128123`, `&#128125`, `&#128126`, `&#128127`, `&#128128`]
var heroElement = HERO_ELEMENTS[0]
var helicopterElement = HELICOPTER_ELEMENTS[0]
const CANDY_ELEMENT = `&#128176`
const WALL_ELEMENT = ''
const BOARD_SIZE = 11

const HELICOPTER_ROW_LENGTH = 3
const HELICOPTER_COL_COUNT = BOARD_SIZE - 1

var bigBombColor = 'red'
var shotGamerElement = `|`
var shotHlcptrsElement = `|`
var LASER_SPEED = 80
var NORMAL = 'normal'

var isPlay
var iOpen
var isBombChange
var isBigBomb
var isVictory
var isGoLeftOk
var isSilent = false
var isHlctrsGoDown
var isHlcptrsOnLand

var gIsHhlcptrsFreeze
var gMoveCounter
var gBigBombElement
var gFastBombElement
var gWallShotCount
var gLifeElement
var gFastBomb
var gBigBomb
var gBoard
var gWall

var gBlinkInterval
var gCandyInterval
var gShotInterval
var gBombSoundInterval
var gHlcptrShotInterval
var gHlcptrsShotingInterval
var gHlcptrsMovingInterval

var gHelicopters = {
    helicopters: null,
    shotIntervalSpeed: null,
    moveIntervalSpeed: null
}
var gGame = {
    isOn: false,
    helicopterCount: 0,
}
var gPlayer = {
    pos: null,
    laserSpeed: LASER_SPEED,
    isShoting: false,
    life: 3,
    points: 0,
    isLive: null
}

function initGame() {
    isVictory = false
    isGoLeftOk = true
    isBigBomb = false
    isBombChange = true
    gIsHhlcptrsFreeze = false
    isHlctrsGoDown = false
    gPlayer.isLive = true
    isHlcptrsOnLand = false
    iOpen = true
    gBigBombElement = '&#128640 &#128640 &#128640'
    gFastBombElement = '&#128163 &#128163 &#128163'
    gLifeElement = '&#128155 &#128155 &#128155'
    gBigBomb = 3
    gFastBomb = 3
    gMoveCounter = 1
    gWallShotCount = 0
    gBoard = createBoard(BOARD_SIZE)

    gPlayer.pos = {
        i: gBoard.length - 1,
        j: gBoard.length - 2
    }
    randerBoard(gBoard)
}

function play() {
    if (isPlay) return
    if (!isSilent) BOUTTON_SOUND.play
    isPlay = true
    gHelicopters.helicopters = createHelicopters()
    gHelicopters.shotIntervalSpeed = 700
    gHelicopters.moveIntervalSpeed = 2000
    addHlptrs(gHelicopters.helicopters)
    gWall = createWall()
    buildWall(gWall)
    changeHtml('bomb', gBigBombElement)
    changeHtml('fast', gFastBombElement)
    changeHtml('life', gLifeElement)
    changeHtml('i', 'i')
    changeDisplay('.play', 'none')
    changeDisplay('.information', 'none')
    addElement(gPlayer.pos, heroElement, HERO, NORMAL)
    gHlcptrsShotingInterval = setInterval(hlcptrsShoting, gHelicopters.shotIntervalSpeed)
    gHlcptrsMovingInterval = setInterval(movingHlcptrs, gHelicopters.moveIntervalSpeed)
    gCandyInterval = setInterval(addCandy, 10000)
    gBombSoundInterval = setInterval(changeBombSound(), 500)
}

function changeBombSound() {
    if (isBombChange) {
        WALL_BROKEN_SOUND = new Audio('sound/broken2.wav')
        isBombChange = false
    } else {
        WALL_BROKEN_SOUND = new Audio('sound/broken1.wav')
        isBombChange = true
    }
}

function restart() {
    if (!isSilent) BOUTTON_SOUND.play
    isPlay = false
    NORMAL = 'normal'
    bigBombColor = 'red'
    shotGamerElement = `|`
    shotHlcptrsElement = `|`
    LASER_SPEED = 80
    gPlayer.life = 3
    gPlayer.points = 0
    gGame.helicopterCount = 0
    changeText('points', gPlayer.points)
    changeDisplay('.setting', 'block')
    changeDisplay('.setting', 'flex')
    changeDisplay('.setting', 'flex')
    document.querySelector('.setting').style.flexDirection = 'row'
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
    clearIntervals()
    if (isHlcptrsOnLand) {
        var currCell
        var counter = 0
        if (!isSilent) END_OF_WARR_SOUND.play()
        var boomInterval = setInterval(() => {
            for (var i = gBoard.length - 2; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[i].length; j++) {
                    currCell = { i, j }
                    if (i === gBoard.length - 2) {
                        deleteElement(currCell, WALL)
                        deleteElement(currCell, WALL2)
                    }
                    changeCellColor(currCell, bigBombColor)
                    setTimeout(changeCellColor, 150, currCell, null)
                    counter++
                    if (counter === 50) clearInterval(boomInterval)
                }
            }
        }, 500)
    }
    if (isVictory) {
        if (!isSilent) WIN_SOUND.play()
        changeHtml('bless', 'You won!')
        showForSec('bless')
    } else {
        changeHtml('bless', 'You lose...')
        setTimeout(() => {
            if (!isPlay) return
            if (!isSilent) LOSE_SOUND.play()
            showForSec('bless')
            isPlay = false
        }, 4000)
    }
    if (gPlayer.isLive) deleteElement(gPlayer.pos, NORMAL)
}

function clearIntervals() {
    clearInterval(gHlcptrsShotingInterval)
    clearInterval(gHlcptrsMovingInterval)
    clearInterval(gHlcptrShotInterval)
    clearInterval(gShotInterval)
    clearInterval(gCandyInterval)
    clearInterval(gBombSoundInterval)
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
        if (j > 2 && j < 8) continue
        wall.push(createBlock({ i: gBoard.length - 2, j }, WALL_ELEMENT, WALL, WALL))
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
    if (!isSilent) SHOTING_SOUND.play()
    for (var i = gHelicopters.helicopters.length - 1; i >= 0; i--) {
        nextCell = gBoard[gHelicopters.helicopters[i].cell.i + 1][gHelicopters.helicopters[i].cell.j]
        if (nextCell.gameElement !== HELICOPTER) avlbHlcptrs.push(gHelicopters.helicopters[i])
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
        if (currPos.i > gBoard.length - 1) return
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
    if (!isHlctrsGoDown) {
        if (!isGoLeftOk) {
            for (var i = gHelicopters.helicopters.length - 1; i >= 0; i--) {
                currHlcptr = gHelicopters.helicopters[i]
                deleteElement(currHlcptr.cell, currHlcptr.type)
                currHlcptr.cell.j++
                addElement(currHlcptr.cell, currHlcptr.value, currHlcptr.element, currHlcptr.type)
            }
        } else {
            for (var i = 0; i < gHelicopters.helicopters.length; i++) {
                currHlcptr = gHelicopters.helicopters[i]
                deleteElement(currHlcptr.cell, currHlcptr.type)
                currHlcptr.cell.j--
                addElement(currHlcptr.cell, currHlcptr.value, currHlcptr.element, currHlcptr.type)
            }
        }
        gMoveCounter++
    } else gMoveCounter = 2
    if (gMoveCounter === (2)) {
        if (isGoLeftOk) isGoLeftOk = false
        else isGoLeftOk = true
        gMoveCounter = 0

        setTimeout(() => {
            if (!isPlay) return
            var counter = 0
            for (var i = gBoard.length - 1; i >= 0; i--) {
                for (var j = 0; j < gBoard.length; j++) {

                    if (gBoard[i][j].gameElement === HELICOPTER) {
                        for (var h = 0; h < gHelicopters.helicopters.length; h++) {
                            var hlcptr = gHelicopters.helicopters[h]
                            if (hlcptr.cell.i === i && hlcptr.cell.j === j) {
                                currHlcptr = hlcptr
                            }
                        }
                        deleteElement(currHlcptr.cell, currHlcptr.type)
                        currHlcptr.cell.i++
                        if (currHlcptr.type === 'side') currHlcptr.type = 'sky'
                        else currHlcptr.type = 'side'
                        addElement(currHlcptr.cell, currHlcptr.value, currHlcptr.element, currHlcptr.type)
                        if (currHlcptr.cell.i + 1 === gBoard.length - 2) {
                            isHlcptrsOnLand = true
                            gameOver()
                        }
                    }
                }
            }
        }, gHelicopters.moveIntervalSpeed / 2)
    }
}

function BlowUpNeighbors(cell) {
    if (!isSilent) BIG_BOMB_SOUND.play()
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) return
            if (gBoard[i][j].gameElement === HELICOPTER) {
                shotHlcptr({ i, j })
            }
        }
    }
    isBigBomb = false
}

function shotHlcptr(cell) {
    var hlcptr
    var currHlcptr
    for (var i = 0; i < gHelicopters.helicopters.length; i++) {
        hlcptr = gHelicopters.helicopters[i]
        if (hlcptr.cell.i === cell.i && hlcptr.cell.j === cell.j) {
            currHlcptr = hlcptr
            gHelicopters.helicopters.splice(i, 1)
        }
    }
    if (isBigBomb) {
        changeCellColor(cell, bigBombColor)
        setTimeout(changeCellColor, 150, cell, null)
    }
    deleteElement(currHlcptr.cell, currHlcptr.type)
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
    if (!isSilent) SHOTING_SOUND.play()
    var cell
    var currPos
    var counter = 1
    var shotPos = { i: gPlayer.pos.i, j: gPlayer.pos.j }

    gShotInterval = setInterval(() => {
        currPos = { i: shotPos.i - counter, j: shotPos.j }
        cell = gBoard[currPos.i][currPos.j]

        if (cell.gameElement === WALL) {
            clearInterval(gShotInterval)
            gPlayer.isShoting = false
            return
        } else if (cell.gameElement === HELICOPTER) meetHelicopter(currPos)
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
    gPlayer.life--
    gLifeElement = mySplit(gLifeElement, ' ')

    if (gPlayer.life === 2) NORMAL = 'sick'
    else if (gPlayer.life === 1) NORMAL = 'dying'

    deleteElement(gPlayer.pos, NORMAL)
    gPlayer.pos = {
        i: gBoard.length - 1,
        j: gBoard.length - 2
    }
    addElement(gPlayer.pos, heroElement, HERO, NORMAL)

    if (gPlayer.life === 0) {
        gLifeElement = ''
        deleteElement(gPlayer.pos, NORMAL)
        isHlctrsGoDown = true
        gPlayer.isLive = false
        clearInterval(gHlcptrsShotingInterval)
        clearInterval(gHlcptrsMovingInterval)
        gHelicopters.shotIntervalSpeed /= 5
        gHelicopters.moveIntervalSpeed /= 4
        gHlcptrsMovingInterval = setInterval(movingHlcptrs, gHelicopters.moveIntervalSpeed)
        gHlcptrsShotingInterval = setInterval(hlcptrsShoting, gHelicopters.shotIntervalSpeed)
    }
    changeHtml('life', gLifeElement)
}

function meetWall(cell) {
    var currIdx
    var currBlock
    if (!isSilent) WALL_BROKEN_SOUND.play()
    for (var i = 0; i < gWall.length; i++) {
        if (gWall[i].cell.i === cell.i && gWall[i].cell.j === cell.j) {
            currBlock = gWall[i]
            currIdx = i
        }
    }
    currBlock.shoutingCount++
    if (currBlock.shoutingCount === 1) {
        deleteElement(cell, WALL)
        addElement(cell, WALL_ELEMENT, WALL, WALL2)
    } else if (currBlock.shoutingCount === 3) {
        deleteElement(cell, WALL2)
        gWall.splice(currIdx, 1)
    }
    clearInterval(gHlcptrShotInterval)
}

function meetCandy() {
    if (!isSilent) CANDY_SOUND.play()
    gPlayer.points += HELICOPTER_COL_COUNT
    changeText('points', gPlayer.points)
    gIsHhlcptrsFreeze = true
    setTimeout(() => { gIsHhlcptrsFreeze = false }, 5000)
}

function moveHero(i, j) {
    if (j < 0 || j > gBoard[0].length - 1) return
    deleteElement(gPlayer.pos, NORMAL)
    gPlayer.pos = { i, j }
    addElement(gPlayer.pos, heroElement, HERO, NORMAL)
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
            helicopters.push(createHelicopter({ i, j }, helicopterElement, HELICOPTER, SKY))
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
    var typeClass = ''
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
    if (!isPlay || !gPlayer.isLive) return

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
                if (!isSilent) BIG_BOMB_SOUND_SEND.play()
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
                if (!isSilent) FAST_BOMB_SOUND.play()
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

function changeCellColor(cell, color) {
    document.querySelector(`.cell-${cell.i}-${cell.j}`).style.backgroundColor = color
}

function changeOpacity(cell, value) {
    document.querySelector(`.${cell}`).style.opacity = value
}

function changeDisplay(location, value) {
    document.querySelector(location).style.display = value
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
        BOUTTON_SOUND.play()
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

        bigBombColor = 'red'
    }
    if (value === '2') {
        changeBackground('body', 'rgb(0, 0, 0)')
        changeBackground('body', 'linear-gradient(90deg, rgba(0, 0, 0, 1) 7%, rgba(193, 37, 37, 1) 98%)')

        changeBackground('h1', 'rgb(0, 0, 0)')
        changeBackground('h1', 'linear-gradient(90deg, rgba(0, 0, 0, 1) 7%, rgba(193, 37, 37, 1) 98%)')
        changeColor('h1', 'white')

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

        bigBombColor = 'orange'
    }
}

function chooseHeroEmoji(value) {
    heroElement = HERO_ELEMENTS[value - 1]
    if (isPlay) {
        deleteElement(gPlayer.pos, NORMAL)
        addElement(gPlayer.pos, heroElement, HERO, NORMAL)
    }
}

function chooseAttackersEmoji(value) {
    helicopterElement = HELICOPTER_ELEMENTS[value - 1]
}

function closeSetting() {
    changeDisplay('.setting', 'none')
    changeDisplay('.play', 'block')
    changeDisplay('.information', 'block')
    changeHtml('i', 'x')
}

function information() {
    if (iOpen) {
        changeDisplay('.information', 'none')
        changeHtml('i', 'i')
        iOpen = false
    } else {
        changeDisplay('.information', 'block')
        changeHtml('i', 'x')
        iOpen = true
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