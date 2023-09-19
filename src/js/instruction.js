// Кнопка для отображения инструкции
const btnShowInstruction = document.querySelector('#btn-instruction');
// Блок с инструкцией
const inctruction = document.querySelector('#game-instruction');
// Кнопка для скрытия инструкции 
const btnCloseInstruction = document.querySelector('#btn-close-instruction');

// Слушатели событий =======================================================

// Слушатель событий для кнопки показа инструкции
btnShowInstruction.addEventListener('click', () => {
    btnShowInstruction.classList.add('hide');
    inctruction.classList.add('show');
});

// Слушатель событий для кнопки скрытия инструкции
btnCloseInstruction.addEventListener('click', () => {
    btnShowInstruction.classList.remove('hide');
    inctruction.classList.remove('show');
});