function mod(n, m) {
  return ((n % m) + m) % m;
}

class Grid {
  COLORS = {
    0: "#000",
    1: "#F00",
    2: "#FF0",
    3: "#00F"
  };

  constructor(id, x = 41, y = 41, width = 30, height = 30) {
    super(this);
    this.grid = this.makeGrid(id, x, y, width, height);
  }

  makeGrid(id, x, y, width, height) {
    let gridData = new Array();
    let xid = 0;
    let yid = 0;
    const width = width;
    const height = height;

    tiles = new Array(41);
    for (let i = 0; i < 41; i++) {
      tiles[i] = new Array(41).fill(0);
    }

    // iterate for rows
    for (let row = 0; row < y; row++) {
      gridData.push(new Array());

      for (let column = 0; column < x; column++) {
        gridData[row].push({
          xid: xid,
          yid: yid,
          width: width,
          height: height
        });

        // increment the x position. I.e. move it over by 50
        xid += 1;
      }

      // reset the x position after a row is complete
      xid = 0;
      // increment the y position for the next row.  Move it down 50
      yid += 1;
    }

    let grid = d3
      .select("#" + id)
      .append("svg")
      .attr("width", "1232px")
      .attr("height", "1232px");
    console.log("grid", grid);

    let rows = grid
      .selectAll()
      .data(gridData)
      .enter()
      .append("g")
      .attr("class", "row");

    let squares = rows
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
        return ["x" + square.xid, "y" + square.yid].join("");
      })
      .attr("x", function(square) {
        return square.x;
      })
      .attr("y", function(square) {
        return square.y;
      })
      .attr("width", function(square) {
        return square.width;
      })
      .attr("height", function(square) {
        return square.height;
      })
      .style("fill", "#000")
      .style("stroke", "#fff");

    }

  incrementColor(x, y) {
    tiles[x][y] = mod(tiles[x][y] + 1, 4);
    color = COLORS[tiles[x][y]];
    grid.select(`#x${x}y${y}`).style("fill", `${color}`);
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
    super(this);
    this.x = x;
    this.y = y;
    this.direction = direction;
    // this.drawAnt();
  }

  //   drawAnt(x, y) {}

  turn() {
    state = tiles[this.x][this.y];
    console.log(state);
    if (0 == state || 1 == state) {
      this.direction = mod(this.direction + 1, 4);
      // console.log("turn right");
    } else {
      this.direction = mod(this.direction - 1, 4);
      // console.log("turn left");
    }
  }

  moveForward() {
    console.log(this.direction, dirToText[this.direction]);
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
}
