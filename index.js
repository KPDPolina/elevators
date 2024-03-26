const elevator1 = document.querySelector('.elevator1');
const elevator2 = document.querySelector('.elevator2');
const elevatorFloor1 = document.querySelector('.elevator-floor1');
const elevatorFloor2 = document.querySelector('.elevator-floor2');
const currentFloorDisplay1 = document.getElementById('current-floor1');
const currentFloorDisplay2 = document.getElementById('current-floor2');
const floors = document.querySelectorAll('.floor');

const totalFloors = floors.length;

//Создание массива положений этажей
const floorsCoordinates = [];
for (let i = 0; i < totalFloors; i++) {
    floorsCoordinates.push(Math.floor(floors[i].getBoundingClientRect().bottom));
} 

const floorHeight = floorsCoordinates[1]-floorsCoordinates[0]

// Состояние лифтов
const elevatorState1 = {
    currentFloor: totalFloors,
    isMoving: false,
    targetFloor: currentFloorDisplay1, 
};

const elevatorState2 = {
    currentFloor: totalFloors,
    isMoving: false,
    targetFloor: currentFloorDisplay2, 
};

//Функция определения этажа
function floorAtMoment(elevatorPosition, floorPosition, currentFloorDisplay){
    const elevatorBottom = Math.floor(elevatorPosition.bottom)
    const elevatorTop = Math.floor(elevatorPosition.top)
    if(elevatorBottom < floorPosition.bottom){
        for (let i = 0; i < totalFloors; i++) {
            if(elevatorBottom === floorsCoordinates[i]-floorHeight){
                currentFloorDisplay.innerText = totalFloors-i;
            }
        }
    }else{
        for (let i = 0; i < totalFloors; i++) {
            if(elevatorTop === floorsCoordinates[i]){
                currentFloorDisplay.innerText = totalFloors-i;
            }
        }
    }
}

//Сортировка вставками для поочередного посещения этажей между нынешним и целевым
function insertionSort(array){
    let sortedArray = [];
    for (let i = 0; i < array.length; i++) {
        let k = i;
        sortedArray.push(array[i]);
        while(k > 0 && sortedArray[k]>sortedArray[k-1]){
            let temp = sortedArray[k-1];
            sortedArray[k-1]=sortedArray[k];
            sortedArray[k]=temp;
            k--;
        }
    }
    return sortedArray;
}

//Сортировка очереди попутных этажей с учетом непопутных 
//(сортирует только этажи попутные направлению вниз)
function sortWithExtra(currentFloor, array){
    //убираем дублированые этажи
    let setArray = new Set();
    for (let i = 0; i < array.length; i++) {
        setArray.add(array[i]);
    }
    array = [...setArray.keys()]
    //сортируем
    let newArray = [];
    let largeArray = [];
    for (let i = 0; i < array.length; i++) {
        if(array[i]>currentFloor){
            largeArray.push(array[i]);
        }else{
            newArray.push(array[i]);
        }
    }
    let res = insertionSort(newArray).concat(largeArray);
    return res;
}


// Очередь вызовов лифта 1
let elevatorQueue1 = [];

// Функция перемещения лифта 1 на этаж
function moveToFloor1(floorNumber, speed = 60) {
    if (elevatorState1.isMoving){
        //переопределение целевого этажа
        elevatorState1.targetFloor = floorNumber;
        return;
    }
    elevatorQueue1.unshift(floorNumber);
    elevatorState1.targetFloor = floorNumber;
    elevatorState1.isMoving = true;
    let floorPosition = floors[totalFloors - floorNumber].getBoundingClientRect();
    const elevatorPosition = elevator1.getBoundingClientRect();
    let direction = floorPosition.bottom > elevatorPosition.bottom ? 1 : -1; 

    const moveInterval = setInterval(() => {
        const elevatorPosition = elevator1.getBoundingClientRect();
        floorPosition = floors[totalFloors - elevatorState1.targetFloor].getBoundingClientRect();
        if(floorPosition.bottom > elevatorPosition.bottom){
            elevatorFloor1.innerText = `↓ ${elevatorState1.targetFloor} ↓`;
        }else{
            elevatorFloor1.innerText = `↑ ${elevatorState1.targetFloor} ↑`;
        }
        // Обновляем текущий этаж в реальном времени
        floorAtMoment(elevatorPosition, floorPosition, currentFloorDisplay1);
        elevator1.style.top = `${elevatorPosition.top + direction}px`; 

        if (Math.floor(elevatorPosition.bottom) === Math.floor(floorPosition.bottom)) {
            clearInterval(moveInterval);
            elevatorState1.isMoving = false;
            elevatorQueue1.shift();
            elevatorState1.currentFloor = elevatorState1.targetFloor;
            currentFloorDisplay1.innerText = elevatorState1.targetFloor;
            elevatorFloor1.innerText = elevatorState1.targetFloor;  
            if (elevatorQueue1.length > 0) {
                // Если есть ожидающие вызовы, обрабатываем следующий вызов
                setTimeout(() => {
                    const nextCall = elevatorQueue1.shift();
                    // По истечении времени ожидания, вызываем функцию перемещения лифта
                    moveToFloor1(nextCall);
                }, 2000); // 1000 миллисекунд (1 секунда) ожидания
            }  
        }
    }, speed);
}


