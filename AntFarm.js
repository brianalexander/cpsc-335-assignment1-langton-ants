/**
 * AntFarm is a class that allows for the simulation of
 * Langton Ants displayed on an HTML webpage.  To use it, it must
 * be run on a web page with an empty div with an id of "grid".
 * After instantiation, calling the start method will create and
 * begin running the simulation.
 *
 * The ant is initially facing west.  This is Ant #12, with 12 in binary
 * being 1100, which translates to LLRR.  Thusly, the ant turns right on
 * a black and red square, and left on a yellow or blue square.  The
 * simulation stops when the ant steps out of bounds.
 *
 * @filename   AntFarm.js
 * @author     Brian Alexander <balexander28@csu.fullerton.edu>
 * @copyright  2019
 * @link       https://github.com/brianalexander/cpsc-335-assignment1-langton-ants
 */

/**
 * @function
 * @name mod
 *
 * @description Calculates the modulus of a number.
 *
 * @param {Number} n dividend
 * @param {Number} m divisor
 *
 * @returns {Number} Positive modulus
 */
function mod(n, m) {
  return ((n % m) + m) % m;
}
class AntFarm {
  /**
   * @constructor
   * @name AntFarm
   * @description This is the simulation object used
   *              for the grid displayed on the webpage.
   *
   * @param {Number} gridSize The length and width dimension of the grid in squares
   * @param {Number} squareSize The length and width of a square in pixels
   * @param {Number} speed Duration of each step in milliseconds
   * @param {String} stepTag the id where the step counter will be displayed
   */
  constructor(gridSize = 41, squareSize = 20, speed = 1000, stepTag = null) {
    this.gridSize = Number(gridSize);
    this.squareSize = Number(squareSize);
    this.speed = Number(speed);
    this.steps = 0;
    if (stepTag != null) {
      this.stepHandle = document.getElementById(stepTag);
    }
  }

  /**
   * @member
   * @private
   * @readonly
   */
  CODE_TO_HEX = {
    0: "#000", // BLACK
    1: "#F00", // RED
    2: "#FF0", // YELLOW
    3: "#00F" // BLUE
  };

  /**
   * @method
   * @name pause
   *
   * @description clears the interval for the main loop,
   *              visually pausing the execution on the page.
   */
  pause() {
    this.running = false;
    clearInterval(this.mainLoop);
  }

  /**
   * @method
   * @name resume
   *
   * @description Sets an interval execution of the loopFunction
   *              member defined on the instance. Visually starts
   *              simulation execution.
   */
  resume() {
    if (!this.outOfBounds) {
      this.running = true;
      this.mainLoop = setInterval(this.loopFunction, this.speed);
    }
  }

  /**
   * @method
   * @name increaseStepCount
   *
   * @description Increments the member steps variable and if an
   *              ID was provided to the constructor, will update
   *              the text of the HTML element with the new count.
   */
  increaseStepCount() {
    this.steps++;
    if (this.stepHandle) {
      this.stepHandle.innerHTML = this.steps;
    }
  }

  /**
   * @method
   * @name destroy
   *
   * @description stops execution of the main loop and removes all
   *              HTML elements that were added to the DOM.
   */
  destroy() {
    clearInterval(this.mainLoop);
    this.svgHandle.remove();
  }

