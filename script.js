class Minesweeper {
    constructor() {
        this.board = [];
        this.mines = [];
        this.revealed = new Set();
        this.flagged = new Set();
        this.gameOver = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.isFlagMode = false;
        
        // Fixed game settings
        this.rows = 10; // Increased from 8 to 10 rows
        this.cols = 8;
        this.totalMines = Math.floor(this.rows * this.cols * 0.15); // 15% of cells are mines
        this.minesLeft = this.totalMines;

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        // Reset game state
        this.gameOver = false;
        this.firstClick = true;
        this.mines = [];
        this.revealed = new Set();
        this.flagged = new Set();
        this.minesLeft = this.totalMines;
        
        // Reset UI
        document.getElementById('game-overlay').classList.remove('show');
        this.createBoard();
        
        // Reset timer and mine count
        this.resetTimer();
        this.updateMinesCount();
    }

    createBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.mines = [];
        this.revealed = new Set();
        this.flagged = new Set();
        this.gameOver = false;
        this.firstClick = true;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.handleClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(row, col);
                });
                
                gameBoard.appendChild(cell);
            }
        }
    }

    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            if ((row !== firstRow || col !== firstCol) && !this.mines.includes(`${row},${col}`)) {
                this.mines.push(`${row},${col}`);
                minesPlaced++;
            }
        }
        
        this.calculateNumbers();
    }

    calculateNumbers() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.mines.includes(`${row},${col}`)) {
                    let count = 0;
                    for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                        for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                            if (this.mines.includes(`${r},${c}`)) {
                                count++;
                            }
                        }
                    }
                    this.board[row][col] = count;
                }
            }
        }
    }

    handleClick(row, col) {
        if (this.gameOver) return;

        if (this.isFlagMode) {
            this.handleFlag(row, col);
        } else {
            if (this.flagged.has(`${row},${col}`)) return;

            if (this.firstClick) {
                this.firstClick = false;
                this.placeMines(row, col);
                this.startTimer();
            }

            if (this.mines.includes(`${row},${col}`)) {
                this.gameOver = true;
                this.revealAllMines();
                this.stopTimer();
                this.showGameOver(false);
                return;
            }

            this.revealCell(row, col);
            this.checkWin();
        }
    }

    handleRightClick(row, col) {
        if (this.gameOver) return;

        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        const cellKey = `${row},${col}`;

        if (this.revealed.has(cellKey)) return;

        if (this.flagged.has(cellKey)) {
            this.flagged.delete(cellKey);
            cell.classList.remove('flagged');
            this.minesLeft++;
        } else {
            this.flagged.add(cellKey);
            cell.classList.add('flagged');
            this.minesLeft--;
        }

        this.updateMinesCount();
    }

    revealCell(row, col) {
        const cellKey = `${row},${col}`;
        if (this.revealed.has(cellKey) || this.flagged.has(cellKey)) return;

        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        this.revealed.add(cellKey);
        cell.classList.add('revealed');

        if (this.board[row][col] > 0 && this.board[row][col] <= 3) {
            cell.dataset.number = this.board[row][col];
        } else if (this.board[row][col] > 0) {
            cell.textContent = this.board[row][col];
        } else {
            for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                    if (r !== row || c !== col) {
                        this.revealCell(r, c);
                    }
                }
            }
        }
    }

    revealAllMines() {
        this.mines.forEach(mine => {
            const [row, col] = mine.split(',').map(Number);
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('mine');
            cell.textContent = '💣';
        });
    }

    checkWin() {
        const unrevealedCells = document.querySelectorAll('.cell:not(.revealed)');
        if (unrevealedCells.length === this.totalMines) {
            this.gameOver = true;
            this.stopTimer();
            this.showGameOver(true);
        }
    }

    showGameOver(isWin) {
        const overlay = document.getElementById('game-overlay');
        const resultImage = document.getElementById('result-image');
        resultImage.src = isWin ? 'Asset/youwon.svg' : 'Asset/gameover.svg';
        overlay.classList.add('show');
    }

    startTimer() {
        this.timer = 0;
        this.updateTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    resetTimer() {
        this.stopTimer();
        this.timer = 0;
        this.updateTimer();
    }

    updateTimer() {
        document.getElementById('time').textContent = this.timer;
    }

    updateMinesCount() {
        document.getElementById('mines-left').textContent = this.minesLeft;
    }

    handleFlag(row, col) {
        if (this.revealed.has(`${row},${col}`)) return;

        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        const cellKey = `${row},${col}`;

        if (this.flagged.has(cellKey)) {
            this.flagged.delete(cellKey);
            cell.classList.remove('flagged');
            this.minesLeft++;
        } else {
            this.flagged.add(cellKey);
            cell.classList.add('flagged');
            this.minesLeft--;
        }

        this.updateMinesCount();
    }

    toggleMode() {
        this.isFlagMode = !this.isFlagMode;
        const modeToggle = document.getElementById('mode-toggle');
        const currentMode = document.getElementById('current-mode');
        
        if (this.isFlagMode) {
            modeToggle.classList.add('flag-mode');
            currentMode.textContent = 'Flag';
        } else {
            modeToggle.classList.remove('flag-mode');
            currentMode.textContent = 'Reveal';
        }
    }

    setupEventListeners() {
        document.getElementById('reset-button').addEventListener('click', () => {
            this.initializeGame();
        });

        document.querySelector('.play-again-btn').addEventListener('click', () => {
            this.initializeGame();
        });

        document.getElementById('mode-toggle').addEventListener('click', () => {
            this.toggleMode();
        });
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Minesweeper();
});