// Очередь вызовов лифта 2
let elevatorQueue2 = [];

// Функция перемещения лифта 2 на этаж
function moveToFloor2(floorNumber, speed = 60) {
    if (elevatorState2.isMoving){
        //переопределение целевого этажа
        elevatorState2.targetFloor = floorNumber;
        return;
    }  
    elevatorQueue2.unshift(floorNumber)
    elevatorState2.targetFloor = floorNumber;
    elevatorState2.isMoving = true;
    let floorPosition = floors[totalFloors - floorNumber].getBoundingClientRect();
    const elevatorPosition = elevator2.getBoundingClientRect();
    let direction = floorPosition.bottom > elevatorPosition.bottom ? 1 : -1; 
    
    const moveInterval = setInterval(() => {
        const elevatorPosition = elevator2.getBoundingClientRect();
        floorPosition = floors[totalFloors - elevatorState2.targetFloor].getBoundingClientRect();
        if(floorPosition.bottom > elevatorPosition.bottom){
            elevatorFloor2.innerText = `↓ ${elevatorState2.targetFloor} ↓`;
        }else{
            elevatorFloor2.innerText = `↑ ${elevatorState2.targetFloor} ↑`;
        }
        // Обновляем текущий этаж в реальном времени
        floorAtMoment(elevatorPosition, floorPosition, currentFloorDisplay2);
        elevator2.style.top = `${elevatorPosition.top + direction}px`; 

        if (Math.floor(elevatorPosition.bottom) === Math.floor(floorPosition.bottom)) {
            clearInterval(moveInterval);
            elevatorState2.isMoving = false;
            elevatorQueue2.shift();
            elevatorState2.currentFloor = elevatorState2.targetFloor;
            currentFloorDisplay2.innerText = elevatorState2.targetFloor;
            elevatorFloor2.innerText = elevatorState2.targetFloor;
            if (elevatorQueue2.length > 0) {
                // Если есть ожидающие вызовы, обрабатываем следующий вызов
                setTimeout(() => {
                    // elevatorState1.isMoving = false;
                    const nextCall = elevatorQueue2.shift();
                    // По истечении времени ожидания, вызываем функцию перемещения лифта
                    moveToFloor2(nextCall);
                }, 2000); // 2000 миллисекунд (2 секунды) ожидания
            }  
        }
    }, speed);
}

function turnOnFaster(timeFor1, timeFor2, floorNumber, currentFloor1, currentFloor2, direction1, direction2, directionFor1, directionFor2){
    if(timeFor1 <= timeFor2){
        if(elevatorState1.isMoving || elevatorQueue1.length>0){
            if(direction1 === directionFor1){
                elevatorQueue1.push(floorNumber);
                elevatorQueue1 = sortWithExtra(Number(currentFloor1), elevatorQueue1);
                moveToFloor1(elevatorQueue1[0]);
            }else{
                elevatorQueue1.push(floorNumber);
            }
        }else{
            moveToFloor1(floorNumber);
        }
    }else{
        if(elevatorState2.isMoving || elevatorQueue2.length>0){
            if(direction2 === directionFor2){
                elevatorQueue2.push(floorNumber);
                elevatorQueue2 = sortWithExtra(Number(currentFloor2), elevatorQueue2);
                moveToFloor2(elevatorQueue2[0]);
            }else{
                elevatorQueue2.push(floorNumber);
            }
        }else{
            moveToFloor2(floorNumber);
        }
    }
}


