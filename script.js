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

    // Стан гри
    let levels = [];
    let currentLevelIndex = -1;
    let gridData = [];
    let moves = 0;
    let timeElapsed = 0;
    let timerId = null;
    let lastRow = -1;
    let lastCol = -1;
    let isGameActive = false;

    // Завантаження рівнів через fetch
    fetch('levels.json')
        .then(res => res.json())
        .then(data => {
            levels = data;
            startNewGame();
        });

    // Слухачі подій
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

    // Ініціалізація ігрового поля
    function loadLevel(index) {
        if (index === -1) return;
        
        // Глибоке копіювання масиву (передача за значенням)
        gridData = levels[index].grid.map(row => [...row]);
        
        targetElement.textContent = levels[index].targetMoves;
        moves = 0;
        lastRow = -1;
        lastCol = -1;
        movesElement.textContent = moves;
        statusMessage.innerHTML = '';
        
        gridElement.style.opacity = '1';
        gridElement.style.pointerEvents = 'auto';
        
        isGameActive = true;
        resetTimer();
        startTimer();
        renderGrid();
    }

    // Генерація DOM-вузлів клітинок
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

    // Обробка вводу користувача
    function handleCellClick(r, c) {
        if (!isGameActive) return;

        // Ігнорування повторних кліків у ту саму точку
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

        // Зміна стану клітинок (хрестом)
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

    // Перевірка умови завершення гри
    function checkWin() {
        const hasLight = gridData.some(row => row.includes(1));
        if (!hasLight) {
            isGameActive = false;
            clearInterval(timerId);
            
            gridElement.style.opacity = '0.4';
            gridElement.style.pointerEvents = 'none';
            statusMessage.innerHTML = `ПЕРЕМОГА!<br>${moves} кроків за ${timeElapsed}с`;
        }
    }

    // Керування таймером
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
