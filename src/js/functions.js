// Функция для получения случайного элемента из массива
// Принимает: массив
// Возвращает: случайный элемент массива
export function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

// Функция для поворота матрицы 
// Принимает: матрицу, направление поворота
// Возвращает: матрицу, повернутую на 90 градусов в заданную сторону
export function rotateMatrix(matrix, direction) {
    const size = matrix.length;
    const rotatedMatrix = [];

    if (direction === 'right') {
        for (let i = 0; i < size; i++) {
            rotatedMatrix[i] = [];
            for (let j = 0; j < size; j++) {
                rotatedMatrix[i][j] = matrix[size - j - 1][i];
            }
        }
    } else if (direction === 'left') {
        for (let i = 0; i < size; i++) {
            rotatedMatrix[i] = [];
            for (let j = 0; j < size; j++) {
                rotatedMatrix[i][j] = matrix[j][size - i - 1];
            }
        }
    }

    return rotatedMatrix;
}