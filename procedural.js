class AntFarm {
  constructor(gridSize = 41, squareSize = 20, speed = 1000) {
    this.gridSize = Number(gridSize);
    this.squareSize = Number(squareSize);
    this.speed = Number(speed);
  }

  stop() {
    clearInterval(this.mainLoop);
  }

  remove() {
    clearInterval(this.mainLoop);
    this.svgHandle.remove();
  }

  start() {
    const rectWidth = this.squareSize;
    const rectHeight = this.squareSize;
    const numRows = this.gridSize;
    const numCols = this.gridSize;
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
    // 1000x1000, 1000000: 118119.19287109375ms

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
        return `${xpos + (rectHeight - 2)},${ypos + (rectHeight - 2)} ${xpos +
          (rectHeight - 2)},${ypos + 2} ${xpos + 2},${ypos + rectHeight / 2}`;
      },
      1: function(xpos, ypos) {
        return `${xpos + (rectHeight - 2)},${ypos + (rectHeight - 2)} ${xpos +
          2},${ypos + (rectHeight - 2)} ${xpos + rectHeight / 2},${ypos + 2}`;
      },
      2: function(xpos, ypos) {
        return `${xpos + 2},${ypos + 2} ${xpos + 2},${ypos +
          (rectHeight - 2)} ${xpos + (rectHeight - 2)},${ypos +
          rectHeight / 2}`;
      },
      3: function(xpos, ypos) {
        return `${xpos + 2},${ypos + 2} ${xpos + (rectHeight - 2)},${ypos +
          2} ${xpos + rectHeight / 2},${ypos + (rectHeight - 2)}`;
      }
    };

    function turn(tile, antDirection) {
      const state = tile.getAttribute("data-color");

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

    function drawAnt(antPos, ant, antDirection) {
      let xpos = antPos[0] * rectWidth;
      let ypos = antPos[1] * rectWidth;

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
    svgTag.setAttribute("id", "mainSVG");

    const rectHandles = new Array(numRows);
    for (let i = 0; i < numCols; i++) {
      rectHandles[i] = new Array(numCols);
    }
    // Add <g> elements
    let gTag;
    let rect;

    let baseGTag = document.createElementNS("http://www.w3.org/2000/svg", "g");
    baseGTag.setAttribute("class", "row");

    let baseRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    baseRect.setAttribute("class", "square");
    baseRect.setAttribute("width", String(rectWidth));
    baseRect.setAttribute("height", String(rectHeight));
    baseRect.setAttribute("data-color", 0);
    baseRect.style["fill"] = "#000";
    baseRect.style["stroke"] = "#FFF";

    for (let i = 0; i < numRows; i++) {
      gTag = baseGTag.cloneNode();

      // Inside each <g> add <rect> elements
      for (let j = 0; j < numCols; j++) {
        rect = baseRect.cloneNode();
        rect.setAttribute("id", `x${j}y${i}`);
        rect.setAttribute("x", `${rectWidth * j}`);
        rect.setAttribute("y", `${rectHeight * i}`);

        rectHandles[j][i] = rect;
        gTag.append(rect);
      }
      svgTag.append(gTag);
    }

    this.svgHandle = svgTag;

    gridDiv.append(svgTag);

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
    let timeArray = new Array();
    let t0, t1;

    let currentSquare = rectHandles[antPos[0]][antPos[1]];
    drawAnt(antPos, antHandle, antDir);

    this.mainLoop = setInterval(() => {
      t0 = performance.now();

      antDir = turn(currentSquare, antDir);
      antPos = move(antPos);

      incrementColorAtTile(currentSquare);

      currentSquare = rectHandles[antPos[0]][antPos[1]];

      // check if we are moving out of bounds, else update the ant
      if (
        antPos[0] < 0 ||
        antPos[1] < 0 ||
        antPos[0] >= numRows ||
        antPos[1] >= numCols
      ) {
        clearInterval(this.mainLoop);
      } else {
        drawAnt(antPos, antHandle, antDir);
      }

      i++;

      // t1 = performance.now();
      // timeArray.push(t1 - t0);
      // console.log(
      //   "average time:",
      //   timeArray.reduce(function(total, num) {
      //     return total + num;
      //   }) / i,
      //   "last step",
      //   t1 - t0
      // );
    }, this.speed);
  }
}
