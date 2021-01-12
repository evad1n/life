let numCols = parseInt(window.innerWidth / 11) - 2;
let numRows = parseInt(window.innerHeight / 11) - 20;
const cellWidth = 10;
const cellSpacing = 1;

const container = document.querySelector("#gridContainer");
const stopButton = document.querySelector("#stop");
const stepButton = document.querySelector("#step");
const restartButton = document.querySelector("#restart");
const clearButton = document.querySelector("#clear");
const colorSlider = document.querySelector("#colorRange");
const fpsSlider = document.querySelector("#fpsRange");

const span = document.createElement('span');
span.className = 'cell';

let cells = [];
let fps = fpsSlider.value;

for(let row = 0; row < numRows; row++){
    cells.push([]);
    for(let col = 0; col < numCols; col++){
        let cell = span.cloneNode();
        cell.style.left = `${col * (cellWidth+cellSpacing)}px`;
        cell.style.top = `${row * (cellWidth+cellSpacing)}px`;
        container.appendChild(cell);
        cells[row][col] = cell;
    }
}

let color = "gradient";
let blueValue = colorSlider.value;
let pattern = "random";

//border div size
container.style.width = numCols * (cellWidth + cellSpacing) + "px";
container.style.height = numRows * (cellWidth + cellSpacing) + "px";

//resize board

let rtime;
let timeout = false;
let delta = 200;
window.onresize = (function(e) {
    pause();
    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }
});

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;
        resize();
    }               
}

function resize() {
    for(let row = 0; row < numRows; row++){
        for(let col = 0; col < numCols; col++){
            container.removeChild(cells[row][col]);
        }
    }
    
    cells = [];
    
    numCols = parseInt(window.innerWidth / 11) - 2;
    numRows = parseInt(window.innerHeight / 11) - 20;
    container.style.width = numCols * (cellWidth + cellSpacing) + "px";
    container.style.height = numRows * (cellWidth + cellSpacing) + "px";
    
            
    for(let row = 0; row < numRows; row++){
        cells.push([]);
        for(let col = 0; col < numCols; col++){
            let cell = span.cloneNode();
            cell.style.left = `${col * (cellWidth+cellSpacing)}px`;
            cell.style.top = `${row * (cellWidth+cellSpacing)}px`;
            container.appendChild(cell);
            cells[row][col] = cell;
        }
    }
    
    lifeworld.init(numCols,numRows);
    loop(performance.now());       
}

let mouseIsDown = false;
let fill = true;

//Drag to fill in cells or erase cells
container.onmousemove = (e) => {
    e.preventDefault();
    if(mouseIsDown){
        if(fill){
            fillCell(e);
        }
        else{
            eraseCell(e);
        }
    }
};

//Click on a cell to toggle its state and begin possible onmousedown behavior
container.onmousedown = (e) => {
    e.preventDefault();
    mouseIsDown = true;
    let rect = container.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    let columnWidth = cellWidth + cellSpacing;
    let col = Math.floor(mouseX/columnWidth);
    let row = Math.floor(mouseY/columnWidth);
    let selectedCell = cells[row][col];
    if(lifeworld.world[row][col] == 1){
        lifeworld.world[row][col] = 0;
        selectedCell.style.backgroundColor = "black";
        fill = false;
    }
    else{
        lifeworld.world[row][col] = 1;
        selectedCell.style.backgroundColor = getColor(row,col);
        fill = true;
    }
};

window.onmouseup = (e) => {
    e.preventDefault();
    mouseIsDown = false;
    fill = true;
};

//Fill a cell
function fillCell(e){
    let rect = container.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    let columnWidth = cellWidth + cellSpacing;
    let col = Math.floor(mouseX/columnWidth);
    let row = Math.floor(mouseY/columnWidth);
    let selectedCell = cells[row][col];
    lifeworld.world[row][col] = 1;
    selectedCell.style.backgroundColor = getColor(row,col);
}

//Erase a cell
function eraseCell(e){
    let rect = container.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    let columnWidth = cellWidth + cellSpacing;
    let col = Math.floor(mouseX/columnWidth);
    let row = Math.floor(mouseY/columnWidth);
    let selectedCell = cells[row][col];
    lifeworld.world[row][col] = 0;
    selectedCell.style.backgroundColor = "black";
}

stopButton.onclick = pause;

let paused = false;

//Stop the animation loop
function pause(e){
    paused = !paused;
    if(!paused){
        loop(performance.now()); 
        stopButton.innerHTML = "Stop";
    }
    else
        stopButton.innerHTML = "Start";
}

