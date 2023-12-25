window.onload = function() {
    var canvas = document.getElementById('board');
    var ctx = canvas.getContext('2d');

    // Adjust canvas size
    canvas.width = canvas.offsetHeight;
    canvas.height = canvas.offsetHeight;

    var img = new Image();
    img.src = 'weiqi.png';
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    var stones = [];
    var cellSize = canvas.width / 20;
    var offsetX = -3;  // Offset for x-coordinate
    var offsetY = cellSize /9;  // Offset for y-coordinate

    // Add a variable to keep track of the current color
    var currentColor = 'white'; 

    canvas.onclick = function(e) {
        var x = Math.round((e.pageX - canvas.offsetLeft - offsetX) / cellSize) * cellSize + offsetX;
        var y = Math.round((e.pageY - canvas.offsetTop - offsetY) / cellSize) * cellSize + offsetY;

        redraw();
    }

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        for(var i = 0; i < stones.length; i++) {
            ctx.beginPath();
            ctx.arc(stones[i].x, stones[i].y, 30, 0, 2 * Math.PI, false);
            // Use the color associated with each stone
            ctx.fillStyle = stones[i].color;
            ctx.fill();
        }
    }
}
