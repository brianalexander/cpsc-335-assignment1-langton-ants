function getGrid() {
  let data = new Array();
  let xid = 0;
  let yid = 0;
  let xpos = 1;
  let ypos = 1;
  const width = 30;
  const height = 30;

  COLORS = {
    0: "#000",
    1: "#F00",
    2: "#FF0",
    3: "#00F"
  };

  trianglePos = [20, 20];
  /**
   * 0 - West
   * 1 - North
   * 2 - East
   * 3 - South
   */
  direction = 0;
  dirToText = {
    0: "West",
    1: "North",
    2: "East",
    3: "South"
  };

  tiles = new Array(41);
  for (let i = 0; i < 41; i++) {
    tiles[i] = new Array(41).fill(0);
  }

  // iterate for rows
  for (let row = 0; row < 41; row++) {
    data.push(new Array());

    for (let column = 0; column < 41; column++) {
      data[row].push({
        xid: xid,
        yid: yid,
        x: xpos,
        y: ypos,
        width: width,
        height: height
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

  return data;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function incrementColor(x, y) {
  tiles[x][y] = mod(tiles[x][y] + 1, 4);
  color = COLORS[tiles[x][y]];
  grid.select(`#x${x}y${y}`).style("fill", `${color}`);
}

function turn() {
  state = tiles[trianglePos[0]][trianglePos[1]];
  console.log(state);
  if (0 == state || 1 == state) {
    direction = mod(direction + 1, 4);
    // console.log("turn right");
  } else {
    direction = mod(direction - 1, 4);
    // console.log("turn left");
  }
}

function moveForward() {
  console.log(direction, dirToText[direction]);
  if (0 == direction) {
    trianglePos[0]--;
  } else if (1 == direction) {
    trianglePos[1]--;
  } else if (2 == direction) {
    trianglePos[0]++;
  } else {
    trianglePos[1]++;
  }
}