function fasterElevator(floorNumber, currentFloor1, currentFloor2){
    // просто направления движения лифта. -1 ─ опускается. 1 ─ стоит или поднимается
    const direction1 = Number(currentFloor1) > elevatorState1.targetFloor ? -1 : 1;
    const direction2 = Number(currentFloor2) > elevatorState2.targetFloor ? -1 : 1;
    // нужное направление к новому этажу с позиции лифта. -1 ─ опускается. 1 ─ стоит или поднимается
    const directionFor1 = Number(currentFloor1) > floorNumber ? -1 : 1;
    const directionFor2 = Number(currentFloor2) > floorNumber ? -1 : 1;
    if(elevatorQueue1.length === 0 && elevatorQueue2.length === 0){
        // console.log("1 pos");
        let timeFor1 = 0;
        let timeFor2 = 0;
        if(direction1 === directionFor1 && direction2 !== directionFor2){
            timeFor1 = Math.abs(Number(currentFloor1)-floorNumber)*3+2;
            timeFor2 = Math.abs(Number(currentFloor2)-elevatorState2.targetFloor)*3+2+Math.abs(elevatorState2.targetFloor-floorNumber)*3+2;
        }else if(direction1 !== directionFor1 && direction2 === directionFor2){
            timeFor1 = Math.abs(Number(currentFloor1)-elevatorState1.targetFloor)*3+2+Math.abs(elevatorState1.targetFloor-floorNumber)*3+2;
            timeFor2 = Math.abs(Number(currentFloor2)-floorNumber)*3+2;
        }else if(direction1 === directionFor1 && direction2 === directionFor2){
            timeFor1 = Math.abs(Number(currentFloor1)-floorNumber)*3+2;
            timeFor2 = Math.abs(Number(currentFloor2)-floorNumber)*3+2;
        }else{
            timeFor1 = Math.abs(Number(currentFloor1)-elevatorState1.targetFloor)*3+2+Math.abs(elevatorState1.targetFloor-floorNumber)*3+2;
            timeFor2 = Math.abs(Number(currentFloor2)-elevatorState2.targetFloor)*3+2+Math.abs(elevatorState2.targetFloor-floorNumber)*3+2;
        }
        turnOnFaster(timeFor1, timeFor2, floorNumber, currentFloor1, currentFloor2, direction1, direction2, directionFor1, directionFor2);
    
    }else if(elevatorQueue1.length === 0 && elevatorQueue2.length !== 0){
        let timeFor1 = 0;
        let timeFor2 = 0;
        if(direction1 === directionFor1 && direction2 !== directionFor2){
            if(elevatorState1.isMoving || elevatorQueue1.length>0){
                if(direction1 === directionFor1){
                    elevatorQueue1.push(floorNumber);
                    elevatorQueue1 = sortWithExtra(Number(currentFloor1), elevatorQueue1);
                    moveToFloor1(elevatorQueue1[0]);
                    return;
                }else{
                    elevatorQueue1.push(floorNumber);
                    return;
                }
            }else{
                moveToFloor1(floorNumber);
                return;
            }
        }else if(direction1 !== directionFor1 && direction2 === directionFor2){
            timeFor1 = Math.abs(Number(currentFloor1)-elevatorState1.targetFloor)*3+2+Math.abs(elevatorState1.targetFloor-floorNumber)*3+2;
            timeFor2 = Math.abs(Number(currentFloor2)-floorNumber)*3+2;
        }else if(direction1 === directionFor1 && direction2 === directionFor2){
            timeFor1 = Math.abs(Number(currentFloor1)-floorNumber)*3+2;
            timeFor2 = Math.abs(Number(currentFloor2)-floorNumber)*3+2;
        }else{
            timeFor1 = Math.abs(Number(currentFloor1)-elevatorState1.targetFloor)*3+2+Math.abs(elevatorState1.targetFloor-floorNumber)*3+2;
            timeFor2 = Math.abs(Number(currentFloor2)-elevatorState2.targetFloor)*3+2+Math.abs(elevatorState2.targetFloor-floorNumber)*3+2;
        }
        turnOnFaster(timeFor1, timeFor2, floorNumber, currentFloor1, currentFloor2, direction1, direction2, directionFor1, directionFor2);
    
    }else if(elevatorQueue1.length !== 0 && elevatorQueue2.length === 0){
        let timeFor1 = 0;
        let timeFor2 = 0;
        if(direction1 === directionFor1 && direction2 !== directionFor2){
            timeFor1 = Math.abs(Number(currentFloor1)-floorNumber)*3+2;
            timeFor2 = Math.abs(Number(currentFloor2)-elevatorState2.targetFloor)*3+2+Math.abs(elevatorState2.targetFloor-floorNumber)*3+2;
        }else if(direction1 !== directionFor1 && direction2 === directionFor2){
            if(elevatorState2.isMoving || elevatorQueue2.length>0){
                if(direction2 === directionFor2){
                    elevatorQueue2.push(floorNumber);
                    elevatorQueue2 = sortWithExtra(Number(currentFloor2), elevatorQueue2);
                    moveToFloor2(elevatorQueue2[0]);
                    return;
                }else{
                    elevatorQueue2.push(floorNumber);
                    return;
                }
            }else{
                moveToFloor2(floorNumber);
                return;
            }
        }else if(direction1 === directionFor1 && direction2 === directionFor2){
            timeFor1 = Math.abs(Number(currentFloor1)-floorNumber)*3+2;
            timeFor2 = Math.abs(Number(currentFloor2)-floorNumber)*3+2;
        }else{
            timeFor1 = Math.abs(Number(currentFloor1)-elevatorState1.targetFloor)*3+2+Math.abs(elevatorState1.targetFloor-floorNumber)*3+2
            timeFor2 = Math.abs(Number(currentFloor2)-elevatorState2.targetFloor)*3+2+Math.abs(elevatorState2.targetFloor-floorNumber)*3+2;
        }
        turnOnFaster(timeFor1, timeFor2, floorNumber, currentFloor1, currentFloor2, direction1, direction2, directionFor1, directionFor2);
    
    }else if(elevatorQueue1.length !== 0 && elevatorQueue2.length !== 0){
        if(direction1 === directionFor1 && direction2 !== directionFor2){
            elevatorQueue1.push(floorNumber);
            elevatorQueue1 = sortWithExtra(Number(currentFloor1), elevatorQueue1);
            moveToFloor1(elevatorQueue1[0]);
        }else if( direction2 === directionFor2 && direction1 !== directionFor1){
            elevatorQueue2.push(floorNumber);
            elevatorQueue2 = sortWithExtra(Number(currentFloor2), elevatorQueue2);
            moveToFloor2(elevatorQueue2[0]);
        }else if(direction2 !== directionFor2 && direction1 !== directionFor1){
            // узнали время 1 лифт
            let timeFor1 = Math.abs(Number(currentFloor1)-elevatorState1.targetFloor)*3+2;
            for (let i = 0; i < elevatorQueue1.length-1; i++) {
                timeFor1 = timeFor1 + (Math.abs(elevatorQueue1[i]-elevatorQueue1[i+1])*3+2);
            }
            timeFor1 = timeFor1 + Math.abs(elevatorQueue1[elevatorQueue1.length-1]-floorNumber)*3+2;
            // узнали время 2 лифт
            let timeFor2 = Math.abs(Number(currentFloor1)-elevatorState2.targetFloor)*3+2;
            for (let i = 0; i < elevatorQueue2.length-1; i++) {
                timeFor2 = timeFor2 + (Math.abs(elevatorQueue2[i]-elevatorQueue2[i+1])*3+2);
            }
            timeFor2 = timeFor2 + Math.abs(elevatorQueue2[elevatorQueue2.length-1]-floorNumber)*3+2;
            //выбираем с меньшим временем
            if(timeFor1 <= timeFor2){
                elevatorQueue1.push(floorNumber);
                elevatorQueue1 = sortWithExtra(Number(currentFloor1), elevatorQueue1);
                moveToFloor1(elevatorQueue1[0]);
            }else{
                elevatorQueue2.push(floorNumber);
                elevatorQueue2 = sortWithExtra(Number(currentFloor2), elevatorQueue2);
                moveToFloor2(elevatorQueue2[0]);
            }
        }else{
            let timeFor1 = Math.abs(Number(currentFloor1)-floorNumber);
            let timeFor2 = Math.abs(Number(currentFloor2)-floorNumber);
            //выбираем с меньшим временем
            if(timeFor1 <= timeFor2){
                elevatorQueue1.push(floorNumber);
                elevatorQueue1 = sortWithExtra(Number(currentFloor1), elevatorQueue1);
                moveToFloor1(elevatorQueue1[0]);
            }else{
                elevatorQueue2.push(floorNumber);
                elevatorQueue2 = sortWithExtra(Number(currentFloor2), elevatorQueue2);
                moveToFloor2(elevatorQueue2[0]);
            }
        }
    }
}

// Обработчики для кнопок этажей
floors.forEach((floor, index) => {
    floor.addEventListener('click', () => {
        const floorNumber = totalFloors - index;
        //игнорировать вызовы на этаж, на который в данный момент едят лифты
        if (floorNumber === elevatorState1.targetFloor) return;
        if (floorNumber === elevatorState2.targetFloor) return;

        fasterElevator(floorNumber, currentFloorDisplay1.innerHTML, currentFloorDisplay2.innerHTML);

  });
});

//запуск
moveToFloor1(16, 10)
moveToFloor2(16, 10)