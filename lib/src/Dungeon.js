'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var dungeon = [];
var dungeonHeight = 80;
var dungeonWidth = 160;
var WALL = 0;
var CORRIDOR = 1;
var ROOM = 2;

for (var x = 0; x < dungeonWidth; x++) {
  dungeon[x] = [];
  for (var y = 0; y < dungeonHeight; y++) {
    dungeon[x][y] = WALL;
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
      if (dungeon[_x][_y] !== WALL) return false;
    }
  }
  return true;
};

var createRoom = function createRoom() {
  var maxWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
  var maxHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  var width = randomInt(maxWidth);
  var height = randomInt(maxHeight);

  var top = randomInt(workableHeight - height);
  var left = randomInt(workableWidth - width);

  var save = isRoomFree(top, left, height, width);

  if (save) {
    console.log('Creating room');
    for (var _x4 = left; _x4 <= left + width; _x4++) {
      for (var _y2 = top; _y2 <= top + height; _y2++) {
        dungeon[_x4][_y2] = ROOM;
      }
    }
  }
};

var createDungeon = exports.createDungeon = function createDungeon(_ref) {
  var _ref$roomAttempts = _ref.roomAttempts,
      roomAttempts = _ref$roomAttempts === undefined ? 200 : _ref$roomAttempts;

  for (var i = 0; i < roomAttempts; i++) {
    createRoom();
  }
  return;
};

createDungeon({});