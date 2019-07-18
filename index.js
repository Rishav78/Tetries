(function(){
    let pause = false;
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
    let T;
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
            board[i] = new Array(colums).fill(0);
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
                drawSquare(j, i, !board[i][j] ? 'white' : 'red');
            }
        }
    }
    drawBoard();
    function destroyRow(array){
        for(let i=0;i<board.length;i++){
            if(!board[i].includes(0)){
                board.splice(i,1);
                board.unshift(new Array(colums).fill(0));
                drawBoard();
                // console.log(board);
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
                    board[i+y][j+x] = 1;
                }
            }
        }
        // destroyRow(T.coOrdinate);
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
        return !collision(newArray,0,0) ? newArray : array;
    }

    function draw() {
        for(let i=0;i<T.length;i++){
            for(let j=0;j<T.length;j++){
                if(T[i][j] > 0){
                    // board[i+y][j+x] = 1;
                    drawSquare(j+x,i+y,'red');
                }
            }
        }
        // console.log(board);
        // pause=true;
    }
    function unDraw(array, show, color) {
        for(let i=0;i<array.length;i++){
            for(let j=0;j<array.length;j++){
                if(array[i][j] > 0){
                    //  show ? console.log(i+y,j+x) : null;
                    // board[i+y][j+x] = 0;
                    // c.clearRect(0,0,canvas.width,canvas.height)
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
                        console.log(board[board.length - 1])
                        return true;
                    }
                    if(newY<=0){
                        continue;
                    }
                    if(board[i+y+b][j+x+a]){
                        console.log('yup')
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function move(a, b) {
        unDraw(T);
        let coll = collision(T,a,b);
        if(!coll){
            y += b;
            x += a;
            draw();
        }else{
            draw();
            destroyRow(T);
        }
        return !coll;
    }
    function newBlock() {
        T = shape[(Math.floor(Math.random()*10))%shape.length];
        x=0;y=-2;
    }
    newBlock();
    function animate() {
        let speed2 = Date.now();
        if(!gameOver)
             requestAnimationFrame(animate);
        if(speed2 - speed > 1000 && !pause){
            speed = speed2;
            if(!move(0,1)) {
                lockState(T,1);
                newBlock();
            }
        }
    }
    window.addEventListener('keydown', (e) => {
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
                move(-1,0)
                break;
            case 39: //right
                move(1,0);
                break;
            case 40: //down
                speed = Date.now();
                if(!move(0,1)) {
                    lockState(T,1);
                    newBlock();
                }
                break;
        }
    })
    animate();})();