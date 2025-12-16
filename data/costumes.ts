import { staticCostumes } from "./staticAssets";

export type Costume = {
  image_path: number;
  name: string;
  price: number;
};

export const costumes: Costume[] = [
  {
    image_path: staticCostumes.cowboyCostume,
    name: "Cowboy",
    price: 50,
  },
  {
    image_path: staticCostumes.pirateCostume,
    name: "Pirate",
    price: 200,
  },
  {
    image_path: staticCostumes.robotCostume,
    name: "Robot",
    price: 500,
  },
];
