import { defaultRoomAttempts, corridorTurnChance, types, dungeonWidth, dungeonHeight, Direction } from './Constants';
const dungeon = [];
const regions = [{cells: []}];
const workableHeight = dungeonHeight - 1;
const workableWidth = dungeonWidth - 1;
// eslint-disable-next-line no-unused-vars
const extraConnectorChance = 50;
let regionIdx; // An index of 0 in the array screws things up

const setCell = (x, y, type) => {
  if (!Array.isArray(dungeon[x])) dungeon[x] = [];
  dungeon[x][y] = {
    type,
    regionIdx
  }
  regions[regionIdx]['cells'].push({ x, y });
}

const createRegion = () => {
  regions.push({
    cells: []
  });
  regionIdx = regions.length - 1;
}

const init = () => {
  createRegion();
  for (let x = 0; x <= dungeonWidth; x++) {
    dungeon[x] = [];
    for (let y = 0; y <= dungeonHeight; y++) {
      setCell(x, y, types.WALL);
    }
  }
}

const randomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max)) + 1;
}

const isRoomFree = (top, left, height, width) => {
  for (let x = left - 1; x <= (left + width) + 1; x++) {
    for (let y = top - 1; y <= (top + height) + 1; y++) {
      if (dungeon[x][y]['type'] !== types.WALL) return false;
    }
  }
  return true;
}

const createRoom = (props) => {
  const { maxWidth = 3, maxHeight = 3 } = props;
  const width = (randomInt(maxWidth) * 2) + 1;
  const height = (randomInt(maxHeight) * 2) + 1;
  const top = (randomInt((workableHeight - height) / 2) * 2) - 1;
  const left = (randomInt((workableWidth - width) / 2) * 2) - 1;

  const save = isRoomFree(top, left, height, width);

  if (save) {
    createRegion();
    for (let x = left; x < (left + width); x++) {
      for (let y = top; y < (top + height); y++) {
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
}

const canTunnel = (cellPos) => {
  if (cellPos.x > workableWidth || cellPos.y > workableHeight || cellPos.x < 1 || cellPos.y < 1) return false;
  if (dungeon[cellPos.x][cellPos.y]['type'] === types.WALL) return true;
  return false;
}

const shiftCell = ({ x, y, dir }) => ({
  x: x + Direction[dir].x,
  y: y + Direction[dir].y
})

const createCorridor = (x, y) => {
  regions.push({ top: y, left: x });
  const cells = [];
  cells.push({ x, y });
  setCell(x, y, types.CORRIDOR);

  const directions = Object.keys(Direction);

  let lastDir = directions[randomInt(directions.length - 1)];

  while (cells.length > 0) {
    const cell = cells[cells.length - 1];
    const freeCells = [];

    directions.forEach(dir => {
      const testVec = shiftCell({ x: cell.x, y: cell.y, dir });
      const testVec2 = shiftCell({ x: testVec.x, y: testVec.y, dir });
      if (canTunnel(testVec) && canTunnel(testVec2)) freeCells.push(dir);
    });

    let dir;

    if (freeCells.length > 0) {
      if (freeCells.map(c => c.dir).includes(lastDir) && randomInt(100) > corridorTurnChance) {
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
}

// eslint-disable-next-line no-unused-vars
const oneIn = range => randomInt(range) === 1;

const addAdjacentRegionsToCell = ({ x, y }) => {
  const validTypes = [types.ROOM, types.CORRIDOR];

  const regions = Object.keys(Direction).reduce((regs, dir) => {
    const testPos = shiftCell({ x, y, dir });
    const potentialConnection = dungeon[testPos.x][testPos.y];
    if (validTypes.includes(potentialConnection.type) && !regs.includes(potentialConnection.regionIdx)) regs.push(potentialConnection.regionIdx);
    return regs;
  }, []);
  const baseCell = dungeon[x][y];
  return { ...baseCell, x, y, regions };
}

const addConnections = () => {
  let availableConnections = [];
  for (let x = 1; x < dungeonWidth; x++) {
    for (let y = 1; y < dungeonHeight; y++) {
      if (dungeon[x][y].type === types.WALL) {
        const potentialConnection = addAdjacentRegionsToCell({ x, y });
        if (potentialConnection.regions.length >= 2) {
          setCell(x, y, types.CONNECTION);
          availableConnections.push(potentialConnection);
        }
      }
    }
  }

  // return;
  const regionMap = [];
  let openRegions = [];
  regions.forEach((_, regionIdx) => {
    if (regionIdx > 0) {
      regionMap[regionIdx] = regionIdx;
      openRegions[regionIdx] = regionIdx;
    }
  });

  let iterations = 0;

  console.log('Started Iteration');
  while (openRegions.length > 1 && iterations < 5000) {

    iterations++;

    // Pick a random connector
    const connection = availableConnections[randomInt(availableConnections.length - 1)];

    // Set the random connector to a door
    setCell(connection.x, connection.y, types.DOOR);

    // Get the region for the connector
    const dest = connection.regions[0];

    // Get all other regions listed in this connection
    const sources = connection.regions.filter(source => source !== dest);

    // Map the other regions on the connection and map them to the destination region
    regions.forEach((_, regIdx) => {
      if (sources.includes(regionMap[regIdx])) regionMap[regIdx] = dest;
    })

    // Remove the sources from the list of open regions as they no longer "exist"
    // as they are part of the destination region now
    openRegions = openRegions.filter(r => !sources.includes(r));

    // Remove connections that aren't needed
    availableConnections = availableConnections.filter(cell => {
      // Don't allow connectors right next to each other.
      Object.keys(Direction).forEach(dir => {
        if (shiftCell({x: cell.x, y: cell.y, dir}).type === types.DOOR) {
          setCell(cell.x, cell.y, types.WALL);
          return false;
        }
      });

      // See how many regions this still spans
      const connectedRegions = cell.regions.reduce((regs, reg) => {
        const mappedRegion = regionMap[reg];
        if (!regs.includes(mappedRegion)) regs.push(mappedRegion);
        return regs;
      }, []);
      console.log(connectedRegions);
      // If this cell connects to more than one mapped region, 
      if (connectedRegions.length > 1) return true;

      // Add the occasional extra door to a room
      // if (oneIn(extraConnectorChance)) setCell(connection.x, connection.y, types.DOOR);
      return false;
    });
    console.log(`Completed iteration. ${openRegions.length} regions open.`);
  }
  if (iterations >= 5000) console.log('Max iterations reached');
}

export const createDungeon = (props = {}) => {
  init();

  const { roomAttempts = defaultRoomAttempts } = props;
  for (let i = 0; i < roomAttempts; i++) {
    createRoom({});
  }

  addCorridors();

  addConnections();

  return dungeon;
}