  /**
   * @method
   * @name start
   *
   * @description Creates the necessary DOM elements
   *                and begins iterating and updating the grid.
   */
  start() {
    //
    // Create necessary consts given arguments from constructor
    //
    const rectWidth = this.squareSize;
    const rectHeight = this.squareSize;
    const numRows = this.gridSize;
    const numCols = this.gridSize;

    const svgWidth = rectWidth * numCols;
    const svgHeight = rectHeight * numRows;

    let antPos = [Math.floor(numRows / 2), Math.floor(numCols / 2)];
    let antDir = 0;

    console.time("Setup");
    //
    // Create the grid as elements on the page
    //
    // Get the element with id of grid
    let gridTag = document.getElementById("grid");

    // Create an svg element, set its attributes
    let svgTag = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgTag.setAttribute("width", `${svgWidth}px`);
    svgTag.setAttribute("height", `${svgHeight}px`);
    svgTag.setAttribute("id", "mainSVG");

    // rectHandles holds references to the rect tags in the DOM
    // this imporoves performance so we don't have to query the DOM
    const rectHandles = new Array(numRows);
    for (let i = 0; i < numCols; i++) {
      rectHandles[i] = new Array(numCols);
    }

    // Create a base g and rect element.  Set some common attributes
    // that will appear on all of their clones to improve performance.
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

    // Loop through i*j [(number of rows)*(number of columns)] times
    // creating the requisite DOM elements and storing their reference
    // in an rectHandles.
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

    // save a handle to the SVG tag so we can remove it later
    // when updating the settings of the simulation
    this.svgHandle = svgTag;

    gridTag.append(svgTag);

    // Create <polygon element> for the ant
    let antHandle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );

    // Set the colors for the ant
    antHandle.style["fill"] = "limegreen";
    antHandle.style["stroke"] = "black";

    // add ant element to the DOM
    svgTag.append(antHandle);
    console.timeEnd("Setup");

    // main loop
    let timeArray = new Array();
    let t0, t1;

    // draw the initial starting point for the ant
    let currentSquare = rectHandles[antPos[0]][antPos[1]];
    this.drawAnt(antPos, antHandle, antDir);

    // save a reference to the main loop function that will be executed
    // in the setInterval.  This can be used to start and stop the
    // running of the simulation.
    /**
     * @function
     * @private
     * @description the main loop for iterating.  Updates antDir and antPos
     *          accordingly and updates the DOM
     */
    this.loopFunction = () => {
      t0 = performance.now();

      antDir = this.turn(currentSquare, antDir);
      antPos = this.move(antPos, antDir);

      // check if we are moving out of bounds, else update the ant
      if (
        antPos[0] < 0 ||
        antPos[1] < 0 ||
        antPos[0] >= numRows ||
        antPos[1] >= numCols
      ) {
        this.pause();
        this.outOfBounds = true;
      } else {
        this.incrementColorAtTile(currentSquare);
        currentSquare = rectHandles[antPos[0]][antPos[1]];
        this.drawAnt(antPos, antHandle, antDir);

        this.increaseStepCount();
      }

      // t1 = performance.now();
      // timeArray.push(t1 - t0);
      // console.log(
      //   "average time:",
      //   timeArray.reduce(function(total, num) {
      //     return total + num;
      //   }) / this.steps,
      //   "last step",
      //   t1 - t0
      // );
    };

