'use strict';

(function () {
    // Ініціалізація DOM
    const gridElement = document.getElementById('grid');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const targetElement = document.getElementById('target');
    const newGameBtn = document.getElementById('new-game-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    const winModal = document.getElementById('win-modal');
    const modalMoves = document.getElementById('modal-moves');
    const modalTime = document.getElementById('modal-time');
    const modalNewGameBtn = document.getElementById('modal-new-game-btn');

    // Стан гри
    let levels = [], currentLevelIndex = -1, gridData = [];
    let moves = 0, lastRow = -1, lastCol = -1, timerId = null;
    let timeElapsed = 0, isGameActive = false;

    // Завантаження рівнів
    fetch('levels.json')
        .then(res => res.json())
        .then(data => {
            levels = data;
            startNewGame();
        });

    // Події
    newGameBtn.addEventListener('click', startNewGame);
    restartBtn.addEventListener('click', () => loadLevel(currentLevelIndex));
    modalNewGameBtn.addEventListener('click', startNewGame);

    function startNewGame() {
        winModal.style.display = 'none'; // Приховування вікна
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * levels.length);
        } while (newIndex === currentLevelIndex && levels.length > 1);
        currentLevelIndex = newIndex;
        loadLevel(currentLevelIndex);
    }

    function loadLevel(index) {
        winModal.style.display = 'none';
        const level = levels[index];
        gridData = level.grid.map(row => [...row]); 
        targetElement.textContent = level.targetMoves;
        moves = 0;
        lastRow = -1; lastCol = -1;
        movesElement.textContent = moves;
        isGameActive = true;
        resetTimer();
        startTimer();
        renderGrid();
    }

    function renderGrid() {
        gridElement.innerHTML = ''; 
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement('div');
                cell.className = gridData[r][c] === 1 ? 'cell is-on' : 'cell';
                cell.addEventListener('click', () => handleCellClick(r, c));
                gridElement.appendChild(cell);
            }
        }
    }

    function handleCellClick(r, c) {
        if (!isGameActive) return; // Блокування ходів

        if (r === lastRow && c === lastCol) {
            moves--; lastRow = -1; lastCol = -1;
        } else {
            moves++; lastRow = r; lastCol = c;
        }
        movesElement.textContent = moves;

        toggle(r, c);
        toggle(r - 1, c); toggle(r + 1, c);
        toggle(r, c - 1); toggle(r, c + 1);

        renderGrid();
        checkWin();
    }

    function toggle(r, c) {
        if (r >= 0 && r < 5 && c >= 0 && c < 5) {
            gridData[r][c] = gridData[r][c] === 1 ? 0 : 1;
        }
    }

    function checkWin() {
        const hasLight = gridData.some(row => row.includes(1));
        if (!hasLight) {
            isGameActive = false; // Зупинка гри
            clearInterval(timerId);
            modalMoves.textContent = moves;
            modalTime.textContent = timeElapsed;
            setTimeout(() => {
                winModal.style.display = 'flex'; // Показ вікна
            }, 300);
        }
    }

    function startTimer() {
        timerId = setInterval(() => {
            timeElapsed++;
            timerElement.textContent = timeElapsed;
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerId);
        timeElapsed = 0;
        timerElement.textContent = timeElapsed;
    }
})();
