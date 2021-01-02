import { defaultRoomAttempts, corridorTurnChance, types, dungeonWidth, dungeonHeight, Direction } from './Constants';
const dungeon = [];
const regions = [];
const workableHeight = dungeonHeight - 1;
const workableWidth = dungeonWidth - 1;

const setCell = (x, y, type) => {
  if (!Array.isArray(dungeon[x])) dungeon[x] = [];
  const region = type === types.WALL ? -1 : regions.length;
  dungeon[x][y] = {
    type,
    region
  }
  // push onto array for this region
}

const init = () => {
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
    regions.push({
      top, left, height, width
    });
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

const canHaveConnection = ({ x, y }) => {
  const validTypes = [types.ROOM, types.CORRIDOR];
  const prevX = dungeon[x - 1][y].type;
  const nextX = dungeon[x + 1][y].type;
  if (prevX !== nextX && validTypes.includes(prevX) && validTypes.includes(nextX)) return true
  const prevY = dungeon[x][y - 1].type;
  const nextY = dungeon[x][y + 1].type;
  if (prevY !== nextY && validTypes.includes(prevY) && validTypes.includes(nextY)) return true
  return false;
}

const addConnections = () => {
  for (let x = 1; x < dungeonWidth; x++) {
    for (let y = 1; y < dungeonHeight; y++) {
      if (dungeon[x][y].type === types.WALL && canHaveConnection({ x, y })) {
        setCell(x, y, types.CONNECTION);
      }
    }
  }

  // Start at the last region


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
