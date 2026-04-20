'use strict';

(function () {
    // Елементи DOM
    const gridElement = document.getElementById('grid');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const targetElement = document.getElementById('target');
    const statusMessage = document.getElementById('status-message');
    const newGameBtn = document.getElementById('new-game-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Стан ігрового сеансу
    let levels = [];
    let currentLevelIndex = -1;
    let gridData = [];
    let moves = 0;
    let timeElapsed = 0;
    let timerId = null;
    let lastRow = -1;
    let lastCol = -1;
    let isGameActive = false;

    // Отримання конфігурації рівнів
    fetch('levels.json')
        .then(res => res.json())
        .then(data => {
            levels = data;
            startNewGame();
        })
        .catch(err => console.error('Помилка сервера:', err));

    newGameBtn.addEventListener('click', startNewGame);
    restartBtn.addEventListener('click', () => loadLevel(currentLevelIndex));

    function startNewGame() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * levels.length);
        } while (newIndex === currentLevelIndex && levels.length > 1);
        
        currentLevelIndex = newIndex;
        loadLevel(currentLevelIndex);
    }

    function loadLevel(index) {
        if (index === -1) return;
        const level = levels[index];
        
        // Клонування масиву для уникнення передачі за посиланням (Lec 1.4)
        gridData = level.grid.map(row => [...row]);
        
        // Скидання інтерфейсу та лічильників
        targetElement.textContent = level.targetMoves;
        moves = 0;
        lastRow = -1;
        lastCol = -1;
        movesElement.textContent = moves;
        statusMessage.textContent = '';
        gridElement.style.pointerEvents = 'auto';
        gridElement.style.opacity = '1';
        
        isGameActive = true;
        resetTimer();
        startTimer();
        renderGrid();
    }

    // Візуалізація матриці в DOM
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

    // Обробка логіки ходу
    function handleCellClick(r, c) {
        if (!isGameActive) return;

        // Перевірка на повторний клік в ту саму клітинку
        if (r === lastRow && c === lastCol) {
            moves--; 
            lastRow = -1;
            lastCol = -1;
        } else {
            moves++;
            lastRow = r;
            lastCol = c;
        }
        movesElement.textContent = moves;

        // Перемикання станів (хрестоподібна область)
        toggle(r, c);
        toggle(r - 1, c);
        toggle(r + 1, c);
        toggle(r, c - 1);
        toggle(r, c + 1);

        renderGrid();
        checkWin();
    }

    function toggle(r, c) {
        if (r >= 0 && r < 5 && c >= 0 && c < 5) {
            gridData[r][c] = gridData[r][c] === 1 ? 0 : 1;
        }
    }

    // Перевірка умови завершення
    function checkWin() {
        const hasLight = gridData.some(row => row.includes(1));
        if (!hasLight) {
            isGameActive = false;
            clearInterval(timerId);
            
            // Блокування ігрового поля
            gridElement.style.pointerEvents = 'none';
            gridElement.style.opacity = '0.5';
            statusMessage.textContent = `🎉 ПЕРЕМОГА! Кроків: ${moves} за ${timeElapsed}с`;
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
        timerElement.textContent = '0';
    }

})();
