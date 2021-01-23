import {
  defaultRoomAttempts,
  corridorTurnChance,
  types,
  dungeonWidth,
  dungeonHeight,
  Direction,
  oneInXChanceOfExtraDoor,
  maxFillInPasses,
  fillInPercentage,
} from "./Constants";

console.log(dungeonHeight);
console.log(dungeonWidth);
const dungeon = [];
const workableHeight = dungeonHeight - 1;
const workableWidth = dungeonWidth - 1;
// eslint-disable-next-line no-unused-vars
const extraConnectorChance = 50;
let regionIdx = 0; // An index of 0 in the array screws things up

const setCell = (x, y, type) => {
  if (!Array.isArray(dungeon[x])) dungeon[x] = [];
  dungeon[x][y] = {
    type,
    regionIdx,
  };
};

const setCellType = (x, y, type) => {
  dungeon[x][y].type = type;
};
const createRegion = () => {
  regionIdx = regionIdx + 1;
};

const init = () => {
  for (let x = 0; x <= dungeonWidth; x++) {
    dungeon[x] = [];
    for (let y = 0; y <= dungeonHeight; y++) {
      setCell(x, y, types.WALL);
    }
  }
};

const randomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max)) + 1;
};

const isRoomFree = (top, left, height, width) => {
  for (let x = left - 1; x <= left + width + 1; x++) {
    for (let y = top - 1; y <= top + height + 1; y++) {
      if (dungeon[x][y]["type"] !== types.WALL) return false;
    }
  }
  return true;
};

const createRoom = (props) => {
  const { maxWidth = 3, maxHeight = 3 } = props;
  const width = randomInt(maxWidth) * 2 + 1;
  const height = randomInt(maxHeight) * 2 + 1;
  const top = randomInt((workableHeight - height) / 2) * 2 - 1;
  const left = randomInt((workableWidth - width) / 2) * 2 - 1;

  const save = isRoomFree(top, left, height, width);

  if (save) {
    createRegion();
    for (let x = left; x < left + width; x++) {
      for (let y = top; y < top + height; y++) {
        setCell(x, y, types.ROOM);
      }
    }
  }
};

const addCorridors = () => {
  // Loop until all valid areas are available starting in a corner
  for (let x = 1; x < dungeonWidth; x += 2) {
    for (let y = 1; y < dungeonHeight; y += 2) {
      // If open, start a corridor
      if (dungeon[x][y].type === types.WALL) createCorridor(x, y);
    }
  }
};

const canTunnel = (cellPos) => {
  if (
    cellPos.x > workableWidth ||
    cellPos.y > workableHeight ||
    cellPos.x < 1 ||
    cellPos.y < 1
  )
    return false;
  if (dungeon[cellPos.x][cellPos.y]["type"] === types.WALL) return true;
  return false;
};

const shiftCell = ({ x, y, dir }) => ({
  x: x + Direction[dir].x,
  y: y + Direction[dir].y,
});

const createCorridor = (x, y) => {
  const cells = [];
  cells.push({ x, y });
  createRegion();
  setCell(x, y, types.CORRIDOR);
  const directions = Object.keys(Direction);

  let lastDir = directions[randomInt(directions.length - 1)];

  while (cells.length > 0) {
    const cell = cells[cells.length - 1];
    const freeCells = [];

    directions.forEach((dir) => {
      const testVec = shiftCell({ x: cell.x, y: cell.y, dir });
      const testVec2 = shiftCell({ x: testVec.x, y: testVec.y, dir });
      if (canTunnel(testVec) && canTunnel(testVec2)) freeCells.push(dir);
    });

    let dir;

    if (freeCells.length > 0) {
      if (
        freeCells.map((c) => c.dir).includes(lastDir) &&
        randomInt(100) > corridorTurnChance
      ) {
        dir = lastDir;
      } else {
        dir = freeCells[randomInt(freeCells.length) - 1];
      }

      const newCell = shiftCell({ x: cell.x, y: cell.y, dir });
      setCell(newCell.x, newCell.y, types.CORRIDOR);
      const newCell2 = shiftCell({ x: newCell.x, y: newCell.y, dir });
      setCell(newCell2.x, newCell2.y, types.CORRIDOR);
      cells.push({ x: newCell2.x, y: newCell2.y });

      lastDir = dir;
    } else {
      cells.pop();
      lastDir = null;
    }
  }
};

// eslint-disable-next-line no-unused-vars
const oneIn = (range) => randomInt(range) === 1;

const addAdjacentRegionsToCell = ({ x, y }) => {
  const validTypes = [types.ROOM, types.CORRIDOR];
  const regions = Object.keys(Direction).reduce((regs, dir) => {
    const testPos = shiftCell({ x, y, dir });
    const potentialConnection = dungeon[testPos.x][testPos.y];
    if (
      validTypes.includes(potentialConnection.type) &&
      !regs.includes(potentialConnection.regionIdx)
    )
      regs.push(potentialConnection.regionIdx);
    return regs;
  }, []);
  const baseCell = dungeon[x][y];
  return { ...baseCell, x, y, regions };
};

