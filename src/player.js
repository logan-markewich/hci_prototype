import { makeSprite, t } from "@replay/core";

export const Player = makeSprite({
  render({ props }) {
    let { playerSize, playerX, playerY } = props;
    return [
      t.circle({
        radius: playerSize,
        x: playerX,
        y: playerY,
        color: "orange",
      }),
    ];
  }
});