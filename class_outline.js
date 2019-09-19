const rectWidth = 30;
const rectHeight = 30;
const numRows = 10;
const numCols = 10;
const svgWidth = rectWidth * numCols;
const svgHeight = rectHeight * numRows;

let gridDiv = document.querySelector("#grid");

let svgTag = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgTag.setAttribute("width", `${svgWidth}px`);
svgTag.setAttribute("height", `${svgHeight}px`);

gridDiv.append(svgTag);

for (let i = 0; i < 10; i++) {
  let gTag = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gTag.setAttribute("class", "row");
  gTag.id;
  for (let j = 0; j < 10; j++) {
    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("class", "square");
    rect.setAttribute("id", `x${j}y${i}`);
    rect.setAttribute("x", `${rectWidth * j}`);
    rect.setAttribute("y", `${rectHeight * i}`);
    rect.setAttribute("width", String(rectWidth));
    rect.setAttribute("height", String(rectHeight));
    rect.style["fill"] = "rgb(0,0,0)";
    rect.style["stroke"] = "rgb(255,255,255)";

    gTag.append(rect);
  }
  svgTag.append(gTag);
}

for (let i = 0; i < 10; i++) {
  let square = document.querySelector(`#x${i}y${i}`);
  square.style["fill"] = "#F00";
}

let ant = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

ant.style["fill"] = "lime";
ant.style["stroke"] = "black";

svgTag.append(ant);

let i = 0;
setInterval(() => {
  let currentSquare = document.querySelector(`#x${i}y${i}`);
  let xpos = Number(currentSquare.getAttribute("x"));
  let ypos = Number(currentSquare.getAttribute("y"));

  ant.setAttribute(
    "points",
    `${ypos + 5},${xpos + 5} ${ypos + 25},${xpos + 5} ${ypos + 15},${xpos + 25}`
  );
  i++;
}, 1000);

class Ant {
  constructor(x = 0, y = 0, direction = 0) {
    this.direction = direction;
    this.position = [x, y];
    this.antTag = createAnt(x, y);
  }

  createAnt() {
    let antTag = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );

    antTag.style["fill"] = "lime";
    antTag.style["stroke"] = "black";

    return antTag;
  }

  /**
   * Move the ant one tile forward.
   */
  move() {}

  /**
   * Given the state of the tile currently under the ant,
   * turn it appropriately.
   *
   * @param state - State of tile underneath the ant.
   */
  turn(state) {}
}

class Grid {
  constructor(
    x = 41,
    y = 41,
    width = 30,
    height = 30,
    fill = "#FFF",
    stroke = "#000"
  ) {
    this.dimensions = [x, y];
    this.square.dimensions = [width, height];
    this.fill = fill;

    this.svgTag = this.createGrid(y, x, height, width, fill, stroke);
  }

  /**
   * Adds an SVG element inside the body tag and then creates an
   * numRows by numCols grid inside it.
   *
   * @param numRows - Number of rows in grid
   * @param numCols - Number of columns in grid
   * @param rowHeight - Size in pixels of each row
   * @param colWidth - Size in pixels of each column
   * @param fill - Color used to fill cells on creation
   * @param stroke - Color of dividing lines
   */
  createGrid(numRows, numCols, rectHeight, rectWidth, fill, stroke) {
    const svgWidth = rectWidth * numCols;
    const svgHeight = rectHeight * numRows;

    let gridDiv = document.querySelector("#grid");

    let svgTag = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgTag.setAttribute("width", `${svgWidth}px`);
    svgTag.setAttribute("height", `${svgHeight}px`);

    gridDiv.append(svgTag);

    for (let i = 0; i < 10; i++) {
      let gTag = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gTag.setAttribute("class", "row");
      gTag.id;
      for (let j = 0; j < 10; j++) {
        let rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("class", "square");
        rect.setAttribute("id", `x${j}y${i}`);
        rect.setAttribute("x", `${rectWidth * j}`);
        rect.setAttribute("y", `${rectHeight * i}`);
        rect.setAttribute("width", String(rectWidth));
        rect.setAttribute("height", String(rectHeight));
        rect.style["fill"] = `${fill}`;
        rect.style["stroke"] = `${stroke}`;

        gTag.append(rect);
      }
      svgTag.append(gTag);
    }

    return svgTag;
  }
}

class AntFarm {
  constructor(grid, ant) {
    this.svgTag = grid.svgTag;
    this.ant = ant;
  }

  updateAnt() {
    let currentSquare = document.querySelector(`#x${this.ant.x}y${this.ant.y}`);
    let xpos = Number(currentSquare.getAttribute("x"));
    let ypos = Number(currentSquare.getAttribute("y"));

    this.antTag.setAttribute(
      "points",
      `${ypos + 5},${xpos + 5} ${ypos + 25},${xpos + 5} ${ypos + 15},${xpos +
        25}`
    );
  }

  /**
   * Changes the color of the requested square to the
   * next appropriate color
   *
   * @param x - x-coordinate of square to change
   * @param y - y-coordinate of square to change
   */
  incrementGridColor(x, y) {}

  getTileColor(x, y) {}

  iterate(n) {
    let ant = this.ant;

    for (let i = 0; i < n; i++) {
      const currentColor = this.grid.getTileColor(ant.x, ant.y);
      ant.turn(currentColor);
      ant.move();

      this.grid.incrementGridColor(ant.x, ant.y);
      this.updateAnts();
    }
  }
}

const grid = new Grid(41, 41, 30, 30, "#FFF", "#000");
const ant = new Ant(20, 20, 0);

const antFarm = new AntFarm(grid, [ant]);

antFarm.iterate(1000);
