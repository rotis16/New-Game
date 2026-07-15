// Metadata for the selectable visual themes. The actual colors/fonts live
// in global.css as CSS custom properties per [data-theme]; this list only
// drives the picker UI (label, blurb, and preview swatches).
export const THEMES = [
  {
    id: "trailhead",
    name: "Trailhead",
    blurb: "Sunlit and warm",
    swatches: ["#faf3e4", "#4f7859", "#d9714b", "#e8ac3e"],
    pageColor: "#faf3e4",
  },
  {
    id: "papermaze",
    name: "Paper Maze",
    blurb: "Bold and playful",
    swatches: ["#f6f1fb", "#ff6f59", "#1fa192", "#ffc857"],
    pageColor: "#f6f1fb",
  },
  {
    id: "nightsignal",
    name: "Night Signal",
    blurb: "Dark and glowing",
    swatches: ["#14121f", "#4fe3c1", "#ff6f91", "#7c6ff0"],
    pageColor: "#14121f",
  },
];

export const DEFAULT_THEME = "trailhead";
