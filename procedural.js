function mod(n, m) {
  return ((n % m) + m) % m;
}

function reverseDictionary(dict) {
  const newDict = {};
  for (const key in dict) {
    newDict[dict[key]] = key;
  }

  return newDict;
}

const CODE_TO_HEX = {
  0: "#000", // BLACK
  1: "#F00", // RED
  2: "#FF0", // YELLOW
  3: "#00F" // BLUE
};

const HEX_TO_CODE = reverseDictionary(CODE_TO_HEX);

const DIR_TO_TEXT = {
  0: "West",
  1: "North",
  2: "East",
  3: "South"
};

function turn(tile, antDirection) {
  console.log(tile.style["fill"]);
  state = HEX_TO_CODE[tile.style["fill"]];

  if (0 == state || 1 == state) {
    // if black or red
    antDirection = mod(antDirection + 1, 4); // turn right
  } else {
    // if blue or yellow
    antDirection = mod(antDirection - 1, 4); // turn left
  }
  console.log([state, antDirection]);

  return [state, antDirection];
}

/**
 * Move the ant forward inside a 2D array
 * with 0,0 being the top left corner.
 */
function move(antPosition) {
  if (0 == antDir) {
    antPosition[0]--;
  } else if (1 == antDir) {
    antPosition[1]--;
  } else if (2 == antDir) {
    antPosition[0]++;
  } else {
    antPosition[1]++;
  }

  return antPosition;
}

function drawAnt(tile, ant) {
  let xpos = Number(tile.getAttribute("x"));
  let ypos = Number(tile.getAttribute("y"));

  ant.setAttribute(
    "points",
    `${ypos + 5},${xpos + 5} ${ypos + 25},${xpos + 5} ${ypos + 15},${xpos + 25}`
  );
}

function incrementColorAtTile(colorCode) {
  const newCode = mod(colorCode + 1, 4);
  currentSquare.setAttribute("fill", CODE_TO_HEX[newCode]);
}

const rectWidth = 30;
const rectHeight = 30;
const numRows = 41;
const numCols = 41;

const svgWidth = rectWidth * numCols;
const svgHeight = rectHeight * numRows;

let antPos = [20, 20];
let antDir = 0;

// Select div with ID grid
let gridDiv = document.querySelector("#grid");

// Add an SVG element
let svgTag = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgTag.setAttribute("width", `${svgWidth}px`);
svgTag.setAttribute("height", `${svgHeight}px`);

gridDiv.append(svgTag);

// Add 10 <g> elements
for (let i = 0; i < numRows; i++) {
  let gTag = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gTag.setAttribute("class", "row");

  // Inside each <g> add 10 <rect> elements
  for (let j = 0; j < numCols; j++) {
    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("class", "square");
    rect.setAttribute("id", `x${j}y${i}`);
    rect.setAttribute("x", `${rectWidth * j}`);
    rect.setAttribute("y", `${rectHeight * i}`);
    rect.setAttribute("width", String(rectWidth));
    rect.setAttribute("height", String(rectHeight));
    rect.style["fill"] = "#000";
    rect.style["stroke"] = "#FFF";

    gTag.append(rect);
  }
  svgTag.append(gTag);
}

// Create <polygon element> for the ant
let ant = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

ant.style["fill"] = "lime";
ant.style["stroke"] = "black";

svgTag.append(ant);

// main loop
let i = 0;
let currentSquare;
let currentColorCode;
setInterval(() => {
  currentSquare = document.querySelector(`#x${antPos[0]}y${antPos[1]}`);

  drawAnt(currentSquare, ant);

  [currentColorCode, antDir] = turn(currentSquare, antDir);

  incrementColorAtTile(currentSquare, currentColorCode);

  antPos = move(antPos);

  i++;
}, 1000);
