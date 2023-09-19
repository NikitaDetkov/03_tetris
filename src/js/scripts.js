import {
    PLAY_FIELD_ROWS, // Кол-во строк
    PLAY_FIELD_COLUMNS, // Кол-во колонн
    SHAPE_NAMES, // Массив названий фигур
    SPAPE_MATRICES, // Объект с матрицами фигур по названиям
    SAD_FACE // Матрица с рисунком грустного лица для конца игры
} from './constants.js';

import {
    getRandomElement,
    rotateMatrix
} from './functions.js';

// Кнопка старта
const startBtn = document.querySelector('#start');
// Блок с кнопкой старт
const startBtnWrapper = document.querySelector('#btn-start-wrapper');
// Кнопка рестарта
const restartBtn = document.querySelector('#restart');
// Активная зона игры
const gameActive = document.querySelector('#active-game');

// Кнопки для перемещения фигуры
const leftBtn = document.querySelector('#btn-left'); // Влево
const rightBtn = document.querySelector('#btn-right'); // Вправо
const rotateRightBtn = document.querySelector('#btn-rotate-right'); // По часовой стрелке
const rotateLeftBtn = document.querySelector('#btn-rotate-left'); // Против часовой стрелки
const downBtn = document.querySelector('#btn-down'); // Вниз
const downImmediatelyBtn = document.querySelector('#btn-down-immediately'); // Вниз до конца

// Активная фигура (падающая)
let fallingShape;
// Флаг конца игры
let isGameOver;

// Счетчик количества фигур
const blocksCounter = document.querySelector('#blocks-counter');
// Счетчик количества исчезнувших строк
const linesCounter = document.querySelector('#lines-counter');

// Id для анимации
let requestId;
let timeoutId;

// Массив для поля
let playField = new Array(PLAY_FIELD_ROWS).fill()
    .map(() => new Array(PLAY_FIELD_COLUMNS));

// Ячейки игрового поля
const cells = document.querySelectorAll('.cell'); 

// Слушатели событий ===========================================================

// Слушатель событий для кнопки start. Запуск игры
startBtn.addEventListener('click', firstStartGame);
// Слушатель событий для кнопки restart. Перезапуск игры
restartBtn.addEventListener('click', restartGame);

// Функции ======================================================================= 

// Функция для первого старта игры
function firstStartGame() {
    // Скрыть блок с кнопкой start
    startBtnWrapper.classList.add('hide');
    // Показать блок с активной игрой
    gameActive.classList.add('show');

    startGame(); // Начать игру
}

// Функция для старта игры
function startGame() {
    // Опустить флаг конца игры
    isGameOver = false;
    // Обнулить счетчики
    blocksCounter.innerHTML = 0;
    linesCounter.innerHTML = 0;
    // Заполнение матрицы поля нулями
    playField = playField.map((elem) => elem.fill(0));
    // Сгенерировать новую падающую фигуру
    generateShape();
    // Начать движение первой фгуры
    moveShapeDown();

    // Слушатель событий для нажатий на клавишы
    document.addEventListener('keydown', onKeydown);

    // Слушатель событий для кнопки движения фигуры влево
    leftBtn.addEventListener('click', moveShapeLeft);
    // Слушатель событий для кнопки движения фигуры вправо
    rightBtn.addEventListener('click', moveShapeRight);
    // Слушатель событий для кнопки поворота фигуры против часовой стрелки
    rotateLeftBtn.addEventListener('click', rotateShapeLeft);
    // Слушатель событий для кнопки поворота фигуры по часовой стрелке
    rotateRightBtn.addEventListener('click', rotateShapeRight);
    // Слушатель событий для кнопки движения фигуры вниз
    downBtn.addEventListener('click', moveShapeDown);
    // Слушатель событий для кнопки немедленного перемещения фигуры вниз
    downImmediatelyBtn.addEventListener('click', moveShapeDownImmediately);
}

// Функция для генерации фигуры (имя, матрица, координаты)
function generateShape() {
    const name = getRandomElement(SHAPE_NAMES);
    const matrix = SPAPE_MATRICES[name];

    const column = PLAY_FIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
    const row = -2;

    fallingShape = {name, matrix, column, row, ghostColumn: column, ghostRow: row};

    // Рассчет положения призрачной фигуры
    calculateGhostPosition();
}

// Функция для перерисовки всего поля
function drawField() {
    // Удалить все классы у фигур
    cells.forEach(cell => cell.removeAttribute('class'));
    drawFexedField(); // Отрисовать фиксированную часть поля
    drawShape(); // Отрисовать фигуру
    drawGhostShape(); // Отрисовать призрачную фигуру
}

