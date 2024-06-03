const board = document.getElementById('board');
const player1TimerDisplay = document.getElementById('player1-time');
const player2TimerDisplay = document.getElementById('player2-time');
const size = 8;
let currentPlayer = 1;
let gameState = [];
let player1Timer = 60;
let player2Timer = 60;
let timerInterval = null;
let paused = false;
let gameStarted = false;

const pieceDisplayNames = {
    'Titan': 'Titan',
    'Tank': 'Tank',
    'Ricochet': '',
    'Semi-Ricochet': '',
    'Cannon': 'Cannon'
};
const pieceFontSizes = {
    'Titan': '13px',
    'Tank': '14px',
    'Cannon': '11px',
    
};


function initializeBoard() {
    board.innerHTML = '';
    gameState = Array(size).fill(null).map(() => Array(size).fill(null));

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `${row}-${col}`;
            tile.addEventListener('click', () => selectTile(row, col));
            board.appendChild(tile);
        }
    }

    placeInitialPieces();
    updateBoard();
}

function placeInitialPieces() {
    // Example initial placement for Player 1
    gameState[0][3] = { player: 1, type: 'Titan' };
    gameState[0][4] = { player: 1, type: 'Cannon' };
    gameState[0][6] = { player: 1, type: 'Tank' };
    gameState[0][1] = { player: 1, type: 'Tank' }
    gameState[0][2] = { player: 1, type: 'Ricochet',rotation: 0 };
    gameState[0][5] = { player: 1, type: 'Semi-Ricochet',rotation: 0 };
   
    // Example initial placement for Player 2
    gameState[7][3] = { player: 2, type: 'Titan' };
    gameState[7][4] = { player: 2, type: 'Cannon' };
    gameState[7][6] = { player: 2, type: 'Tank' };
    gameState[7][1] = { player: 2, type: 'Tank' }
    gameState[7][2] = { player: 2, type: 'Ricochet',rotation: 0 };
    gameState[7][5] = { player: 2, type: 'Semi-Ricochet',rotation: 0 };
}

function startGame() {
    currentPlayer = 1;
    player1Timer = 60;
    player2Timer = 60;
    paused = false;
    gameStarted = false;
    initializeBoard();
    updateBoard();
    updateTimers();
}

function pauseGame() {
    clearInterval(timerInterval);
    paused = true;
}

function resumeGame() {
    if (paused) {
        paused = false;
        startTimer();
    }
}

function resetGame() {
    clearInterval(timerInterval);
    startGame();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (currentPlayer === 1) {
            if (player1Timer > 0) {
                player1Timer--;
                player1TimerDisplay.textContent = player1Timer;
            } else {
                clearInterval(timerInterval);
                alert('Player 2 wins!');
                startGame();
            }
        } else {
            if (player2Timer > 0) {
                player2Timer--;
                player2TimerDisplay.textContent = player2Timer;
            } else {
                clearInterval(timerInterval);
                alert('Player 1 wins!');
                startGame();
            }
        }
    }, 1000);
}


let selectedPiece = null;
let selectedRow = -1;
let selectedCol = -1;

function selectTile(row, col) {
    const piece = gameState[row][col];
   
    if (selectedPiece) {
        if (isValidMove(row, col)) {
            movePiece(row, col);
            selectedPiece = row;
            selectedPiece = col;
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateBoard();
        


            if (!gameStarted) {
                gameStarted = true;
                startTimer();
            }

            return;
        } else {
            selectedPiece = null;
            updateBoard();
            return;
        }
    }
    if (piece && piece.player === currentPlayer) {
        selectedPiece = piece;
        selectedRow = row;
        selectedCol = col;
        console.log(`Selected ${piece.type} at (${row}, ${col}) for Player ${currentPlayer}`);
        highlightSelectedTile(row, col);
    }
}


    const piece = gameState[row][col];
    if (piece && piece.player === currentPlayer) {
        selectedPiece = piece;
        selectedRow = row;
        selectedCol = col;
        console.log(`Selected ${piece.type} at (${row}, ${col}) for Player ${currentPlayer}`);
        highlightSelectedTile(row, col);
    }


function isValidMove(row, col) {
    const rowDiff = Math.abs(row - selectedRow);
    const colDiff = Math.abs(col - selectedCol);

    if (rowDiff <= 1 && colDiff <= 1) {
        if (selectedPiece.type === 'Cannon') {
            // Cannons can only move horizontally in the base rank
            if (selectedPiece.player === 1 && selectedRow === 0 && row === 0) {
                return gameState[row][col] === null;
            } else if (selectedPiece.player === 2 && selectedRow === 7 && row === 7) {
                return gameState[row][col] === null;
            }
            return false;
        }
        return gameState[row][col] === null;
    }
    return false;
}

function movePiece(row, col) {
    gameState[selectedRow][selectedCol] = null;
    gameState[row][col] = selectedPiece;
}

function updateTimers() {
    player1TimerDisplay.textContent = player1Timer;
    player2TimerDisplay.textContent = player2Timer;
}

function highlightSelectedTile(row, col) {
    // Remove highlight from all tiles
    document.querySelectorAll('.tile').forEach(tile => tile.style.border = '1px solid #999');

    // Highlight the selected tile
    const selectedTile = document.getElementById(`${row}-${col}`);
    selectedTile.style.border = '2px solid yellow';
}
function rotatePiece(direction) {
    if (selectedPiece) {
        const { row, col, piece } = selectedPiece;
        if (piece.type === 'Ricochet' || piece.type === 'Semi-Ricochet') {
            const rotationStep = (piece.type === 'Ricochet') ? 90 : 45;
            piece.rotation = (piece.rotation + (direction === 'left' ? -rotationStep : rotationStep) + 360) % 360;
            gameState[row][col] = piece;
            updateBoard();
            currentPlayer = currentPlayer === 1 ? 2 : 1; // Switch player
            selectedPiece = null;
        }
    }
}

function updateBoard() {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const tile = document.getElementById(`${row}-${col}`);
            const piece = gameState[row][col];
            tile.innerHTML = ''; // Clear the previous content
            tile.className = 'tile';
            tile.style.fontSize = piece ? pieceFontSizes[piece.type] : 'inherit';
            if (piece) {
                tile.classList.add(`player${piece.player}`);
                if (piece.type === 'Ricochet' || piece.type === 'Semi-Ricochet') {
                    tile.classList.add(piece.type.toLowerCase().replace('-', ''));
                    tile.classList.add(`rotate-${piece.rotation}`);
                } else {
                    tile.textContent = pieceDisplayNames[piece.type];
                }
            }
        }
    }
}
document.getElementById('rotateLeft').addEventListener('click', () => rotatePiece('left'));
document.getElementById('rotateRight').addEventListener('click', () => rotatePiece('right'));


startGame();
