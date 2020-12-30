'use strict';

var cells = [];
var dungeonHeight = 80;
var dungeonWidth = 160;
var WALL = 0;
// const roomTries = 200;

for (var x = 0; x < dungeonWidth; x++) {
  cells[x] = [];
  for (var y = 0; y < dungeonHeight; y++) {
    cells[x][y] = WALL;
  }
}

var workableHeight = dungeonHeight - 2;
var workableWidth = dungeonWidth - 2;

var randomInt = function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max)) + 1;
};

var isRoomFree = function isRoomFree(top, left, height, width) {
  for (var _x = left; _x <= left + width; _x++) {
    for (var _y = top; _y <= top + height; _y++) {
      // console.log(`x: ${x}, y: ${y}`)
      if (cells[_x][_y] !== WALL) return false;
    }
  }
  return true;
};

var createRoom = function createRoom() {
  var width = randomInt(5);
  var height = randomInt(5);

  var top = randomInt(workableHeight - height);
  var left = randomInt(workableWidth - width);

  var save = isRoomFree(top, left, height, width);
  console.log(save);
  if (save) {
    for (var _x2 = left; _x2 <= left + width; _x2++) {
      for (var _y2 = top; _y2 <= top + height; _y2++) {
        cells[_x2][_y2] = 1;
      }
    }
  }
};

for (var i = 0; i < 100; i++) {
  console.log('Creating room');
  createRoom();
}