// Функция для отрисовки фиксированной части поля
function drawFexedField() {
    for (let row = 0; row < PLAY_FIELD_ROWS; row++) {
        for (let column = 0; column < PLAY_FIELD_COLUMNS; column++) {
            if (!playField[row][column]) continue;

            const name = playField[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);  
        }
    }
}

// Функция для отрисовки падающей фигуры
function drawShape() {
    const nameShape = fallingShape.name;
    const sizeShape = fallingShape.matrix.length;

    for (let row = 0; row < sizeShape; row++) {
        for (let column = 0; column < sizeShape; column++) {
            if(!fallingShape.matrix[row][column]) continue;

            if(fallingShape.row + row < 0) continue;
            // Получение индекса элемента 
            const cellIndex = convertPositionToIndex(fallingShape.row + row, fallingShape.column + column);
            // Добавление стиля элементу
            cells[cellIndex].classList.add(nameShape);
        }
    }
}

// Функция для вычисления индекса (для плоского массива cells) через координаты
function convertPositionToIndex(row, column) {
    return row * PLAY_FIELD_COLUMNS + column;
}

// Функция для движения фигуры вниз
// Увеличивает строку на 1
function moveShapeDown() {
    fallingShape.row += 1;
    if (!isValidPosition()) {
        fallingShape.row -= 1;
        fixShape();
    }

    drawField();

    stopLoop();
    startLoop();

    if (isGameOver) {
        gameOver();
    }
}

// Функция для движения фигуры вниз
// Увеличивает колонку на 1
function moveShapeRight() {
    fallingShape.column += 1;
    if (!isValidPosition()) {
        fallingShape.column -= 1;
    } else {
        calculateGhostPosition();
    }

    drawField();
}

// Функция для движения фигуры влево
// Уменьшает колонку на 1
function moveShapeLeft() {
    fallingShape.column -= 1;
    if (!isValidPosition()) {
        fallingShape.column += 1;
    } else {
        calculateGhostPosition();
    }

    drawField();
}

// Функция для поворота фигуры по часовой стрелке
function rotateShapeRight() {
    const oldMatrix = fallingShape.matrix;
    fallingShape.matrix = rotateMatrix(fallingShape.matrix, 'right');
    if (!isValidPosition()) {
        fallingShape.matrix = oldMatrix;
    } else {
        calculateGhostPosition();
    }

    drawField();
}

// Функция для поворота фигуры против часовой стрелки
function rotateShapeLeft() {
    const oldMatrix = fallingShape.matrix;
    fallingShape.matrix = rotateMatrix(fallingShape.matrix, 'left');
    if (!isValidPosition()) {
        fallingShape.matrix = oldMatrix;
    } else {
        calculateGhostPosition();
    }

    drawField();
}

// Функция для движения фигуры вниз до самого конца
function moveShapeDownImmediately() {
    fallingShape.row = fallingShape.ghostRow;
    fixShape();

    drawField();
    stopLoop();
    startLoop();

    if (isGameOver) {
        gameOver();
    }
}

// Функция для слушателя событий
// Движение фигуры в зависимости от нажатой клавиши 
function onKeydown(event) {
    switch (event.key) {
        case 'Enter': 
            event.preventDefault();
            rotateShapeLeft();
            break;
        case 'ArrowUp':
            rotateShapeRight();
            break;
        case 'ArrowDown':
            moveShapeDown();
            break;
        case 'ArrowLeft':
            moveShapeLeft();
            break;
        case 'ArrowRight':
            moveShapeRight();
            break;
        case ' ':
            event.preventDefault();
            moveShapeDownImmediately();
            break;
        default: 
            break;
    }
}

// Функция для проверки валидности позиции
// Возращает: true, если позиция валидна, иначе - false
function isValidPosition() {
    const size = fallingShape.matrix.length;

    for (let row = 0; row < size; row++) {
        for (let column = 0; column < size; column++) {
            if (!fallingShape.matrix[row][column]) continue;

            // Проверка, вышла ли фигура за игровое поле
            if (isOutsidePlayingField(row, column)) return false;
            // Проверка, каксается ли фигура других фигур
            if (isOverlay(row, column)) return false; 
        }
    }
    return true;
}

// Функция для проверки выхода элемента за игровое поле
// Возвращает: true, если элемент в игровом поле, иначе - false
function isOutsidePlayingField(row, column) {
    return fallingShape.column + column < 0 || 
        fallingShape.column + column >= PLAY_FIELD_COLUMNS ||
        fallingShape.row + row >= PLAY_FIELD_ROWS;
}

