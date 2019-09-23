const rectWidth = 30;
const rectHeight = 30;
const numRows = 41;
const numCols = 41;
// 10x10, 100: 0.23, 3.6ms
// 100x100, 10,000: 0.24, 171ms
// 200x200, 40,000: 831ms
// 300x300, 90,000: 2150ms
// 400x400, 160,000 5447ms
// 500x500, 250,000: 0.23, 11063ms, 10732ms
// 600x600, 360,000: 21441ms
// 700x700, 490,000: 41317ms
// 800x800, 640,000: 66912ms
// 900x900, 810,000: 104049ms

const svgWidth = rectWidth * numCols;
const svgHeight = rectHeight * numRows;

let antPos = [Math.floor(numRows / 2), Math.floor(numCols / 2)];
let antDir = 0;

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

const DIR_TO_POLYGON = {
  0: function(xpos, ypos) {
    return `${xpos + 25},${ypos + 25} ${xpos + 25},${ypos + 5} ${xpos +
      5},${ypos + 15}`;
  },
  1: function(xpos, ypos) {
    return `${xpos + 25},${ypos + 25} ${xpos + 5},${ypos + 25} ${xpos +
      15},${ypos + 5}`;
  },
  2: function(xpos, ypos) {
    return `${xpos + 5},${ypos + 5} ${xpos + 5},${ypos + 25} ${xpos +
      25},${ypos + 15}`;
  },
  3: function(xpos, ypos) {
    return `${xpos + 5},${ypos + 5} ${xpos + 25},${ypos + 5} ${xpos +
      15},${ypos + 25}`;
  }
};

function turn(tile, antDirection) {
  state = tile.getAttribute("data-color");

  if (0 == state || 1 == state) {
    // if black or red
    antDirection = mod(antDirection + 1, 4); // turn right
  } else {
    // if blue or yellow
    antDirection = mod(antDirection - 1, 4); // turn left
  }

  return antDirection;
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

function drawAnt(tile, ant, antDirection) {
  let xpos = Number(tile.getAttribute("x"));
  let ypos = Number(tile.getAttribute("y"));

  ant.setAttribute("points", DIR_TO_POLYGON[antDirection](xpos, ypos));
}

function incrementColorAtTile(tile) {
  let colorCode = Number(tile.getAttribute("data-color"));
  const newCode = mod(colorCode + 1, 4);
  tile.setAttribute("data-color", newCode);

  tile.style["fill"] = CODE_TO_HEX[newCode];
}
console.time("Setup");
// Select div with ID grid
let gridDiv = document.getElementById("grid");

// Add an SVG element
let svgTag = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgTag.setAttribute("width", `${svgWidth}px`);
svgTag.setAttribute("height", `${svgHeight}px`);

gridDiv.append(svgTag);

const rectHandles = new Array(numRows);
for (let i = 0; i < numCols; i++) {
  rectHandles[i] = new Array(numCols);
}

// Add <g> elements
for (let i = 0; i < numRows; i++) {
  let gTag = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gTag.setAttribute("class", "row");

  // Inside each <g> add <rect> elements
  for (let j = 0; j < numCols; j++) {
    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("class", "square");
    rect.setAttribute("id", `x${j}y${i}`);
    rect.setAttribute("x", `${rectWidth * j}`);
    rect.setAttribute("y", `${rectHeight * i}`);
    rect.setAttribute("width", String(rectWidth));
    rect.setAttribute("height", String(rectHeight));
    rect.setAttribute("data-color", 0);
    rect.style["fill"] = "#000";
    rect.style["stroke"] = "#FFF";

    rectHandles[j][i] = rect;
    gTag.append(rect);
  }
  svgTag.append(gTag);
}

// Create <polygon element> for the ant
let antHandle = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "polygon"
);

antHandle.style["fill"] = "lime";
antHandle.style["stroke"] = "black";

svgTag.append(antHandle);
console.timeEnd("Setup");

// main loop
let i = 0;
let currentSquare;
let timeArray = new Array();
let t0, t1;
setInterval(() => {
  t0 = performance.now();
  currentSquare = rectHandles[antPos[0]][antPos[1]];
  drawAnt(currentSquare, antHandle, antDir);

  antDir = turn(currentSquare, antDir);
  antPos = move(antPos);
  incrementColorAtTile(currentSquare);

  i++;

  t1 = performance.now();
  timeArray.push(t1 - t0);
  console.log(
    timeArray.reduce(function(total, num) {
      return total + num;
    }) / i,
    t1 - t0
  );
}, 100);
