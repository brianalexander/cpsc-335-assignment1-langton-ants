function mod(n, m) {
  return ((n % m) + m) % m;
}

class Grid {
  COLORS = {
    0: "#000", // BLACK
    1: "#F00", // RED
    2: "#FF0", // YELLOW
    3: "#00F" // BLUE
  };

  constructor(id, x = 41, y = 41, width = 30, height = 30) {
    this.grid = this.makeGrid(id, x, y, width, height);
    this.ants = [];
  }

  add(ant) {
    this.ant = ant;
    this.drawAnt(ant.x, ant.y, ant.direction);
  }

  drawAnt(x, y, direction) {
    console.log(x, y);
    const tile = this.tiles[x][y];
    const xpos = tile.xpos;
    const ypos = tile.ypos;

    const triangle = [
      { x: ypos + 5, y: xpos + 5 },
      { x: ypos + 25, y: xpos + 5 },
      { x: ypos + 15, y: xpos + 25 }
    ];

    this.grid
      .selectAll(`polygon`)
      .data([triangle])
      .enter()
      .append("polygon")
      .attr("id", "ant")
      .attr("points", function(triangle) {
        return triangle
          .map(function(point) {
            return [point.x, point.y].join(",");
          })
          .join(" ");
      })
      .style("fill", "#fff")
      .style("stroke", "#000");
  }

  removeAnt() {
    this.grid.select("#ant").remove();
  }

  iterate() {
    const ant = this.ant;

    // Turn the ant based on the current tiles state
    ant.turn(this.getStateOfTile(ant.x, ant.y));
    console.log("new direction", ant.direction);

    // Update tile color
    this.incrementColorAtTile(ant.x, ant.y);

    // Move the ant
    ant.moveForward();

    // Re-render ant
    this.removeAnt();
    this.drawAnt(ant.x, ant.y, ant.direction);
  }

  makeGrid(id, x, y, width, height) {
    let tiles = new Array();
    let xid = 0;
    let yid = 0;
    let xpos = 1;
    let ypos = 1;

    // iterate for rows
    for (let row = 0; row < y; row++) {
      tiles.push(new Array());

      for (let column = 0; column < x; column++) {
        tiles[row].push({
          x: xid,
          y: yid,
          xpos: xpos,
          ypos: ypos,
          width: width,
          height: height,
          color: 0
        });

        // increment the x position. I.e. move it over by 50
        xpos += width;
        xid += 1;
      }

      // reset the x position after a row is complete
      xpos = 1;
      xid = 0;
      // increment the y position for the next row.  Move it down 50
      ypos += height;
      yid += 1;
    }

    this.tiles = tiles;

    let svg_width = x * width + 1;
    let svg_height = y * height + 1;

    let grid = d3
      .select("#" + id)
      .append("svg")
      .attr("width", `${svg_width}px`)
      .attr("height", `${svg_height}px`);

    let rows = grid
      .selectAll()
      .data(tiles)
      .enter()
      .append("g")
      .attr("class", "row");

    rows
      .selectAll()
      .data(function(row) {
        return row;
      })
      .enter()
      .append("rect")
      .attr("class", function(square) {
        return "square";
      })
      .attr("id", function(square) {
        return ["x" + square.x, "y" + square.y].join("");
      })
      .attr("x", function(square) {
        return square.xpos;
      })
      .attr("y", function(square) {
        return square.ypos;
      })
      .attr("width", function(square) {
        return square.width;
      })
      .attr("height", function(square) {
        return square.height;
      })
      .style("fill", "#000")
      .style("stroke", "#fff");

    return grid;
  }

  incrementColorAtTile(x, y) {
    // increment virtual tile
    this.tiles[x][y].color = mod(this.tiles[x][y].color + 1, 4);

    // get the new color for virtual tile
    const color = this.COLORS[this.tiles[x][y].color];

    // update color on grid
    // console.log(`#x${x}y${y}`);
    this.grid.select(`#x${x}y${y}`).style("fill", `${color}`);
  }

  getStateOfTile(x, y) {
    return this.tiles[x][y].color;
  }
}

class Ant {
  dirToText = {
    0: "West",
    1: "North",
    2: "East",
    3: "South"
  };

  constructor(x = 21, y = 21, direction = 0) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  /**
   * Set the ants direction based on the input color,
   * turning right for _ and _ and left for _ and _.
   */
  turn(state) {
    if (0 == state || 1 == state) {
      // if black or red
      this.direction = mod(this.direction + 1, 4); // turn right
    } else {
      // if blue or yellow
      this.direction = mod(this.direction - 1, 4); // turn left
    }
  }

  /**
   * Move the ant forward inside a 2D array
   * with 0,0 being the top left corner.
   */
  moveForward() {
    if (0 == this.direction) {
      this.x--;
    } else if (1 == this.direction) {
      this.y--;
    } else if (2 == this.direction) {
      this.x++;
    } else {
      this.y++;
    }
  }

  getAntState() {
    return { x: this.x, y: this.y, direction: this.direction };
  }
}
