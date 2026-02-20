
//
//points
class Point2{
    constructor(x, y){
        this.x = x
        this.y = y
    }
    toInt(){
        return Math.sqrt(this.x**2 + this.y**2)
    }
}

function clearCanvas(){
    c.clearRect(0, 0, canvas.width , canvas.height)
}

function drawCircle(center, radius, color_fill, color_line){
    c.beginPath()
    c.arc(center.x, center.y, radius, 0, 2*Math.PI)
    c.fillStyle = color_fill
    c.fill()
    c.strokeStyle = color_line
    //c.lineWidth = 4
    c.stroke()
}
function drawLine(first, next, color){
    //first, next : Point
    //color : string
    c.beginPath()
    c.moveTo(first.x , first.y) // first point
    c.lineTo(next.x , next.y) // next point
    c.strokeStyle = color
    c.lineWidth = 1
    c.stroke()
    c.closePath()
}
function drawRec(x0, y0, dx, dy, color){
    c.beginPath()
    c.rect(x0, y0, dx, dy)
    c.strokeStyle = color
    c.stroke()
    c.fillStyle = color
    c.fill()
    c.closePath()
}

//mini map
var canvas = document.getElementById('minimap')
console.log(canvas)
var c = canvas.getContext('2d')
//c.translate(0.1, 0.1);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var p = new Point2(canvas.width/2, canvas.height/2)
drawCircle(p, 3, 'red', 'white')
c.font = "12px Arial"
c.fillStyle = 'black'
c.textAlign = 'center'


