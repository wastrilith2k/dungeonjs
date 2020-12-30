const cells = [];
const dungeonHeight = 80;
const dungeonWidth = 160;
const WALL = 0;
// const roomTries = 200;

for (let x = 0; x < dungeonWidth; x++) {
  cells[x] = [];
  for (let y = 0; y < dungeonHeight; y++) {
    cells[x][y] = WALL;
  }
}

const workableHeight = dungeonHeight - 2;
const workableWidth = dungeonWidth - 2;

const randomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max)) +1;
}

const isRoomFree = (top, left, height, width) => {
  for (let x = left; x <= (left + width); x++) {
    for (let y = top; y <= (top + height); y++) {
      // console.log(`x: ${x}, y: ${y}`)
      if (cells[x][y] !== WALL) return false;
    }
  }
  return true;
}

const createRoom = () => {
  const width = randomInt(5);
  const height = randomInt(5);

  const top = randomInt(workableHeight - height);
  const left = randomInt(workableWidth - width);

  const save = isRoomFree(top, left, height, width);
  console.log(save);
  if (save) {
    for (let x = left; x <= (left + width); x++) {
      for (let y = top; y <= (top + height); y++) {
        cells[x][y] = 1;
      }
    }
  }
};

for (let i = 0; i < 100; i++) {
  console.log('Creating room');
  createRoom();
}