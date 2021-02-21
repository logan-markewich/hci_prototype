import EasyStar from 'easystarjs';
import { makeSprite, t } from "@replay/core";
import { Player } from "./player";

const storeMap = mapDataString(`
# # # # # # # # # # # # # # # # #
# · W T # T · · W T · W · · · T #
# · · · · · · · · · · · · · · o ·
# o · · # · · · # # # # · · # # #
# # # # # · · · # W o W · · T W #
# C C C # · · · T · · · · · · · #
# o · · · · · · · · · · · · · o #
# # # # # # # # # # # # # # # # #
`);

const pathMap = storeMap.map((row) => { return row.map((tile) => { return tile === '·' ? 0 : 1 }) });
const easystar = new EasyStar.js();
easystar.setAcceptableTiles([0]);
easystar.setGrid(pathMap);
easystar.enableSync();


export const StoreFloorplan = makeSprite({
  init({ props }) {
    return {
      playerX: -2*props.tileSize,
      playerY: -2*props.tileSize,
      curPath: [],
      timePerStep: 10,
      timeSinceLastStep: 0,
      DEBUG: true,
    };
  },

  loop({ device, props, state, updateState }) {
    const { inputs } = device;
    const { tileSize } = props;
    let { playerX, playerY, curPath, timePerStep, timeSinceLastStep } = state; 

    // Do we follow curPath or user input?
    if (curPath.length > 0) {
      if (timeSinceLastStep >= timePerStep) {
        timeSinceLastStep = 0;
        const nextPos = curPath.pop();
        const [nextX, nextY] = gridToPixelCoord(nextPos.x, nextPos.y, tileSize, storeMap[0].length, storeMap.length);
        playerX = nextX;
        playerY = nextY;
      }
      else {
        timeSinceLastStep++;
      }
    }
    else {
      if (inputs.keysJustPressed["ArrowRight"]) {
        if (checkCollision(playerX + tileSize, playerY, tileSize, storeMap[0].length, storeMap.length)) {
          playerX += tileSize;
        }
      }
      else if (inputs.keysJustPressed["ArrowLeft"]) {
        if (checkCollision(playerX - tileSize, playerY, tileSize, storeMap[0].length, storeMap.length)) {
          playerX -= tileSize;
        }
      }
      else if (inputs.keysJustPressed["ArrowUp"]) {
        if (checkCollision(playerX, playerY + tileSize, tileSize, storeMap[0].length, storeMap.length)) {
          playerY += tileSize;
        }
      }
      else if (inputs.keysJustPressed["ArrowDown"]) {
        if (checkCollision(playerX, playerY - tileSize, tileSize, storeMap[0].length, storeMap.length)) {
          playerY -= tileSize;
        }
      }
      else if (inputs.pointer.justPressed) {
        let [toX, toY] = pixelToGridCoord(Math.round(inputs.pointer.x / tileSize) * tileSize, 
                                              Math.round(inputs.pointer.y / tileSize) * tileSize, 
                                              tileSize, storeMap[0].length, storeMap.length);
        const [gridX, gridY] = pixelToGridCoord(playerX, playerY, tileSize, storeMap[0].length, storeMap.length);
        
        // Do we need to find the next closest element?
        if (toY >= 0 && toY < pathMap.length && toX >= 0 && toX < pathMap[0].length && pathMap[toY][toX] == 1) {
          // Search clockwise around the target, starting with the point closest to the player position
          const searchAreas = [{x: toX-1, y: toY},
                               {x: toX, y: toY-1},
                               {x: toX+1, y: toY},
                               {x: toX, y: toY+1}];
          let bestDistance = 10000;
          for (const {x, y} of searchAreas) {
            const distance = Math.abs(x-gridX) + Math.abs(y-gridY);
            if (distance < bestDistance && pathMap[y][x] !== 1) {
              bestDistance = distance;
              toX = x;
              toY = y;
            }
          }
        }

        try {
          easystar.findPath(gridX, gridY, toX, toY, path => {
            if (path != null) {
              path = path.reverse();
              path.pop();
              updateState((state) => {
                const new_state = {...state, "curPath": path};
                return new_state;
              });
            }
          });
        } catch {
          // possibly out of range
        }
        easystar.calculate()
      }
    }

    return {
      playerX,
      playerY,
      curPath,
      timePerStep,
      timeSinceLastStep,
    }
  },

  render({ props, state }) {
    let { tileSize } = props;
    let mapHeight = storeMap.length;
    let mapWidth = storeMap[0].length;
    let tileX = -1 * Math.floor(mapWidth/2) * tileSize;
    let tileY = Math.floor(mapHeight/2) * tileSize;
    
    let tiles = [];
    for (const rowIndex in storeMap) {
      for (const tileIndex in storeMap[rowIndex]) {
        switch(storeMap[rowIndex][tileIndex]) {
          case '#':
            tiles.push(
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 25,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }));
            break;
          case '·':
            tiles.push(
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 24,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }));
            break;
          case 'o':
            tiles.push(
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 24,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }),
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 8,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }));
            break;
          case 'W':
            tiles.push(
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 24,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }),
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 16,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }));
            break;
          case 'T':
            tiles.push(
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 24,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }),
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 17,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }));
            break;
          case 'C':
            tiles.push(
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 24,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }),
              t.spriteSheet({
                fileName: "objects.png",
                columns: 8,
                rows: 4,
                index: 19,
                width: tileSize+0.75,
                height: tileSize+0.75,
                x: tileX,
                y: tileY,
              }));
            break;
          default:
            break;
        }
        
        tileX = tileX + tileSize;
        if (tileX > Math.floor(mapWidth/2) * tileSize) {
          tileX = -1 * Math.floor(mapWidth/2) * tileSize;
        }
      }
      tileY = tileY - tileSize;
    }

    tiles.push(Player({
      id: "player", 
      playerSize: tileSize/2 - 1, 
      playerX: state.playerX, 
      playerY: state.playerY}));

    if (state.DEBUG) {
      console.log(tiles);
    }
    return tiles;
  },
});

export function mapDataString(str) {
  const lineBreak = '\n';
  const data = [];
  let line = -1;
  let string = str;
  // strip any break at the end
  if (string[string.length - 1] === lineBreak) {
      string = string.slice(0, -1);
  }
  for (const char of string) {
      if (char === ' ') continue;
      if (char === lineBreak) {
          data[++line] = [];
      } else {
          data[line].push(char);
      }
  }
  return data;
}

export function checkCollision(x, y, tileSize, mapWidth, mapHeight) {
  const [gridX, gridY] = pixelToGridCoord(x, y, tileSize, mapWidth, mapHeight);

  return storeMap[gridY][gridX] === '·' ? true : false;
}

export function pixelToGridCoord(x, y, tileSize, mapWidth, mapHeight) {
  const h = -1 * Math.floor(mapWidth / 2) * tileSize;
  const k = Math.floor(mapHeight / 2) * tileSize;

  x = x - h;
  y = y - k;

  x = x / tileSize;
  y = Math.abs(y / tileSize);

  return [x, y];
}

export function gridToPixelCoord(x, y, tileSize, mapWidth, mapHeight) {
  const h = -1 * Math.floor(mapWidth / 2) * tileSize;
  const k = Math.floor(mapHeight / 2) * tileSize;

  x = x * tileSize;
  y = y * tileSize;

  x = x + h;
  y = (-1*y) + k;

  return [x, y];
}
