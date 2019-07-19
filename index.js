(function(){
    let pause = false;
    let span = document.querySelector('span');
    span.innerHTML = 0;
    let blockHistory = [];
    let blockColor = ['#004d00','#4d004d','#b30000','#0000ff','#0d0d0d','#000080', '#333300'];
    let undo = [];
    let redo = [];
    let shape = [
        [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
    ]
    let score = 0;
    let T;
    let shapeIndex;
    let x,y;
    let stop = false;
    let gameOver=false;
    let speed = Date.now();
    let canvas = document.querySelector('canvas');
    let c = canvas.getContext('2d');
    canvas.width = 450, canvas.height = 450;
    let dimentions = 30;
    let row = canvas.width/dimentions, colums = canvas.height/dimentions;
    let board = createBoard();
    function createBoard() {
        let board = new Array(row);
        for(let i=0;i<row;i++){
            board[i] = new Array(colums).fill(-1);
        }
        return board;
    }

    function drawSquare(x, y, color){
        c.beginPath();
        c.rect(x * dimentions, y * dimentions, dimentions, dimentions);
        c.fillStyle = color;
        c.fill();
        c.stroke();
    }
    function drawBoard() {
        c.clearRect(0, 0, canvas.width, canvas.height);
        for(let i=0;i<row;i++){
            for(let j=0;j<colums;j++){
                drawSquare(j, i, board[i][j] < 0 ? 'white' : blockColor[board[i][j]]);
            }
        }
    }
    drawBoard();
    function destroySingleRow(i){
        let removedRow = board.splice(i,1);
        board.unshift(new Array(colums).fill(-1));
        return removedRow;
    }
    function createSingleRow(i, row){
        // console.log('dyuigfcvb')
        console.log(i+1,row);
        board.splice(i+1,0,row);
        // board.shift();
        console.log(board);
    }
    function destroyRow(array){
        for(let i=0;i<board.length;i++){
            if(!board[i].includes(-1)){
                undo.push({
                    type: 2,
                    index: i,
                    row: destroySingleRow(i),
                });
                score += 50;
                span.innerHTML = score;
                drawBoard();
            }
        }
    }
    function unlockState(array){
        for(let i=0;i<array.length;i++){
            for(let j=0;j<array[i].length;j++){
                if(array[i][j]){
                    board[i+y][j+x] = -1;
                }
            }
        }
    }
    function lockState(array, value) {
        for(let i=0;i<array.length;i++){
            for(let j=0;j<array[i].length;j++){
                if(array[i][j]){
                    if(i+y < 0){
                        alert('Game Over baby')
                        gameOver = true;
                        return;
                    }
                    board[i+y][j+x] = value;
                }
            }
        }
        blockHistory.push({
            index: shapeIndex,
            x,
            y, 
        })
    }
    function rotate(array, dir) {
        var newArray = new Array(array.length)
        for(let i=0;i<array.length;i++){
            newArray[i] = [];
        }
        for(let i = 0; i < array.length; i++){
            for(let j = 0; j < array[i].length; j++){
                dir > 0 ? newArray[array[i].length - 1 - j].push(array[i][j]) : newArray[j].unshift(array[i][j]);
            };
        };
        if(!collision(newArray,0,0)){
            undo.push({
                type: 0,
                shape: shapeIndex,
                dir: (dir+1)%2,
            });
            return newArray;
        }
        return array;
    }
    function redoStep(){
        if(redo.length && redo[redo.length - 1].type === 1){
            console.log('yuioiju')
            move(redo[redo.length - 1].move[0], redo[redo.length - 1].move[1], 1);
            speed = Date.now();
            redo.splice(redo.length - 1,1)
        }
    }
    function undoStep(){
        // console.log(undo);
        let undoOpertionOn = undo[undo.length - 1];
        switch(undoOpertionOn.type){
            case 0:
                
                break;
            case 1:
                move(undoOpertionOn.move[0], undoOpertionOn.move[1], 1);
                speed = Date.now();
                let removed = undo.splice(undo.length - 1,1)[0];
                removed.move[0] *= -1;
                removed.move[1] *= -1;
                redo.push(removed);
                break;
            case 2:
                createSingleRow(undoOpertionOn.index, undoOpertionOn.row[0]);
                undo.splice(undo.length-1,1);
                drawBoard();

        }
    }
    function draw() {
        for(let i=0;i<T.length;i++){
            for(let j=0;j<T.length;j++){
                if(T[i][j] > 0){
                    drawSquare(j+x,i+y,blockColor[shapeIndex]);
                }
            }
        }
    }
    function unDraw(array, show, color) {
        for(let i=0;i<array.length;i++){
            for(let j=0;j<array.length;j++){
                if(array[i][j] > 0){
                    drawSquare(j+x,i+y,color ? color : 'white');
                }
            }
        }
    }
    function collision(array,a,b){
        for(let i=0;i<array.length;i++){
            for(let j=0;j<array.length;j++){
                if(array[i][j]){
                    if(!array[i][j]){
                        continue;
                    }
                    let newX = (j+x+a)*dimentions + dimentions;
                    let newY = (i+y+b)*dimentions + dimentions;
                    if(newX<=0 || newX>canvas.width || newY>canvas.height){
                        return true;
                    }
                    if(newY<=0){
                        continue;
                    }
                    if(board[i+y+b][j+x+a] >= 0){
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function move(a, b, u) {
        unDraw(T);
        let coll = collision(T,a,b);
        if(!coll){
            y += b;
            x += a;
            if(!u){
                if(redo.length){
                    redo = [];
                }
                undo.push({
                    type: 1,
                    shape: shapeIndex,
                    move: [a*-1, b*-1],
                })
            }
        }
        draw();
        return !coll;
    }
    function newBlock() {
        // (Math.floor(Math.random()*10))%shape.length
        shapeIndex = 1;
        T = shape[shapeIndex];
        x=0;y=-2;
    }
    newBlock();
    function animate() {
        let speed2 = Date.now();
        if(!gameOver)
             requestAnimationFrame(animate);
        if(speed2 - speed > 700 && !pause){
            speed = speed2;
            if(!move(0,1,0)) {
                lockState(T,shapeIndex);
                destroyRow(T);
                // undo=[];
                // redo=[];
                newBlock();
            }
        }
    }
    window.addEventListener('keydown', (e) => {
        if(!gameOver){
            switch(e.keyCode){
                case 32:
                    pause = !pause;
                    break;
                case 65: //
                    unDraw(T);
                    T = rotate(T,1);
                    draw();
                    break;
                case 68:
                    unDraw(T);
                    T = rotate(T,0);
                    draw();
                    break;
                case 37: //left
                    move(-1,0,0)
                    break;
                case 39: //right
                    move(1,0,0);
                    break;
                case 40: //down
                    speed = Date.now();
                    if(!move(0,1,0)) {
                        // undo=[];
                        // redo=[];
                        lockState(T,shapeIndex);
                        destroyRow(T);
                        newBlock();
                    }
                    break;
                case 85:
                    // undoStep();
                    break;
                case 82:
                    // redoStep();
                default:
                    console.log(e.keyCode)
            }
        }
    })
    animate();
})();