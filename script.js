window.onload = function() {
    var canvas = document.getElementById('board');
    var ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetHeight;
    canvas.height = canvas.offsetHeight;

    var img = new Image();
    img.src = 'weiqi.png';
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    var stones = new Array(19);
    for (let z = 0; z < 19; z++) {
        stones[z] = new Array(19);
        for (let i = 0; i < 19; i++) {
            stones[z][i] = 0;
        }
    }
    var cellSize = canvas.width / 20;
    var currentTurn = -1; 

    canvas.onclick = function(e) {
        var x = (Math.round((e.pageX - canvas.offsetLeft) / cellSize))-1;
        var y = (Math.round((e.pageY - canvas.offsetTop) / cellSize))-1;
        if (validCheck(y,x)) // Switch x and y here
        {
            if (currentTurn == -1)
            {
                stones[y][x] = currentTurn;
                currentTurn = 1;
            }
            else{
                stones[y][x] = currentTurn; // Switch x and y here
                currentTurn = -1;
            }
        }
        setTimeout(redraw, 0);
    }

    function validCheck(x, y) {
            if (stones[x][y] != 0) {
                return false;
            }
        return true;
    }

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        for(let i = 0; i < stones.length; i++) {
            for(let j = 0; j < stones[i].length; j++) {
                if (stones[i][j] != 0) {
                    ctx.beginPath();
                    ctx.arc((j+1) * cellSize, (i+1) * cellSize, 20, 0, 2 * Math.PI, false);
                    if (stones[i][j] == 1) {
                        ctx.fillStyle = "White";
                    } else {
                        ctx.fillStyle = "gold";
                    }
                    ctx.fill();
                }
            }
        }
    }
}