    // start the simulation
    this.resume();
  }

  /**
   * @method
   * @private
   * @name getDirectionFunction
   * @description returns the points attribute string for an
   *              HTML polygon element to create a triangle
   *              with the desired direction.
   *
   * @param {Number} direction
   *
   * @returns {function}
   */
  getDirectionFunction(direction) {
    switch (direction) {
      case 0:
        return this.drawPolygonWest;
      case 1:
        return this.drawPolygonNorth;
      case 2:
        return this.drawPolygonEast;
      case 3:
        return this.drawPolygonSouth;
    }
  }

  /**
   * @method
   * @private
   * @name drawPolygonWest
   * @description Generates polygon element points attribute for
   *          a west-pointing triangle.
   *
   * @param {Number} xpos x-coordinate in pixels to begin drawing.
   * @param {Number} ypos y-coordinate in pixels to begin drawing.
   *
   * @returns {String}
   */
  drawPolygonWest = (xpos, ypos) => {
    return `${xpos + (this.squareSize - 2)},${ypos +
      (this.squareSize - 2)} ${xpos + (this.squareSize - 2)},${ypos +
      2} ${xpos + 2},${ypos + this.squareSize / 2}`;
  };

  /**
   * @method
   * @private
   * @name drawPolygonNorth
   * @description Generates polygon element points attribute for
   *          a north-pointing triangle.
   *
   * @param {Number} xpos x-coordinate in pixels to begin drawing.
   * @param {Number} ypos y-coordinate in pixels to begin drawing.
   *
   * @returns {String}
   */
  drawPolygonNorth = (xpos, ypos) => {
    return `${xpos + (this.squareSize - 2)},${ypos +
      (this.squareSize - 2)} ${xpos + 2},${ypos +
      (this.squareSize - 2)} ${xpos + this.squareSize / 2},${ypos + 2}`;
  };

  /**
   * @method
   * @private
   * @name drawPolygonEast
   * @description Generates polygon element points attribute for
   *          am east-pointing triangle.
   *
   * @param {Number} xpos x-coordinate in pixels to begin drawing.
   * @param {Number} ypos y-coordinate in pixels to begin drawing.
   *
   * @returns {String}
   */
  drawPolygonEast = (xpos, ypos) => {
    return `${xpos + 2},${ypos + 2} ${xpos + 2},${ypos +
      (this.squareSize - 2)} ${xpos + (this.squareSize - 2)},${ypos +
      this.squareSize / 2}`;
  };

  /**
   * @method
   * @private
   * @name drawPolygonSouth
   * @description Generates polygon element points attribute for
   *          a south-pointing triangle.
   *
   * @param {Number} xpos x-coordinate in pixels to begin drawing.
   * @param {Number} ypos y-coordinate in pixels to begin drawing.
   *
   * @returns {String}
   */
  drawPolygonSouth = (xpos, ypos) => {
    return `${xpos + 2},${ypos + 2} ${xpos + (this.squareSize - 2)},${ypos +
      2} ${xpos + this.squareSize / 2},${ypos + (this.squareSize - 2)}`;
  };

  /**
   * @method
   * @private
   * @name turn
   * @description Given the current tile that the ant occupies,
   *            and the direction the ant is currently facing,
   *            turn the ant to the proper direction
   *
   * @param {Object} tile reference to a rect DOM element
   * @param {Number} antDirection direction the ant is facing
   *
   * @returns {Number} new ant direction
   */
  turn(tile, antDirection) {
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
   * @method
   * @private
   * @name move
   * @description given the ants current position and direction
   *            move will update the values of the position to
   *            reflect its new state.
   *
   * @param {Array} antPosition current position of the ant in the grid
   * @param {Number} antDirection current direction the ant is facing
   *
   * @returns {Number}
   */
  move(antPosition, antDirection) {
    if (0 == antDirection) {
      antPosition[0]--;
    } else if (1 == antDirection) {
      antPosition[1]--;
    } else if (2 == antDirection) {
      antPosition[0]++;
    } else {
      antPosition[1]++;
    }

    return antPosition;
  }

  /**
   * @method
   * @private
   * @name
   * @description
   *
   * @param {Array} antPosition current position of the ant in the grid
   * @param {Object} ant reference to the ant polygon DOM element
   * @param {Number} antDirection current direction the ant is facing
   */
  drawAnt(antPosition, ant, antDirection) {
    let xpos = antPosition[0] * this.squareSize;
    let ypos = antPosition[1] * this.squareSize;

    ant.setAttribute(
      "points",
      this.getDirectionFunction(antDirection)(xpos, ypos)
    );
  }

  /**
   * @method
   * @private
   * @name incrementColorAtTile
   * @description increments the color of the tile after the ant
   *        moves off of it in a loop.
   *        Black -> Red -> Yellow -> Blue -> Black
   *
   * @param {Object} tile reference to a rect DOM element
   */
  incrementColorAtTile(tile) {
    let colorCode = Number(tile.getAttribute("data-color"));
    const newCode = mod(colorCode + 1, 4);
    tile.setAttribute("data-color", newCode);

    tile.style["fill"] = this.CODE_TO_HEX[newCode];
  }
}

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
