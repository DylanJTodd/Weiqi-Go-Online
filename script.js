class Board 
{
    constructor(canvas, ctx, img) 
    {
        this.canvas = canvas;
        this.ctx = ctx;
        this.img = img;
        this.stones = Array.from({length: 19}, () => Array(19).fill(0));
        this.stoneGroups = [];
        this.cellSize = this.canvas.width / 20;
        this.currentTurn = -1;
    }

    validCheck(x, y) 
    {
        return this.stones[x][y] == 0;
    }

    libertyCheck() 
    {
        for (let groups of this.stoneGroups)
        {

            if (groups.calculateLiberties() == 0)
            {
                return groups;
            }
        }
        return null;
    }

    redraw() 
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
        for(let i = 0; i < this.stones.length; i++) {
            for(let j = 0; j < this.stones[i].length; j++) {
                if (this.stones[i][j] instanceof Stone) {
                    this.ctx.beginPath();
                    this.ctx.arc((j+1) * this.cellSize, (i+1) * this.cellSize, 20, 0, 2 * Math.PI, false);
                    this.ctx.fillStyle = this.stones[i][j].color == 1 ? "White" : "Gold";
                    this.ctx.fill();
                }
            }
        }
    }
}

class Group 
{
    constructor(stone, board) 
    {
        this.stones = new Set([stone]);
        this.board = board;
    }

    deleteGroup(board)
    {
        for (let index in board.stoneGroups)
        {
            if (board.stoneGroups[index] === this)
            {
                board.stoneGroups.splice(index,1)
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


    merge(groups,stone) 
    {
        let newGroup = new Group(stone, this.board)
        for (let group of groups)
        {
            for (let index of group)
            {
                newGroup.add(index)
            }
            group.deleteGroup(this.board)
        }

        return newGroup;
    }
}

class Stone
{
    constructor(x,y,color, group, board)
    {
        this.x = x;
        this.y = y;
        this.color = color;
        this.board = board;
        this.group = group || new Group(this, board);
        this.group.liberties = this.group.calculateLiberties();
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

        if (board.validCheck(y,x)) {
            var color = board.currentTurn == -1 ? 1 : -1;
            var stone = new Stone(x, y, color, null, board);
            board.stones[y][x] = stone;
            board.currentTurn *= -1;
            var group = new Group(stone, board);
            board.stoneGroups.push(group);

            let removedGroup = board.libertyCheck();
            if (removedGroup !== null)
            {
                for (let removableStone of removedGroup.stones)
                {
                    board.stones[removableStone.x][removableStone.y] = 0;
                }
                removedGroup.deleteGroup(board);
            }
        }
        else
        {
            stone = board.stones[y][x]; 
            console.log("Color:" + stone.color + " X,Y:" + "(" + stone.x + " " + stone.y + ") " + "Liberties: " + stone.group.calculateLiberties());
        }

        setTimeout(() => board.redraw(), 0);
    }
}

