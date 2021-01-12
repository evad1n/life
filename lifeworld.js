const lifeworld = {
    
    init(numCols, numRows){
        this.numCols = numCols;
        this.numRows = numRows;
        this.world = this.buildArray();
        this.worldBuffer = this.buildArray();
        this.randomSetup();
    },
    
    buildArray(){
        let outerArray = [];
        for(let row = 0; row < this.numRows; row++){
            let innerArray = [];
            for(let col = 0; col < this.numCols; col++){
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        return outerArray;
    },
    
    randomSetup(){
        for(let row = 0; row < this.numRows; row++){
            for(let col = 0; col < this.numCols; col++){
                this.world[row][col] = 0;
                if(Math.random() < .1){
                    this.world[row][col] = 1;
                }
            }
        }
    },
    
    getLivingNeighbors(row,col){
        if(row <= 0 || col <= 0)
            return 0;
        if(row >= this.numRows - 1 || col >= this.numCols - 1)
            return 0;
        
        let count = 0;
        
        count += this.world[row-1][col-1];
        count += this.world[row-1][col];
        count += this.world[row-1][col+1];
        count += this.world[row][col-1];
        count += this.world[row][col+1];
        count += this.world[row+1][col-1];
        count += this.world[row+1][col];
        count += this.world[row+1][col+1];
        
        return count;
    },
    
    step(){
        for(let row = 0; row < this.numRows; row++){
            for(let col = 0; col < this.numCols; col++){
                this.worldBuffer[row][col] = this.evaluate(this.getLivingNeighbors(row,col), this.world[row][col]);
            }
        }
        let temp = this.world;
        this.world = this.worldBuffer;
        this.worldBuffer = temp;
    },
    
    //Evaluate this cell based on neighbors to determine if it lives or dies
    evaluate(neighbors, value){
        if(neighbors < 2)
            return 0;
        if(neighbors > 3)
            return 0;
        if(neighbors == 3 && value == 0)
            return 1;
        if(neighbors == 2 && value == 0)
            return 0;
        else
            return 1;
    }
}