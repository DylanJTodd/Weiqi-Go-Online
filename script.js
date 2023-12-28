class Board 
{
    constructor(canvas, ctx, img) 
    {
        this.goldScore = 0;
        this.whiteScore = 0;
        this.canvas = canvas;
        this.ctx = ctx;
        this.img = img;
        this.stones = Array.from({length: 19}, () => Array(19).fill(0));
        this.stoneGroups = [];
        this.cellSize = this.canvas.width / 20;
        this.currentTurn = -1;
    }

    clone()
    {
        let newBoard = new Board(this.canvas, this.ctx, this.img)
        newBoard.cellSize = this.cellSize;
        newBoard.currentTurn = this.currentTurn;
        newBoard.stoneGroups = this.stoneGroups.map(group => group.clone(newBoard));
        newBoard.stones = this.stones.map(row => row.map(cell => {
            if (cell instanceof Stone){
                return cell.clone(this, cell.group);
            }
            else{
                return cell;
            }
        }))
        return newBoard;
    }

    validCheck(stone) 
    {
        if (this.stones[stone.y][stone.x] !== 0) {
            return false;
        }

        let newBoard = this.clone();
        let newStone = stone.clone();

        newBoard.stones[newStone.y][newStone.x] = newStone;
        newBoard.checkAndMerge(newStone);
        
        let removedGroups = newBoard.libertyCheck();
        if (removedGroups === null) {
            return true;
        }

        let isPlaceable = false;
        for (let group of removedGroups)
        {
            for (let removableStone of group.stones)
            {

                console.log("My Stone: " + newStone)
                console.log("Removed Stone: " + removableStone)
                if (removableStone.color !== newStone.color)
                {
                    isPlaceable = true;
                }
                newBoard.stones[removableStone.y][removableStone.x] = 0;
            }
            group.deleteGroup(newBoard);
        }

        if (newBoard.stones[newStone.y][newStone.x] !== newStone && !isPlaceable)
        {
            return false;
        }

        return true;
    }

    libertyCheck() 
    {
        let noLiberties = [];

        for (let groups of this.stoneGroups)
        {
            if (groups.calculateLiberties() == 0)
            {
                noLiberties.push(groups);
            }
        }

        if (noLiberties.length == 0)
        {
            return null;
        }
        else{
            return noLiberties;
        }
    }
    checkAndMerge(stone) {
        const directions = [
            {dx: -1, dy: 0},
            {dx: 1, dy: 0},
            {dx: 0, dy: -1},
            {dx: 0, dy: 1}
        ];
        let groupsToMerge = [];
    
        for (let direction of directions) {
            let x = stone.x + direction.dx;
            let y = stone.y + direction.dy;
            if (y >= 0 && y < this.stones.length && x >= 0 && x < this.stones[y].length) {
                let neighbor = this.stones[y][x];
                if (neighbor && neighbor.color === stone.color) {
                    groupsToMerge.push(neighbor.group);
                }
            }
        }
    
        if (groupsToMerge.length > 0) {
            this.merge(groupsToMerge, stone);
        }
        else {
            var group = new Group(stone, this, stone.color);
            stone.group = group;
            this.stoneGroups.push(group);
        }
    }
    
    
    merge(groups, stone) {
        let newGroup = new Group(stone, this, stone.color);
        stone.group = newGroup;
        this.stoneGroups.push(newGroup);
        for (let group of groups) {
            for (let index of group.stones) {
                newGroup.stones.add(index);
                index.group = newGroup;
            }
            group.deleteGroup();
        }
        return newGroup;
    }
    
    

    redraw() 
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
        for(let i = 0; i < this.stones.length; i++) {
            for(let j = 0; j < this.stones[i].length; j++) {
                if (this.stones[i][j] instanceof Stone) {
                    let color = this.stones[i][j].color == 1 ? "White" : "Gold";
                    this.ctx.beginPath();
                    this.ctx.arc((j+1) * this.cellSize, (i+1) * this.cellSize, 20, 0, 2 * Math.PI, false);
                    this.ctx.fillStyle = color;
                    this.ctx.fill();

                }
            }
        }
    }
}

class Group 
{
    constructor(stone, board, color) 
    {
        this.stones = new Set([stone]);
        this.board = board;
        this.color = color;
    }

    clone(board)
    {
        let clonedStones = new Set(Array.from(this.stones).map(stone => stone.clone(board, this)));
        let newGroup = new Group([...clonedStones][0], board, this.color);
        return newGroup;
    }

    deleteGroup()
    {
        for (let index in this.board.stoneGroups)
        {
            if (this.board.stoneGroups[index] === this)
            {
                this.board.stoneGroups.splice(index,1)
            }
        }
    }

    calculateLiberties() 
    {
        let liberty = 0;
        for (let stone of this.stones)
        {
            if(stone.y + 1 < 19 && this.board.stones[stone.y+1][stone.x] === 0)
            {
                liberty += 1;
            }
            if(stone.y - 1 >= 0 && this.board.stones[stone.y-1][stone.x] === 0)
            {
                liberty += 1;
            }
            if(stone.x + 1 < 19 && this.board.stones[stone.y][stone.x+1] === 0)
            {
                liberty += 1;
            }
            if(stone.x - 1 >= 0 && this.board.stones[stone.y][stone.x-1] === 0)
            {
                liberty += 1;
            }
        }
        return liberty;
    }
}

class Stone
{
    constructor(x,y,color,board)
    {
        this.x = x;
        this.y = y;
        this.color = color;
        this.board = board;
        this.group = null;
    }

    clone(board, group)
    {
        let newStone = new Stone(this.x, this.y, this.color, board);
        newStone.group = group;
        return newStone;
    }

    toString() {
        return ("X:" + this.x + " Y:" + this.y + " Color: " + this.color);
    }
}


window.onload = function() 
{
    var canvas = document.getElementById('board');
    var ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetHeight;
    canvas.height = canvas.offsetHeight;

    var img = new Image();
    img.src = 'weiqi.png';
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    var board = new Board(canvas, ctx, img);

    canvas.onclick = function(e) 
    {
        var x = (Math.round((e.pageX - canvas.offsetLeft) / board.cellSize))-1;
        var y = (Math.round((e.pageY - canvas.offsetTop) / board.cellSize))-1;

        var color = board.currentTurn;
        var stone = new Stone(x, y, color, board);

        if (board.validCheck(stone)) {
            board.stones[y][x] = stone;
            board.currentTurn *= -1;
            board.checkAndMerge(stone);
            
            let removedGroup = board.libertyCheck();
            if (removedGroup != null)
            {
                for (let removableGroup of removedGroup)
                {
                    if (removableGroup.color != stone.color)
                    {
                        for (let removableStone of removableGroup.stones)
                        {
                            board.stones[removableStone.y][removableStone.x] = 0;
                            if (removableStone.color == 1)
                            {
                                board.goldScore += 1
                            }
                            else
                            {
                                board.whiteScore += 1;
                            }
                        }
                        removableGroup.deleteGroup(board);
                    }
                }

                document.getElementById('goldCounter').innerText = board.goldScore;
                document.getElementById('whiteCounter').innerText = board.whiteScore;
            }
            board.stones[y][x] = stone;

        }
        setTimeout(() => board.redraw(), 0);
    }
}

