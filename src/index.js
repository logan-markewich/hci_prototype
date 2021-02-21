import { makeSprite, t } from "@replay/core";
import { StoreFloorplan } from "./storeScene";

export const options = {
  dimensions: "scale-up",
};

// Layers are rendered in order (bottom first)
export const Game = makeSprite({
  init({ device, preloadFiles, updateState }) {
    preloadFiles({
      imageFileNames: ["objects.png", "player.png", "footstep.png"],
      audioFileNames: [],
    }).then(() => {
      updateState((state) => {
        return {...state, view: "level"};
      });
    });

    return {
      view: "loading"
    };
  },

  render({ state }) {
    if (state.view === "loading") {
      return [
        t.text({
          color: "black",
          text: "Loading...",
        })
      ]
    }

    return [
      StoreFloorplan({
        id: 'level',
        tileSize: 35,
      }),
    ];
  },
});

export const gameProps = {
  id: "Game",
  size: {
    width: 600,
    height: 800,
    maxHeightMargin: 150,
    maxWidthMargin: 150,
  },
  defaultFont: {
    name: "Helvetica",
    size: 24,
  },
};