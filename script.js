'use strict';

(function () {
    // Ініціалізація DOM-елементів
    const gridElement = document.getElementById('grid');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const targetElement = document.getElementById('target');
    const newGameBtn = document.getElementById('new-game-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // Ініціалізація елементів модального вікна
    const winModal = document.getElementById('win-modal');
    const modalMoves = document.getElementById('modal-moves');
    const modalTime = document.getElementById('modal-time');
    const modalNewGameBtn = document.getElementById('modal-new-game-btn');

    // Оголошення змінних стану
    let levels = [];
    let currentLevelIndex = -1;
    let gridData = [];
    let moves = 0;
    let lastRow = -1;
    let lastCol = -1;
    let timerId = null;
    let timeElapsed = 0;
    let isGameActive = false;

    // Завантаження масиву рівнів із сервера
    fetch('levels.json')
        .then(res => res.json())
        .then(data => {
            levels = data;
            startNewGame();
        })
        .catch(err => console.error('Помилка завантаження:', err));

    // Налаштування обробників подій для кнопок
    newGameBtn.addEventListener('click', startNewGame);
    restartBtn.addEventListener('click', () => loadLevel(currentLevelIndex));
    modalNewGameBtn.addEventListener('click', startNewGame);

    // Функція початку нової гри
    function startNewGame() {
        winModal.classList.add('hidden'); 
        
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * levels.length);
        } while (newIndex === currentLevelIndex && levels.length > 1);
        
        currentLevelIndex = newIndex;
        loadLevel(currentLevelIndex);
    }

    // Функція завантаження обраного рівня
    function loadLevel(index) {
        winModal.classList.add('hidden'); 
        
        const level = levels[index];
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

    // Функція генерації ігрового поля
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

    // Функція обробки кліку по клітинці
    function handleCellClick(r, c) {
        if (!isGameActive) return;

        // Перевірка подвійного кліку (скасування ходу)
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

        // Інвертування стану поточної клітинки та сусідніх
        toggle(r, c);
        toggle(r - 1, c);
        toggle(r + 1, c);
        toggle(r, c - 1);
        toggle(r, c + 1);

        renderGrid();
        checkWin();
    }

    // Функція інвертування стану окремої клітинки
    function toggle(r, c) {
        if (r >= 0 && r < 5 && c >= 0 && c < 5) {
            gridData[r][c] = gridData[r][c] === 1 ? 0 : 1;
        }
    }

    // Функція перевірки умов перемоги
    function checkWin() {
        const hasLight = gridData.some(row => row.includes(1));
        if (!hasLight) {
            isGameActive = false;
            clearInterval(timerId);
            
            modalMoves.textContent = moves;
            modalTime.textContent = timeElapsed;
            
            setTimeout(() => {
                winModal.classList.remove('hidden');
            }, 300);
        }
    }

    // Функції управління ігровим таймером
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