// Функция для фиксирования фигуры при достижении нижней позиции
// Тажке происходит создание новой фигуры и удаление заполненных линий
function fixShape() {
    const size = fallingShape.matrix.length;

    for (let row = 0; row < size; row++) {
        for (let column = 0; column < size; column++) {
            if (!fallingShape.matrix[row][column]) continue;

            // Окончание игры, если фигура вышла за пределы
            if (isOutsideOfTopBorder(row)) {
                isGameOver = true;
                return;
            }

            playField[fallingShape.row + row][fallingShape.column + column] = fallingShape.name;
        }
    }

    incrementCounter(blocksCounter, 1); // Увеличить счетчик блоков на 1
    processFilledRows(); // Удалить все заполненные линии
    generateShape(); // Сгенерировать новую фигуру
}

function isOutsideOfTopBorder(row) {
    return fallingShape.row + row < 0;
}

// Функция для проверки наложения фигур
// Принимает: номер строки, номер столбца
// Возвращает true, если наложение не было, иначе - false
function isOverlay(row, column) {
    return playField[fallingShape.row + row]?.[fallingShape.column + column]
}

// Функция для обработки заполненных строк
function processFilledRows() {
    const filledRows = findFilledRows();
    // Увеличить счетчик исчезнувших строк на длину массива исчезнувших строк
    incrementCounter(linesCounter, filledRows.length);
    deleteFilledRows(filledRows);
}

// Функция для поиска заполненных строк
function findFilledRows() {
    const filledRows = [];

    for (let row = 0; row < PLAY_FIELD_ROWS; row++) {
        if (playField[row].every(cell => Boolean(cell))) {
            filledRows.push(row);
        }
    }

    return filledRows;
}

// Функция для удаления заполненных строк
function deleteFilledRows(filledRows) {
    filledRows.forEach(rowToDelete => {
        for (let row = rowToDelete; row > 0; row--) {
            playField[row] = playField[row - 1];
        }
        playField[0] = new Array(PLAY_FIELD_COLUMNS).fill(0);
    })
}

// Функция для начала движения фигуры вниз
function startLoop() {
    timeoutId = setTimeout(() => requestId = requestAnimationFrame(moveShapeDown), 700);
}

// Функция для остановки движения фигуры вниз
function stopLoop() {
    cancelAnimationFrame(requestId);
    clearTimeout(timeoutId);
}

// Функция для завершения игры
function gameOver() {
    stopLoop();

    // Удаление слушателей событий для управления
    document.removeEventListener('keydown', onKeydown);
    leftBtn.removeEventListener('click', moveShapeLeft);
    rightBtn.removeEventListener('click', moveShapeRight);
    rotateLeftBtn.removeEventListener('click', rotateShapeLeft);
    rotateRightBtn.removeEventListener('click', rotateShapeRight);
    downBtn.removeEventListener('click', moveShapeDown);
    downImmediatelyBtn.removeEventListener('click', moveShapeDownImmediately);

    // Запустить анимацию окончания игры
    gameOverAnimation();
}

// Функция для рассчета положения призрачной фигуры
function calculateGhostPosition() {
    const shapeRow = fallingShape.row;
    fallingShape.row++;

    while (isValidPosition()) {
        fallingShape.row++
    }

    fallingShape.ghostRow = fallingShape.row - 1;
    fallingShape.ghostColumn = fallingShape.column;
    fallingShape.row = shapeRow;
}

// Функция для отрисовки призрачной фигуры
// Рисует призрачную фигуру, расположенную под падающей
function drawGhostShape() {
    const size = fallingShape.matrix.length;
    for (let row = 0; row < size; row++) {
        for (let column = 0; column < size; column++) {
            if (!fallingShape.matrix[row][column]) continue;

            if (fallingShape.ghostRow + row < 0) continue;

            const cellIndex = convertPositionToIndex(fallingShape.ghostRow + row, 
                fallingShape.ghostColumn + column)
            cells[cellIndex].classList.add('ghost');
        }
    }
}

// Функция для финальной анимации 
function gameOverAnimation() {
    const filledCells = [...cells].filter(cell => cell.classList.length > 0);

    filledCells.forEach((cell, i) => {
        setTimeout(() => cell.classList.add('hide'), i * 10);
        setTimeout(() => cell.removeAttribute('class'), i * 10 + 500);
    })

    setTimeout(drawSadFace, filledCells.length * 10 + 1000);
}

// Функция для рисования грустного лица в конце игры
function drawSadFace() {
    const topOffset = 5;

    for (let row = 0; row < SAD_FACE.length; row++) {
        for (let column = 0; column < SAD_FACE[0].length; column++) {
            if (!SAD_FACE[row][column]) continue;

            const cellIndex = convertPositionToIndex(row + topOffset, column);
            cells[cellIndex].classList.add('sad-face');
        }
    }
}

// Функция для рестарта игры
function restartGame() {
    startGame();
}

// Функция для увеличения счетчика в html-документе
// Принимает: counter - счетчик в html-документе
function incrementCounter(counter, increment) {
    counter.innerHTML = Number(counter.innerHTML) + increment;
}