stepButton.onclick = lifeStep;

//Step once through the lifeworld
function lifeStep(e){
    lifeworld.step();
    updateGrid();
}

restartButton.onclick = restart;

//Create a new randomized lifeworld grid
function restart(e){
    lifeworld.randomSetup();
    updateGrid();
}

clearButton.onclick = clear;

//Clear the current lifeworld grid
function clear(e){
    for(let row = 0; row < numRows; row++){
        for(let col = 0; col < numCols; col++){
            lifeworld.world[row][col] = 0;
            lifeworld.worldBuffer[row][col] = 0;
        }
    }
    updateGrid();
}

//Update color choice
document.querySelector("#colorChooser").onchange = (e) => {
    color = e.target.value;
    updateGrid();
};

//Update blue value for the gradient
colorSlider.oninput = (e) => {
    blueValue = e.target.value;
    document.querySelector("#gradientValue").innerHTML = blueValue;
    updateGrid();
};

//Update FPS values
fpsSlider.oninput = (e) => {
    fps = e.target.value;
    document.querySelector("#fpsValue").innerHTML = fps;
    maxFrameDelay = 1000/fps;
};

// Pattern dropdown list
document.querySelector("#patternChooser").onchange = (e) => {
    pattern = e.target.value;
    let halfRows = parseInt(numRows / 2);
    let halfCols = parseInt(numCols / 2);
    clear();
    
    // Random
    if(pattern == "random")
        {
            restart();
        }
    else if(pattern == "rpentomino")
        {
            lifeworld.world[halfRows - 1][halfCols] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols] = 1;
            lifeworld.world[halfRows - 1][halfCols + 1] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols + 1] = 1;
            lifeworld.world[halfRows][halfCols - 1] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 1] = 1;
            lifeworld.world[halfRows][halfCols] = 1;
            lifeworld.worldBuffer[halfRows][halfCols] = 1;
            lifeworld.world[halfRows + 1][halfCols] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols] = 1;
        }
    else if(pattern == "diehard")
        {
            lifeworld.world[halfRows - 1][halfCols + 3] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols + 3] = 1;
            lifeworld.world[halfRows][halfCols - 3] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 3] = 1;
            lifeworld.world[halfRows][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 2] = 1;
            lifeworld.world[halfRows + 1][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols - 2] = 1;
            lifeworld.world[halfRows + 1][halfCols + 2] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols + 2] = 1;
            lifeworld.world[halfRows + 1][halfCols + 3] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols + 3] = 1;
            lifeworld.world[halfRows + 1][halfCols + 4] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols + 4] = 1;
        }
    else if(pattern == "acorn")
        {
            lifeworld.world[halfRows - 1][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols - 2] = 1;
            lifeworld.world[halfRows][halfCols] = 1;
            lifeworld.worldBuffer[halfRows][halfCols] = 1;
            lifeworld.world[halfRows + 1][halfCols - 3] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols - 3] = 1;
            lifeworld.world[halfRows + 1][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols - 2] = 1;
            lifeworld.world[halfRows + 1][halfCols + 1] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols + 1] = 1;
            lifeworld.world[halfRows + 1][halfCols + 2] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols + 2] = 1;
            lifeworld.world[halfRows + 1][halfCols + 3] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols + 3] = 1;
        }
    else if(pattern == "gosper")
        {
            lifeworld.world[halfRows - 5][halfCols + 7] = 1;
            lifeworld.worldBuffer[halfRows - 5][halfCols + 7] = 1;
            lifeworld.world[halfRows - 4][halfCols + 5] = 1;
            lifeworld.worldBuffer[halfRows - 4][halfCols + 5] = 1;
            lifeworld.world[halfRows - 4][halfCols + 7] = 1;
            lifeworld.worldBuffer[halfRows - 4][halfCols + 7] = 1;
            lifeworld.world[halfRows - 3][halfCols - 5] = 1;
            lifeworld.worldBuffer[halfRows - 3][halfCols - 5] = 1;
            lifeworld.world[halfRows - 3][halfCols - 4] = 1;
            lifeworld.worldBuffer[halfRows - 3][halfCols - 4] = 1;
            lifeworld.world[halfRows - 3][halfCols + 3] = 1;
            lifeworld.worldBuffer[halfRows - 3][halfCols + 3] = 1;
            lifeworld.world[halfRows - 3][halfCols + 4] = 1;
            lifeworld.worldBuffer[halfRows - 3][halfCols + 4] = 1;
            lifeworld.world[halfRows - 3][halfCols + 17] = 1;
            lifeworld.worldBuffer[halfRows - 3][halfCols + 17] = 1;
            lifeworld.world[halfRows - 3][halfCols + 18] = 1;
            lifeworld.worldBuffer[halfRows - 3][halfCols + 18] = 1;
            lifeworld.world[halfRows - 2][halfCols - 6] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols - 6] = 1;
            lifeworld.world[halfRows - 2][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols - 2] = 1;
            lifeworld.world[halfRows - 2][halfCols + 3] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols + 3] = 1;
            lifeworld.world[halfRows - 2][halfCols + 4] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols + 4] = 1;
            lifeworld.world[halfRows - 2][halfCols + 17] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols + 17] = 1;
            lifeworld.world[halfRows - 2][halfCols + 18] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols + 18] = 1;
            lifeworld.world[halfRows - 1][halfCols - 17] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols - 17] = 1;
            lifeworld.world[halfRows - 1][halfCols - 16] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols - 16] = 1;
            lifeworld.world[halfRows - 1][halfCols - 7] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols - 7] = 1;
            lifeworld.world[halfRows - 1][halfCols - 1] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols - 1] = 1;
            lifeworld.world[halfRows - 1][halfCols + 3] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols + 3] = 1;
            lifeworld.world[halfRows - 1][halfCols + 4] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols + 4] = 1;
            lifeworld.world[halfRows][halfCols - 17] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 17] = 1;
            lifeworld.world[halfRows][halfCols - 16] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 16] = 1;
            lifeworld.world[halfRows][halfCols - 7] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 7] = 1;
            lifeworld.world[halfRows][halfCols - 3] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 3] = 1;
            lifeworld.world[halfRows][halfCols - 1] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 1] = 1;
            lifeworld.world[halfRows][halfCols] = 1;
            lifeworld.worldBuffer[halfRows][halfCols] = 1;
            lifeworld.world[halfRows][halfCols + 5] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 5] = 1;
            lifeworld.world[halfRows][halfCols + 7] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 7] = 1;
            lifeworld.world[halfRows + 1][halfCols - 7] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols - 7] = 1;
            lifeworld.world[halfRows + 1][halfCols - 1] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols - 1] = 1;
            lifeworld.world[halfRows + 1][halfCols + 7] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols + 7] = 1;
            lifeworld.world[halfRows + 2][halfCols - 6] = 1;
            lifeworld.worldBuffer[halfRows + 2][halfCols - 6] = 1;
            lifeworld.world[halfRows + 2][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows + 2][halfCols - 2] = 1;
            lifeworld.world[halfRows + 3][halfCols - 5] = 1;
            lifeworld.worldBuffer[halfRows + 3][halfCols - 5] = 1;
            lifeworld.world[halfRows + 3][halfCols - 4] = 1;
            lifeworld.worldBuffer[halfRows + 3][halfCols - 4] = 1;
        }
    else if(pattern == "infinite1")
        {
            lifeworld.world[halfRows - 3][halfCols + 2] = 1;
            lifeworld.worldBuffer[halfRows - 3][halfCols + 2] = 1;
            lifeworld.world[halfRows - 2][halfCols] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols] = 1;
            lifeworld.world[halfRows - 2][halfCols + 2] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols + 2] = 1;
            lifeworld.world[halfRows - 2][halfCols + 3] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols + 3] = 1;
            lifeworld.world[halfRows - 1][halfCols] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols] = 1;
            lifeworld.world[halfRows - 1][halfCols + 2] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols + 2] = 1;
            lifeworld.world[halfRows][halfCols] = 1;
            lifeworld.worldBuffer[halfRows][halfCols] = 1;
            lifeworld.world[halfRows + 1][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols - 2] = 1;
            lifeworld.world[halfRows + 2][halfCols - 4] = 1;
            lifeworld.worldBuffer[halfRows + 2][halfCols - 4] = 1;
            lifeworld.world[halfRows + 2][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows + 2][halfCols - 2] = 1;
        }
    else if(pattern == "infinite2")
        {
            lifeworld.world[halfRows - 2][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols - 2] = 1;
            lifeworld.world[halfRows - 2][halfCols - 1] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols - 1] = 1;
            lifeworld.world[halfRows - 2][halfCols] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols] = 1;
            lifeworld.world[halfRows - 2][halfCols + 2] = 1;
            lifeworld.worldBuffer[halfRows - 2][halfCols + 2] = 1;
            lifeworld.world[halfRows - 1][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows - 1][halfCols - 2] = 1;
            lifeworld.world[halfRows][halfCols + 1] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 1] = 1;
            lifeworld.world[halfRows][halfCols + 2] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 2] = 1;
            lifeworld.world[halfRows + 1][halfCols - 1] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols - 1] = 1;
            lifeworld.world[halfRows + 1][halfCols] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols] = 1;
            lifeworld.world[halfRows + 1][halfCols + 2] = 1;
            lifeworld.worldBuffer[halfRows + 1][halfCols + 2] = 1;
            lifeworld.world[halfRows + 2][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows + 2][halfCols - 2] = 1;
            lifeworld.world[halfRows + 2][halfCols] = 1;
            lifeworld.worldBuffer[halfRows + 2][halfCols] = 1;
            lifeworld.world[halfRows + 2][halfCols + 2] = 1;
            lifeworld.worldBuffer[halfRows + 2][halfCols + 2] = 1;
        }
    else if(pattern == "infinite3")
        {
            lifeworld.world[halfRows][halfCols - 19] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 19] = 1;
            lifeworld.world[halfRows][halfCols - 18] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 18] = 1;
            lifeworld.world[halfRows][halfCols - 17] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 17] = 1;
            lifeworld.world[halfRows][halfCols - 16] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 16] = 1;
            lifeworld.world[halfRows][halfCols - 15] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 15] = 1;
            lifeworld.world[halfRows][halfCols - 14] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 14] = 1;
            lifeworld.world[halfRows][halfCols - 13] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 13] = 1;
            lifeworld.world[halfRows][halfCols - 12] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 12] = 1;
            lifeworld.world[halfRows][halfCols - 10] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 10] = 1;
            lifeworld.world[halfRows][halfCols - 9] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 9] = 1;
            lifeworld.world[halfRows][halfCols - 8] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 8] = 1;
            lifeworld.world[halfRows][halfCols - 7] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 7] = 1;
            lifeworld.world[halfRows][halfCols - 6] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 6] = 1;
            lifeworld.world[halfRows][halfCols - 2] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 2] = 1;
            lifeworld.world[halfRows][halfCols - 1] = 1;
            lifeworld.worldBuffer[halfRows][halfCols - 1] = 1;
            lifeworld.world[halfRows][halfCols] = 1;
            lifeworld.worldBuffer[halfRows][halfCols] = 1;
            lifeworld.world[halfRows][halfCols + 7] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 7] = 1;
            lifeworld.world[halfRows][halfCols + 8] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 8] = 1;
            lifeworld.world[halfRows][halfCols + 9] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 9] = 1;
            lifeworld.world[halfRows][halfCols + 10] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 10] = 1;
            lifeworld.world[halfRows][halfCols + 11] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 11] = 1;
            lifeworld.world[halfRows][halfCols + 12] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 12] = 1;
            lifeworld.world[halfRows][halfCols + 13] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 13] = 1;
            lifeworld.world[halfRows][halfCols + 15] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 15] = 1;
            lifeworld.world[halfRows][halfCols + 16] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 16] = 1;
            lifeworld.world[halfRows][halfCols + 17] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 17] = 1;
            lifeworld.world[halfRows][halfCols + 18] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 18] = 1;
            lifeworld.world[halfRows][halfCols + 19] = 1;
            lifeworld.worldBuffer[halfRows][halfCols + 19] = 1;
        }
    updateGrid();
    paused = false;
    pause();
};

let lastUpdate = performance.now();

let lastFrame = performance.now();

let maxFrameDelay = 1000/fps;

lifeworld.init(numCols,numRows);

loop(performance.now());

//Animation loop
function loop(timestamp){
    if(!paused)
        requestAnimationFrame(loop);
    lastUpdate = timestamp;
    if(timestamp - lastFrame > maxFrameDelay){
        lastFrame = timestamp;
        lifeworld.step();
        updateGrid();
    }
}

//Update grid based on lifeworld values
function updateGrid(){
    for(let row = 0; row < numRows; row++){
        for(let col = 0; col < numCols; col++){
            let element = cells[row][col];
            if(lifeworld.world[row][col] == 1){
                element.style.backgroundColor= getColor(row, col);
            }else{
                element.style.backgroundColor="black";
            }
        }
    }
}

//Get color choice and if gradient is selected then calculate color based on grid position
function getColor(row, col){
    if(color == "gradient"){
        return 'rgb(' + [
            Math.round(row/numRows * 255), Math.round(col/numCols * 255), 
            blueValue
        ].join(',') + ')';
    }
    else
        return color;
}