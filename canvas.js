var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

const rectWidth = 10;
const rectHeight = 10;
const rects = new Array(41);
for (let i = 0; i < 41; i++) {
  rects[i] = new Array(41);
  for (let j = 0; j < 41; j++) {
    rects[i][j] = { xpos: j * rectWidth, ypos: i * rectHeight };
  }
}

for (row of rects) {
  for (rect of row) {
    ctx.beginPath();
    ctx.rect(
      rect.xpos,
      rect.ypos,
      rect.xpos + rectWidth,
      rect.ypos + rectHeight
    );
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.stroke();
  }
}

ctx.beginPath();
ctx.rect(0, 0, 0 + rectWidth, 0 + rectHeight);
ctx.fill("red");
