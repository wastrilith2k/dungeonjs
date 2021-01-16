export const scale = 8;
export const typeMap = ['wall', 'corridor', 'room', 'connection', 'door'];
export const dungeonHeight = 80;
export const dungeonWidth = 40;
export const defaultRoomAttempts = 200;
export const types = {
  WALL: 0,
  CORRIDOR: 1,
  ROOM: 2,
  CONNECTION: 3,
  DOOR: 4
};
export const Direction = {
  N: {
    x: 0,
    y: 1
  },
  S: {
    x: 0,
    y: -1
  },
  E: {
    x: 1,
    y: 0
  },
  W: {
    x: -1,
    y: 0
  }
};
export const corridorTurnChance = 20;