const dungeon = [];
const dungeonHeight = 80;
const dungeonWidth = 160;
const WALL = 0;
// const CORRIDOR = 1;
const ROOM = 2;


for (let x = 0; x < dungeonWidth; x++) {
  dungeon[x] = [];
  for (let y = 0; y < dungeonHeight; y++) {

    dungeon[x][y] = {type: WALL};
  }
}

const workableHeight = dungeonHeight - 2;
const workableWidth = dungeonWidth - 2;

const randomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max)) +1;
}

const isRoomFree = (top, left, height, width) => {
  for (let x = left - 1; x <= (left + width) + 1; x++) {
    for (let y = top - 1; y <= (top + height) + 1; y++) {
      if (dungeon[x][y]['type'] !== WALL) return false;
    }
  }
  return true;
}

const createRoom = (props) => {
  const {maxWidth = 5, maxHeight = 5, roomIdx = -1} = props;
  const width = randomInt(maxWidth - 1) + 1;
  const height = randomInt(maxHeight - 1) + 1;

  const top = randomInt(workableHeight - height);
  const left = randomInt(workableWidth - width);

  const save = isRoomFree(top, left, height, width);

  if (save) {
    console.log('Creating room');
    for (let x = left; x < (left + width); x++) {
      for (let y = top; y < (top + height); y++) {
        dungeon[x][y] = {type: ROOM, roomIdx};
      }
    }
  }
};

// const addCorridors = () => {

// }

export const createDungeon = (props = {}) => {
  const { roomAttempts = 500 } = props;
  for (let i = 0; i < roomAttempts; i++) {
    createRoom({roomIdx: i});
  }

  return dungeon;
}

createDungeon({});
