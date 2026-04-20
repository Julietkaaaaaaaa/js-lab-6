'use strict';

(function () {
    // 1. Отримуємо елементи DOM (згідно Lab-6)
    const gridElement = document.getElementById('grid');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const targetElement = document.getElementById('target');
    const newGameBtn = document.getElementById('new-game-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Стан гри
    let levels = [];
    let currentLevelIndex = -1;
    let gridData = [];
    let moves = 0;
    let lastRow = -1;
    let lastCol = -1;
    let timerId = null;
    let timeElapsed = 0;
    let isGameActive = false;

    // 2. Завантаження даних (fetch згідно Lab-6)
    fetch('levels.json')
        .then(res => res.json())
        .then(data => {
            levels = data;
            startNewGame();
        })
        .catch(err => console.error('Помилка завантаження:', err));

    // 3. Логіка кнопок
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
        const level = levels[index];
        
        // Копіюємо масив (Lec 1.4), щоб оригінал у levels не змінювався під час гри
        gridData = level.grid.map(row => [...row]); 
        
        targetElement.textContent = level.targetMoves;
        moves = 0;
        lastRow = -1;
        lastCol = -1;
        movesElement.textContent = moves;
        
        isGameActive = true;
        resetTimer();
        startTimer();
        renderGrid();
    }

    // 4. Робота з DOM - відмальовування поля
    function renderGrid() {
        gridElement.innerHTML = ''; 
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement('div');
                // Одразу задаємо класи
                cell.className = gridData[r][c] === 1 ? 'cell is-on' : 'cell';
                cell.addEventListener('click', () => handleCellClick(r, c));
                gridElement.appendChild(cell);
            }
        }
    }

    // 5. Ввід користувача (обробка кліку)
    function handleCellClick(r, c) {
        if (!isGameActive) return;

        // Ігноруємо подвійний клік (вимога з відео)
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

        // Перемикаємо саму клітинку та її сусідів (хрестом)
        toggle(r, c);
        toggle(r - 1, c);
        toggle(r + 1, c);
        toggle(r, c - 1);
        toggle(r, c + 1);

        renderGrid();
        checkWin();
    }

    // Допоміжна функція для перемикання (з перевіркою меж поля)
    function toggle(r, c) {
        if (r >= 0 && r < 5 && c >= 0 && c < 5) {
            gridData[r][c] = gridData[r][c] === 1 ? 0 : 1;
        }
    }

    // 6. Перевірка на перемогу
    function checkWin() {
        const hasLight = gridData.some(row => row.includes(1));
        if (!hasLight) {
            isGameActive = false;
            clearInterval(timerId);
            setTimeout(() => alert(`Перемога! Ходів: ${moves}. Час: ${timeElapsed}с`), 100);
        }
    }

    // 7. Таймер
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
