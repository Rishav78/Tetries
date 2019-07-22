(function(){
    let span = document.querySelector('span');

    let canvas = document.querySelector('canvas');
    canvas.width = 450, canvas.height = 450;
    let c = canvas.getContext('2d');
    let pause=false;
    let gameOver = false;
    let speed = Date.now();


    let score = 0;
    let dimentions = 30;


    let shape = new Shape();
    let board = new Board();
    let drawer  = new GraphicsDrawer();



    span.innerHTML = 0;
    board.createBoard();
    shape.newBlock()
    animate();


    function animate() {
        let speed2 = Date.now();
        if(!gameOver)
             requestAnimationFrame(animate);
        if(speed2 - speed > 700 && !pause){
            speed = speed2;
            if(!shape.move(0,1,0)) {
                board.lockState(shape.activeShape,shape.activeShapeIndex);
                board.destroyRow(shape.activeShape);
                shape.newBlock();
            }
        }
    }


    function Stack() {
        this.array = [];
        this.push = function(value) {
            this.array.push(value)
        }
        this.pop = function() {
            return this.array.splice(this.array.length - 1,1)[0];
        }
        this.peak = function() {
            return this.array[this.array.length-1];
        }
        this.reset = function() {
            this.array = [];
        }
        this.isEmpty = function() {
            return this.array.length === 0;
        }
    }
    
    
    
    window.addEventListener('keydown', (e) => {
        if(!gameOver){
            switch(e.keyCode){
                case 32:
                    pause = !pause;
                    break;
                case 65: //
                    drawer.unDraw(shape.activeShape);
                    shape.rotate(1);
                    drawer.draw(shape.activeShape);
                    break;
                case 68:
                    drawer.unDraw(shape.activeShape);
                    shape.rotate(0);
                    drawer.draw(shape.activeShape);
                    break;
                case 37: //left
                    shape.move(-1,0,0)
                    break;
                case 39: //right
                    shape.move(1,0,0);
                    break;
                case 40: //down
                    speed = Date.now();
                    if(!shape.move(0,1,0)) {
                        board.lockState(shape.activeShape,shape.activeShapeIndex);
                        board.destroyRow(shape.activeShape);
                        shape.newBlock();
                    }
                    break;
                case 85:
                    shape.undoStep();
                    break;
                case 82:
                    shape.redoStep();
            }
        }
    })

    //-----------------------------------------------------------------------------------------------------------------------------------//


    function Board() {
        this.board = null;
        this.row = canvas.width/dimentions;
        this.colums = canvas.height/dimentions;
        this.backgroundColor = 'white';

        this.createBoard = function() {
            this.board = new Array(this.row);
            for(let i=0;i<this.row;i++){
                this.board[i] = new Array(this.colums).fill(-1);
            }
            this.drawBoard();
        }

        this.drawBoard = function() {
            c.clearRect(0, 0, canvas.width, canvas.height);
            for(let i=0;i<this.row;i++){
                for(let j=0;j<this.colums;j++){
                    drawer.drawSquare(j, i, this.board[i][j] < 0 ? this.backgroundColor : shape.availableShapeColor[this.board[i][j]]);
                }
            }
        }

        this.createRow = function(row) {
            row.forEach((value) => {
                this.board.shift();
                this.board.splice(value.index, 0, value.row);
            })
            this.drawBoard();
        }

        this.deleteRow = function(i) {
            let deletedRow = this.board.splice(i,1);
            this.board.unshift(new Array(this.colums).fill(-1));
            return deletedRow;
        }

        this.destroyRow = function(array) {
            let destroyedRows = [];
            for(let i=0;i<this.board.length;i++){
                if(!this.board[i].includes(-1)){
                    destroyedRows.push({
                        row: this.deleteRow(i)[0],
                        index: i,
                    });
                    
                    score += 50;
                    span.innerHTML = score;
                    this.drawBoard();
                }
            }
            destroyedRows.length ? shape.undo.push({
                type: 2,
                rows: destroyedRows,
            }) : null;
        }

        this.unlockState = function(array) {
            for(let i=0;i<array.length;i++){
                for(let j=0;j<array[i].length;j++){
                    if(array[i][j]){
                        this.board[i+shape.y][j+shape.x] = -1;
                    }
                }
            }
        }

        this.lockState = function(array, value) {
            for(let i=0;i<array.length;i++){
                for(let j=0;j<array[i].length;j++){
                    if(array[i][j]){
                        if(i+shape.y < 0){
                            alert('Game Over baby')
                            gameOver = true;
                            return;
                        }
                        this.board[i+shape.y][j+shape.x] = value;
                    }
                }
            }
            shape.undo.push({
                type: 3,
                block: {
                    index: shape.activeShapeIndex,
                    shape: shape.activeShape,
                    x: shape.x,
                    y: shape.y,
                },
            })
        }
    }


    //-----------------------------------------------------------------------------------------------------------------------------------//

    function GraphicsDrawer(){
        this.draw = function(array) {
            for(let i=0;i<array.length;i++){
                for(let j=0;j<array.length;j++){
                    if(array[i][j] > 0){
                        this.drawSquare(j+shape.x,i+shape.y,shape.availableShapeColor[shape.activeShapeIndex]);
                    }
                }
            }
        }
        this.unDraw = function(array) {
            for(let i=0;i<array.length;i++){
                for(let j=0;j<array.length;j++){
                    if(array[i][j] > 0){
                        drawer.drawSquare(j+shape.x,i+shape.y, board.backgroundColor);
                    }
                }
            }
        }
        this.drawSquare = function(x, y, color) {
            c.beginPath();
            c.rect(x * dimentions, y * dimentions, dimentions, dimentions);
            c.fillStyle = color;
            c.fill();
            c.stroke();
        }
    }

    

    //-----------------------------------------------------------------------------------------------------------------------------------//

    function Shape() {
        this.availableShapes = [
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
        ];
        this.undo = new Stack();
        this.redo = new Stack();
        this.availableShapeColor = ['#004d00','#4d004d','#b30000','#0000ff','#0d0d0d','#000080', '#333300'];
        this.activeShape = null;
        this.activeShapeIndex = null;
        this.x = null;
        this.y = null;
        
        this.newBlock = function(block) {
            if(block){
                this.activeShape = block.shape;
                this.activeShapeIndex = block.index;
                this.x = block.x;
                this.y = block.y;
            }else{
                this.activeShapeIndex = (Math.floor(Math.random()*10))%this.availableShapes.length;
                this.activeShape = this.availableShapes[this.activeShapeIndex];
                this.x=0;
                this.y=-2;
            }
        }

        this.move = function(x, y, store) {
            drawer.unDraw(this.activeShape);
            let coll = this.collision(this.activeShape,x,y);
            if(!coll){
                this.x += x;
                this.y += y;
                if(!store){
                    if(!this.redo.isEmpty()){
                        this.redo.reset();
                    }
                    this.undo.push({
                        type: 1,
                        move: [-x, -y],
                    })
                }
            }
            drawer.draw(this.activeShape);
            return !coll;
        }

        this.rotate = function(dir, u) {
            var newArray = new Array(this.activeShape.length)
            for(let i=0;i<this.activeShape.length;i++){
                newArray[i] = [];
            }
            for(let i = 0; i < this.activeShape.length; i++){
                for(let j = 0; j < this.activeShape[i].length; j++){
                    dir > 0 ? newArray[this.activeShape[i].length - 1 - j].push(this.activeShape[i][j]) : newArray[j].unshift(this.activeShape[i][j]);
                };
            };
            if(!shape.collision(newArray,0,0)){
                if(!u){
                    this.undo.push({
                        type: 0,
                        dir: (dir+1)%2,
                    });
                }
                this.activeShape = newArray;
            }
        }

        this.collision = function(array,x,y) {
            for(let i=0;i<array.length;i++){
                for(let j=0;j<array.length;j++){
                    if(array[i][j]){
                        if(!array[i][j]){
                            continue;
                        }
                        let newX = (j+this.x+x)*dimentions + dimentions;
                        let newY = (i+this.y+y)*dimentions + dimentions;
                        if(newX<=0 || newX>canvas.width || newY>canvas.height){
                            return true;
                        }
                        if(newY<=0){
                            continue;
                        }
                        if(board.board[i+this.y+y][j+this.x+x] >= 0){
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        this.redoStep = function() {
            if(!this.redo.isEmpty()){
                speed = Date.now();
                let step = this.redo.pop();
                switch(step.type){
                    case 0: // rotate
                        drawer.unDraw(this.activeShape);
                        this.rotate(step.dir);
                        drawer.draw(this.activeShape);
                        break;
                    case 1:  // move #DONE
                        this.move(step.move[0], step.move[1], 1);
                        step.move[0] *= -1;
                        step.move[1] *= -1;
                        this.undo.push(step);
                        break;
                    case 2: //delete created row
                        step.rows.forEach((value) => {
                            board.deleteRow(value.index);
                            board.drawBoard();
                        })
                        break;
                    case 3: // getback block and lock state
                        board.lockState(shape.activeShape, shape.activeShapeIndex);
                        shape.newBlock(step.block);
                        break;
                }
            }
        }

        this.undoStep = function() {
            if(!this.undo.isEmpty()){
                speed = Date.now();
                let step = this.undo.pop();
                switch(step.type){
                    case 0:
                        drawer.unDraw(this.activeShape);
                        this.rotate(step.dir,1);
                        drawer.draw(this.activeShape);
                        step.dir = (step.dir + 1)%2;
                        this.redo.push(step);
                        break;
                    case 1:  
                        this.move(step.move[0], step.move[1], 1);
                        step.move[0] *= -1;
                        step.move[1] *= -1;
                        this.redo.push(step);
                        break;
                    case 2:
                        board.createRow(step.rows);
                        this.redo.push(step);
                        break;
                    case 3:
                        let r = {
                            type: 3,
                            block: {
                                shape: this.activeShape,
                                index: this.activeShapeIndex,
                                x: this.x,
                                y: this.y,
                            }
                        } 
                        shape.newBlock(step.block);
                        board.unlockState(shape.activeShape);
                        this.redo.push(r);
                        break;
                }
            }
        }
    }

    
    //-----------------------------------------------------------------------------------------------------------------------------------//


})();