const hasAdjacentConnection = (x, y) => {
  const adjacentConnections = surroundingTypeCount(x, y, types.DOOR);
  return !(adjacentConnections === 0);
};

const surroundingTypeCount = (x, y, type) => {
  let adjacentTypeCount = 0;
  Object.keys(Direction).forEach((dir) => {
    const cellToCheck = shiftCell({ x, y, dir });
    if (dungeon[cellToCheck.x][cellToCheck.y].type !== undefined) {
      cellToCheck.type = dungeon[cellToCheck.x][cellToCheck.y]["type"];
    }
    if (cellToCheck.type === type) {
      adjacentTypeCount = adjacentTypeCount + 1;
    }
  });
  return adjacentTypeCount;
};

const fillInDeadends = () => {
  let iterations = 0;
  let allPossibleFillsDone = false;
  while (iterations < maxFillInPasses && allPossibleFillsDone === false) {
    let fillCount = 0;
    iterations = iterations + 1;
    for (let x = 0; x <= dungeonWidth; x++) {
      for (let y = 0; y <= dungeonHeight; y++) {
        if (dungeon[x][y].type === types.CORRIDOR) {
          if (surroundingTypeCount(x, y, types.WALL) === 3) {
            if (randomInt(100) <= fillInPercentage) {
              fillCount = fillCount + 1;
              dungeon[x][y].type = types.WALL;
            }
          }
        }
      }
    }
    if (fillCount === 0) allPossibleFillsDone = true;
  }
  console.log(`Done filling in dead ends in ${iterations} iterations.`);
};

const addConnections = () => {
  let availableConnections = [];
  for (let x = 1; x < dungeonWidth; x++) {
    for (let y = 1; y < dungeonHeight; y++) {
      if (dungeon[x][y].type === types.WALL) {
        const potentialConnection = addAdjacentRegionsToCell({ x, y });
        if (potentialConnection.regions.length >= 2) {
          setCellType(x, y, types.CONNECTION);
          availableConnections.push(potentialConnection);
        }
      }
    }
  }

  const regionMap = [];
  let openRegions = [];
  console.log(regionIdx);
  for (let i = 1; i <= regionIdx; i++) {
    regionMap[i] = i;
    openRegions.push(i);
  }

  let iterations = 0;
  const maxIterations = openRegions.length * 2;

  while (openRegions.length > 1 && iterations < maxIterations) {
    iterations++;
    // Pick a random connector
    const connection =
      availableConnections[randomInt(availableConnections.length) - 1];
    if (connection === undefined) continue;
    // Set the random connector to a door
    setCellType(connection.x, connection.y, types.DOOR);
    // Find mapped regions for the connected regions of the current connector cell
    const mappedRegions = connection.regions.map((r) => regionMap[r]);
    // Get the region for the connector
    const dest = mappedRegions[0];
    // Get all other regions listed in this connection
    const sources = mappedRegions.filter((_, idx) => idx > 0);
    // Map the other regions on the connection and map them to the destination region
    for (let i = 1; i <= regionIdx; i++) {
      if (sources.includes(regionMap[i])) {
        regionMap[i] = dest;
      }
    }
    // Remove the sources from the list of open regions as they no longer "exist"
    // as they are part of the destination region now
    openRegions = openRegions.filter((r) => !sources.includes(r));

    // Remove connections that aren't needed
    availableConnections = availableConnections.filter((cell) => {
      // Remove current connection
      if (cell.x === connection.x && cell.y === connection.y) return false;

      // Don't allow connectors right next to each other.
      if (hasAdjacentConnection(cell.x, cell.y)) {
        setCellType(cell.x, cell.y, types.WALL);
        return false;
      }

      // See how many regions this still spans
      const connectedRegions = cell.regions.reduce((regs, reg) => {
        if (!regs.includes(regionMap[reg])) regs.push(regionMap[reg]);
        return regs;
      }, []);

      // If this cell connects to more than one mapped region,
      if (connectedRegions.length > 1) return true;

      setCellType(cell.x, cell.y, types.WALL);

      // Add the occasional extra door to a room
      if (oneIn(oneInXChanceOfExtraDoor)) setCell(cell.x, cell.y, types.DOOR);

      return false;
    });
  }
  if (iterations >= maxIterations) console.log("Max iterations reached");
  console.log(`Completed in ${iterations} iterations.`);

  // Remap regions
  for (let x = 0; x <= dungeonWidth; x++) {
    for (let y = 0; y <= dungeonHeight; y++) {
      dungeon[x][y].regionIdx = regionMap[dungeon[x][y].regionIdx];
    }
  }
};

export const createDungeon = (props = {}) => {
  init();

  const { roomAttempts = defaultRoomAttempts } = props;
  for (let i = 0; i < roomAttempts; i++) {
    createRoom({});
  }

  addCorridors();

  addConnections();

  fillInDeadends();

  return dungeon;
};
